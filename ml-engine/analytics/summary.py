import pandas as pd
import numpy as np
import warnings

warnings.filterwarnings("ignore", category=UserWarning)

def compute_summary(df):
    # ---------- 1. Detect VALID time column ----------
    time_col = None

    for col in df.columns:
        # ❌ Skip numeric columns
        if pd.api.types.is_numeric_dtype(df[col]):
            continue

        parsed = pd.to_datetime(df[col], errors="coerce")

        # Must have enough valid dates
        if parsed.notna().sum() < 0.8 * len(df):
            continue

        # Must span more than 1 year (avoid 1970 issue)
        years = parsed.dt.year.dropna().unique()
        if len(years) < 1:
            continue

        time_col = col
        df[col] = parsed
        break

    if not time_col:
        raise ValueError("No valid time column found")

    # ---------- 2. Detect numeric column (exclude datetime) ----------
    numeric_cols = [
        col for col in df.columns
        if pd.api.types.is_numeric_dtype(df[col])
        and not pd.api.types.is_datetime64_any_dtype(df[col])
    ]

    if not numeric_cols:
        raise ValueError("No valid numeric column found")

    value_col = numeric_cols[0]

    # ---------- 3. Aggregate ----------
    yearly = (
        df.groupby(df[time_col].dt.year)[value_col]
        .sum()
        .sort_index()
    )

    total = float(yearly.sum())
    average = float(yearly.mean())

    # ---------- 4. Handle single-period case ----------
    if len(yearly) < 2:
        year = int(yearly.index[0])
        return {
            "trend": None,
            "worst_year": year,
            "total": round(total, 2),
            "average": round(average, 2),
            "best_year": year,
            "growth": None,
        }

    # ---------- 5. Multi-period analytics ----------
    first = yearly.iloc[0]
    last = yearly.iloc[-1]

    trend = ((last - first) / first) * 100 if first != 0 else 0
    cagr = ((last / first) ** (1 / (len(yearly) - 1)) - 1) * 100 if first != 0 else 0

    return {
        "trend": round(trend, 1),
        "worst_year": int(yearly.idxmin()),
        "total": round(total, 2),
        "average": round(average, 2),
        "best_year": int(yearly.idxmax()),
        "growth": round(cagr, 1),
    }
