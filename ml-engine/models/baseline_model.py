import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


df = pd.read_csv("data/cleaned/cleaned_1766916072663-small_business_sales.csv") ##lode the cleaned dataset
print("Dataset Shape:", df.shape)


X = df.drop("sales", axis=1)    # Separate features (X) and target (Y)
y = df["sales"]

X = pd.get_dummies(X) ## Convert categorical columns to numeric

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42            ##  Train-test split
        
)


scaler = StandardScaler()
X_train = scaler.fit_transform(X_train) ## Feature Scaling
X_test = scaler.transform(X_test)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(32, activation='relu', input_shape=(X_train.shape[1],)),  ## Build Model
    tf.keras.layers.Dense(16, activation='relu'),
    tf.keras.layers.Dense(1)  
])

model.compile(
    optimizer='adam',
    loss='mse',          ## comlplite the modle
    metrics=['mae']
)


history = model.fit(
    X_train, y_train,
    epochs=50,                     ## Train model
    validation_data=(X_test, y_test),verbose = 1
)


loss, mae = model.evaluate(X_test, y_test)   # Evaluate model
print("\nFinal Test MAE:", mae)
