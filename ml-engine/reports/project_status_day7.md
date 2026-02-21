# Project Status – Day 7 (Foundation Phase)

**Date:** 2026-02-22  
**Branch:** `day7`  
**Author:** Sachin  
**Phase:** Foundation Phase – Final Review  

---

## ✅ What Is Completed So Far

| Area | Status |
|------|--------|
| Dataset loaded and explored | ✅ Done |
| Data cleaning pipeline | ✅ Done (`clean_data.py`) |
| Data overview report | ✅ Done (`data_overview.md`) |
| Baseline model trained (TF Sequential) | ✅ Done |
| Baseline results documented | ✅ Done (`model_baseline_results.md`) |
| TensorFlow environment verified | ✅ Working |
| Trained model artifacts saved | ✅ `.joblib` files in `models/` |
| Analytics and visualizations | ✅ Done (`analytics/`, `visualize.py`) |

---

## ✅ What Is Working Correctly

- **TensorFlow** — tensor creation and operations work without errors
- **Data pipeline** — raw data flows through `clean_data.py` into `data/cleaned/`
- **Model artifacts** — `LinearRegression.joblib`, `RandomForestRegressor.joblib`, and `label_encoders.joblib` all saved successfully
- **Reports** — `data_overview.md` and `model_baseline_results.md` are accurate and readable
- **Chatbot** — `chatbot.py` is present and structured

---

## ⚠️ Known Limitations

1. **Small dataset** — Only 34 rows used for model training; this limits model generalization
2. **Baseline MAE is high** — Final Test MAE: **2537.93** due to minimal features (`quantity`, `unit_price` only)
3. **Relative path dependency** — `baseline_model.py` uses `data/cleaned/...` relative paths; must be run from inside `ml-engine/` directory
4. **No feature engineering** — Advanced features like `Discount`, `Region`, `Category` not yet included
5. **No hyperparameter tuning** — Models used default parameters

---

## 🔜 What Needs Improvement Next

- Add more features to the model (Discount, Region, Segment, Sub.Category)
- Use the full dataset (51,290 rows) instead of a 34-row sample
- Implement cross-validation and hyperparameter tuning
- Fix relative path issue in `baseline_model.py` using `os.path` or `pathlib`
- Add a proper train/val/test split with metrics logged per epoch

---

## 🙋 Self-Assessment

| | |
|---|---|
| **One strength demonstrated** | Successfully built an end-to-end ML pipeline from raw data ingestion to trained model artifacts, with documented results |
| **One area to improve** | Feature engineering — only 2 features were used; incorporating all relevant columns will significantly improve accuracy |
| **One dependency for next phase** | Full dataset integration and role-based execution (data analyst to prepare enriched features before model retraining) |
