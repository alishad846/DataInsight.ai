import os
import json
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import accuracy_score, mean_squared_error, r2_score
from sklearn.preprocessing import LabelEncoder


TARGET_COLUMN = "Sales"


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


def train_model(df):

    df = df.copy()

    # Encode categorical columns
    df, label_encoders = encode_categorical_columns(df)

    # Remove datetime columns
    df = df.select_dtypes(exclude=["datetime64[ns]"])

    # Proper target handling
    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Target column '{TARGET_COLUMN}' not found in dataset")

    X = df.drop(columns=[TARGET_COLUMN])
    y = df[TARGET_COLUMN]

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
    best_metrics_details = {}

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        if problem_type == "classification":
            acc = accuracy_score(y_test, preds)
            score = acc
            metrics_details = {
                "accuracy": float(acc)
            }
        else:
            # Version-safe RMSE
            mse = mean_squared_error(y_test, preds)
            rmse = mse ** 0.5
            r2 = r2_score(y_test, preds)

            score = r2  # use R² for comparison
            metrics_details = {
                "rmse": float(rmse),
                "r2_score": float(r2)
            }

        if score > best_score:
            best_score = score
            best_model = model
            best_model_name = name
            best_metrics_details = metrics_details

    # Create output folders
    os.makedirs("models", exist_ok=True)
    os.makedirs("metrics", exist_ok=True)

    model_path = f"models/{best_model_name}.joblib"
    encoder_path = "models/label_encoders.joblib"

    joblib.dump(best_model, model_path)
    joblib.dump(label_encoders, encoder_path)

    metrics = {
        "problem_type": problem_type,
        "model": best_model_name,
        "comparison_score": float(best_score),
        "details": best_metrics_details,
        "features": list(X.columns),
        "target": TARGET_COLUMN,
    }

    with open("metrics/metrics.json", "w") as f:
        json.dump(metrics, f, indent=4)

    print("Model training completed")
    print("Best Model:", best_model_name)
    print("Metrics:", best_metrics_details)

    return {
        "model_file": model_path,
        "encoder_file": encoder_path,
        "metrics_file": "metrics/metrics.json",
    }


if __name__ == "__main__":
    print("Use this file through pipeline only.")