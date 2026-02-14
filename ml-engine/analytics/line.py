import pandas as pd
import numpy as np
import warnings

def line_chart(df):
    warnings.filterwarnings(
        "ignore",
        message="Could not infer format",
        category=UserWarning
    )

    # ---------- 1. Detect numeric value column ----------
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if not numeric_cols:
        raise ValueError("No numeric column found for line chart")

    value_col = max(numeric_cols, key=lambda c: df[c].var())

    # ---------- 2. Detect valid time column ----------
    time_col = None
    for col in df.columns:
        if pd.api.types.is_numeric_dtype(df[col]):
            continue

        parsed = pd.to_datetime(df[col], errors="coerce")

        if parsed.notna().sum() > 0.8 * len(df):
            time_col = col
            df[col] = parsed
            break

    if not time_col:
        raise ValueError("No valid time column found for line chart")

    # ---------- 3. Aggregate monthly ----------
    grouped = (
        df
        .groupby(df[time_col].dt.to_period("M"))[value_col]
        .sum()
        .sort_index()
    )

    return {
        "chartType": "line",
        "meta": {
            "time": time_col,
            "value": value_col
        },
        "data": [
            {
                "x": str(idx),
                "y": float(val)
            }
            for idx, val in grouped.items()
        ]
    }
