# Baseline Model Results

## Dataset
Bike Rental Dataset (BikeRentalData.csv)
- Source: Cleaned dataset from `ml-engine/data/cleaned/`
- Shape: 17,377 rows × 13 columns (after dropping leakage columns)

## Model Type
Improved Neural Network — TensorFlow Sequential

## Features Used
- `yr`, `holiday`, `workingday`, `weathersit`, `temp`, `atemp`, `hum`, `windspeed`
- Cyclical encoded: `hr_sin`, `hr_cos`, `mnth_sin`, `mnth_cos`, `season_sin`, `season_cos`, `weekday_sin`, `weekday_cos`

## Target Variable
`cnt` (total bike rentals per hour)

## Architecture
| Layer | Units | Extras |
|-------|-------|--------|
| Dense | 256 | ReLU, L2(0.001) |
| BatchNormalization + Dropout(0.3) | — | — |
| Dense | 128 | ReLU, L2(0.001) |
| BatchNormalization + Dropout(0.2) | — | — |
| Dense | 64 | ReLU |
| BatchNormalization + Dropout(0.1) | — | — |
| Dense | 32 | ReLU |
| Dense | 1 | Output |

## Training Parameters
- Optimizer: Adam (lr=0.001)
- Loss: Mean Squared Error
- Max Epochs: 200 (EarlyStopping on val_mae, patience=15)
- Batch Size: 64
- ReduceLROnPlateau: factor=0.5, patience=7

## Results

| Model | MAE |
|-------|-----|
| Baseline (32→16, 50 epochs, no encoding) | 67.10 bikes |
| **Improved (256→128→64→32, cyclical encoding, callbacks)** | **~23.26 bikes** |
| **Improvement** | **~43.84 fewer bikes error (65% reduction)** |

## Key Observations
1. **Cyclical sin/cos encoding** for `hr`, `mnth`, `season`, `weekday` was the biggest accuracy driver
2. **Deeper architecture** with BatchNorm + Dropout significantly reduced overfitting
3. **EarlyStopping** restored best weights, avoiding overfitting on later epochs
4. **ReduceLROnPlateau** helped fine-tune convergence
5. 17,377 rows provided sufficient data for a robust generalization
