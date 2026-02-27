import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_squared_error
import matplotlib.pyplot as plt
import warnings
warnings.filterwarnings("ignore")

# Reproducibility
np.random.seed(42)
tf.random.set_seed(42)

# Load Data
df = pd.read_csv("../data/processed/cleaned_superstore.csv")
print("Dataset Shape:", df.shape)

X = df.drop("sales", axis=1)
y = df["sales"]

X = pd.get_dummies(X)

# Proper Train / Validation / Test Split
X_train, X_temp, y_train, y_temp = train_test_split(
    X, y, test_size=0.3, random_state=42
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp, y_temp, test_size=0.5, random_state=42
)

scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_val   = scaler.transform(X_val)
X_test  = scaler.transform(X_test)

INPUT_DIM = X_train.shape[1]


# ─────────────────────────────────────────
# 2. IMPROVED MODEL
# ─────────────────────────────────────────
print("\n" + "="*50)
print("         MODEL TRAINING")
print("="*50)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, input_shape=(INPUT_DIM,)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Activation('relu'),
    tf.keras.layers.Dropout(0.2),

    tf.keras.layers.Dense(64),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Activation('relu'),
    tf.keras.layers.Dropout(0.2),

    tf.keras.layers.Dense(32),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Activation('relu'),

    tf.keras.layers.Dense(16, activation='relu'),
    tf.keras.layers.Dense(1)
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0005),
    loss='mse',
    metrics=['mae']
)

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_loss',
        mode='min',
        patience=15,
        restore_best_weights=True,
        verbose=1
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        mode='min',
        factor=0.5,
        patience=7,
        min_lr=1e-6,
        verbose=1
    )
]

history = model.fit(
    X_train, y_train,
    validation_data=(X_val, y_val),
    epochs=200,
    callbacks=callbacks,
    verbose=1
)


# ─────────────────────────────────────────
# 3. FINAL TEST EVALUATION (ONLY ONCE)
# ─────────────────────────────────────────
test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)
preds = model.predict(X_test).flatten()

test_r2   = r2_score(y_test, preds)
test_rmse = np.sqrt(mean_squared_error(y_test, preds))

print("\n" + "="*50)
print("           TEST METRICS")
print("="*50)
print(f"Test MAE  : {test_mae:.4f}")
print(f"Test RMSE : {test_rmse:.4f}")
print(f"Test R²   : {test_r2:.4f}")


# ─────────────────────────────────────────
# 4. IMPROVED OVERFITTING DIAGNOSIS
# ─────────────────────────────────────────
final_train_loss = history.history['loss'][-1]
final_val_loss   = history.history['val_loss'][-1]

ratio = final_val_loss / (final_train_loss + 1e-9)

print("\n" + "="*50)
print("       FIT DIAGNOSIS")
print("="*50)
print(f"Final Train Loss : {final_train_loss:.4f}")
print(f"Final Val Loss   : {final_val_loss:.4f}")

if ratio > 1.3:
    print("⚠ OVERFITTING detected (validation loss significantly higher).")
elif ratio < 1.05:
    print("✓ Train and validation losses closely aligned.")
else:
    print("✓ Acceptable generalization gap.")


# ─────────────────────────────────────────
# 5. SINGLE MEANINGFUL VISUALIZATION
#    (Prediction vs Actual Scatter)
# ─────────────────────────────────────────
plt.figure(figsize=(7, 6))
plt.scatter(y_test, preds, alpha=0.6)
plt.plot([y_test.min(), y_test.max()],
         [y_test.min(), y_test.max()],
         linestyle='--')
plt.xlabel("Actual Sales")
plt.ylabel("Predicted Sales")
plt.title("Prediction vs Actual (Test Set)")
plt.tight_layout()
plt.savefig("prediction_vs_actual.png", dpi=150)
print("\n✓ Saved: prediction_vs_actual.png")

plt.show()