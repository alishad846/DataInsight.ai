import pandas as pd
import numpy as np
import warnings

def pie_chart(df):
    warnings.filterwarnings(
        "ignore",
        message="Could not infer format",
        category=UserWarning
    )

    # ---------- 1. Detect numeric value column ----------
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if not numeric_cols:
        raise ValueError("No numeric column found for pie chart")

    value_col = max(numeric_cols, key=lambda c: df[c].var())

    # ---------- 2. Detect categorical group column ----------
    cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

    valid_cat_cols = []
    for col in cat_cols:
        parsed = pd.to_datetime(df[col], errors="coerce")
        if parsed.notna().sum() > 0.5 * len(df):
            continue
        valid_cat_cols.append(col)

    if not valid_cat_cols:
        raise ValueError("No categorical column found for pie chart")

    group_col = valid_cat_cols[0]

    # ---------- 3. Aggregate ----------
    grouped = df.groupby(group_col)[value_col].sum()
    total = grouped.sum()

    return {
        "chartType": "pie",
        "meta": {
            "groupBy": group_col,
            "value": value_col
        },
        "data": [
            {
                "label": str(k),
                "value": round((v / total) * 100, 2)
            }
            for k, v in grouped.items()
        ]
    }
