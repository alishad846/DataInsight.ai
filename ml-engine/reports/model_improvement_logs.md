# 📊 Experiment Log – Day 6 Model Improvement

**Date:** 21 Feb 2026  
**Dataset:** cleaned_superstore.csv  
**Rows:** 9,789  
**Target:** sales  

---

## 🔹 Model Configuration

- Optimizer: Adam (learning_rate=0.0005)
- Loss: MSE
- Metrics: MAE
- Max Epochs: 200
- EarlyStopping: patience=15
- ReduceLROnPlateau: factor=0.5, patience=7

### Architecture

128 → BatchNorm → ReLU → Dropout(0.2)  
64  → BatchNorm → ReLU → Dropout(0.2)  
32  → BatchNorm → ReLU  
16  → ReLU  
Output → 1 neuron  

---

## 🔹 Training Summary

- Training stopped at: **Epoch 51**
- Best model restored from: **Epoch 36**

Final Loss:
- Train Loss: **107,955**
- Validation Loss: **390,063**

Diagnosis: ⚠ Overfitting (large train–validation gap)

---

## 🔹 Test Performance

| Metric | Value |
|--------|--------|
| MAE | 229.86 |
| RMSE | 565.84 |
| R² | 0.1097 |

---

## 🔹 Observations

- Model underestimates large sales values.
- Predictions clustered toward lower range.
- Validation loss significantly higher than training loss.
- R² indicates weak explanatory power (~10%).

---

## 🔹 Next Steps for Improvement

1. **Log Transform Target**
   - Apply `y = log1p(y)` before training.
   - Reverse using `expm1()` during prediction.

2. **Try Huber Loss**
   - More robust to outliers than MSE.

3. **Analyze Target Distribution**
   - Plot histogram to check skewness.

4. **Compare With Tree-Based Models**
   - XGBoost
   - LightGBM
   - Random Forest  
   (Tree models often outperform deep learning on tabular data.)

5. **Feature Engineering**
   - Interaction features
   - Aggregated statistics
   - Domain-based transformations

6. **Outlier Handling**
   - Cap extreme sales values
   - Remove abnormal spikes

---

## 🔹 Goal for Next Experiment

Increase R² above **0.40** while maintaining reasonable MAE.