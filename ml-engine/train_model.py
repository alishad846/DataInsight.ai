import pandas as pd
import sys
import os
import json
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import accuracy_score, mean_squared_error
from sklearn.preprocessing import LabelEncoder


def detect_problem_type(y):
    if y.nunique() <= 10:
        return "classification"
    return "regression"


def encode_categorical_columns(df):
    encoders = {}
    for col in df.select_dtypes(include=["object"]).columns:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
    return df, encoders


def train_model(cleaned_file):
    df = pd.read_csv(cleaned_file)

    # 🔥 THIS IS THE CRITICAL FIX
    df, label_encoders = encode_categorical_columns(df)

    # assume last column is target
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]

    problem_type = detect_problem_type(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    if problem_type == "classification":
        models = {
            "LogisticRegression": LogisticRegression(max_iter=1000),
            "RandomForestClassifier": RandomForestClassifier(random_state=42),
        }
    else:
        models = {
            "LinearRegression": LinearRegression(),
            "RandomForestRegressor": RandomForestRegressor(random_state=42),
        }

    best_model = None
    best_score = -1
    best_model_name = ""

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        if problem_type == "classification":
            score = accuracy_score(y_test, preds)
        else:
            mse = mean_squared_error(y_test, preds)
            score = 1 / (mse + 1e-6)

        if score > best_score:
            best_score = score
            best_model = model
            best_model_name = name

    os.makedirs("models", exist_ok=True)
    os.makedirs("metrics", exist_ok=True)

    model_path = f"models/{best_model_name}.joblib"
    encoder_path = "models/label_encoders.joblib"

    joblib.dump(best_model, model_path)
    joblib.dump(label_encoders, encoder_path)

    metrics = {
        "problem_type": problem_type,
        "model": best_model_name,
        "score": float(abs(best_score)),
        "features": list(X.columns),
        "target": y.name,
    }

    with open("metrics/metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)

    return {
        "model_file": model_path,
        "encoder_file": encoder_path,
        "metrics_file": "metrics/metrics.json",
    }


if __name__ == "__main__":
    cleaned_file_path = sys.argv[1]
    result = train_model(cleaned_file_path)
    print(json.dumps(result))
