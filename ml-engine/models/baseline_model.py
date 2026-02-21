import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# ── 1. Load Dataset ───────────────────────────────────────────────────────────
df = pd.read_csv("C:\\Users\\sachi\\OneDrive\\Desktop\\DataInsight.ai\\ml-engine\\data\\cleaned\\cleaned_1766120913900-BikeRentalData.csv")

# Drop leakage & ID columns
drop_cols = [c for c in ["instant", "dteday", "casual", "registered"] if c in df.columns]
df = df.drop(columns=drop_cols)
print("Dataset Shape:", df.shape)

# ── 2. Cyclical Feature Engineering ──────────────────────────────────────────
# Hours, months, seasons and weekdays are circular — sin/cos encoding captures
# the true distance (e.g. hour 23 is close to hour 0, not far away)
for col, period in [("hr", 24), ("mnth", 12), ("season", 4), ("weekday", 7)]:
    if col in df.columns:
        df[f"{col}_sin"] = np.sin(2 * np.pi * df[col] / period)
        df[f"{col}_cos"] = np.cos(2 * np.pi * df[col] / period)
        df = df.drop(columns=[col])  # drop original since encoded version is better

# ── 3. Prepare Features & Target ─────────────────────────────────────────────
X = df.drop("cnt", axis=1)
y = df["cnt"]

X = pd.get_dummies(X)  # encode any remaining categoricals

# ── 4. Train / Test Split ─────────────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ── 5. Feature Scaling ────────────────────────────────────────────────────────
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test  = scaler.transform(X_test)

# ── 6. Improved Model ─────────────────────────────────────────────────────────
tf.random.set_seed(42)

model = tf.keras.Sequential([
    tf.keras.layers.Dense(256, activation='relu', input_shape=(X_train.shape[1],),
                          kernel_regularizer=tf.keras.regularizers.l2(0.001)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3),

    tf.keras.layers.Dense(128, activation='relu',
                          kernel_regularizer=tf.keras.regularizers.l2(0.001)),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.2),

    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.1),

    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(1)
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
    loss='mse',
    metrics=['mae']
)

model.summary()

# ── 7. Callbacks ──────────────────────────────────────────────────────────────
callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor='val_mae', patience=15, restore_best_weights=True, verbose=1
    ),
    tf.keras.callbacks.ReduceLROnPlateau(
        monitor='val_mae', factor=0.5, patience=7, min_lr=1e-6, verbose=1
    )
]

# ── 8. Train ──────────────────────────────────────────────────────────────────
history = model.fit(
    X_train, y_train,
    epochs=200,
    batch_size=64,
    validation_data=(X_test, y_test),
    callbacks=callbacks,
    verbose=1
)

# ── 9. Evaluate ───────────────────────────────────────────────────────────────
loss, mae = model.evaluate(X_test, y_test, verbose=0)
print(f"\n Baseline MAE : 67.10 bikes")
print(f" Improved MAE : {mae:.2f} bikes")
print(f"   Improvement  : {67.10 - mae:.2f} fewer bikes error")
