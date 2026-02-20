import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

df = pd.read_csv("data/cleaned/cleaned_1766916072663-small_business_sales.csv")  ## Load cleaned datase

print("Dataset Shape:", df.shape)

# Features and Target
X = df[['quantity', 'unit_price']]  ## Features
y = df['sales']   ##Target


scaler = StandardScaler() # Feature Scaling
X_scaled = scaler.fit_transform(X)


X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42                 ## Train Test Split
)


model = tf.keras.Sequential([            ##Improved Model (Deeper Architecture)
    tf.keras.Input(shape=(2,)),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(1)
])


optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)  ##Compile with controlled learning rate

model.compile(
    optimizer=optimizer,
    loss='mse',
    metrics=['mae']
)


history = model.fit(
    X_train, y_train,  ##Train model
    epochs=100,
    validation_data=(X_test, y_test),
    verbose=1
)



loss, mae = model.evaluate(X_test, y_test)  #Evaluate

print("\nImproved Model Test MAE:", mae)