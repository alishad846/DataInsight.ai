import pandas as pd
import numpy as np
import warnings

def bar_chart(df, top_n=5):
    # 🔕 Silence pandas datetime warnings (important)
    warnings.filterwarnings(
        "ignore",
        message="Could not infer format",
        category=UserWarning
    )

    # ---------- 1. Detect numeric value column ----------
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    if not numeric_cols:
        raise ValueError("No numeric column found")

    # Prefer column with highest variance (sales-like)
    value_col = max(numeric_cols, key=lambda c: df[c].var())

    # ---------- 2. Detect categorical group column ----------
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

    valid_cat_cols = []
    for col in cat_cols:
        # Try datetime parsing quietly
        parsed = pd.to_datetime(df[col], errors="coerce")

        # If MOST values are valid dates → skip (date-like column)
        if parsed.notna().sum() > 0.5 * len(df):
            continue

        valid_cat_cols.append(col)

    if not valid_cat_cols:
        raise ValueError("No valid categorical column found for bar chart")

    group_col = valid_cat_cols[0]

    # ---------- 3. Aggregate ----------
    grouped = (
        df.groupby(group_col)[value_col]
        .sum()
        .sort_values(ascending=False)
        .head(top_n)
        .reset_index()
    )

    return {
        "chartType": "bar",
        "meta": {
            "groupBy": group_col,
            "value": value_col
        },
        "data": [
            {
                "label": str(row[group_col]),
                "value": float(row[value_col])
            }
            for _, row in grouped.iterrows()
        ]
    }
