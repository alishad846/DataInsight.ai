import sys
import os
import json
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data", "cleaned")


# ---------------- LOAD LATEST DATASET ----------------
def get_latest_csv():
    if not os.path.exists(DATA_DIR):
        return None

    files = sorted(
        [f for f in os.listdir(DATA_DIR) if f.endswith(".csv")],
        reverse=True
    )
    return os.path.join(DATA_DIR, files[0]) if files else None


# ---------------- PICK BEST NUMERIC COLUMN ----------------
def pick_numeric_column(question, numeric_cols):
    q = question.lower()
    priority = ["sales", "profit", "revenue"]

    for key in priority:
        for col in numeric_cols:
            if key in col.lower():
                return col

    return numeric_cols[0] if numeric_cols else None


# ---------------- BUILD DATASET CONTEXT ----------------
def build_dataset_context(df):
    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    time_cols = [
        col for col in df.columns
        if "date" in col.lower() or "year" in col.lower()
    ]

    return {
        "rows": int(len(df)),
        "columns": list(df.columns),
        "numeric_columns": numeric_cols,
        "time_columns": time_cols
    }


# ---------------- SCHEMA VALIDATION ----------------
def validate_schema(question, df):
    q = question.lower()

    schema_concepts = {
        "region": ["region", "state", "area", "zone"],
        "category": ["category", "segment", "department", "type"]
    }

    for concept, keywords in schema_concepts.items():
        if any(k in q for k in keywords):
            matching_cols = [
                c for c in df.columns
                if any(k in c.lower() for k in keywords)
            ]
            if not matching_cols:
                return (
                    f"The dataset does not contain a '{concept}'-related column. "
                    f"Available columns are: {', '.join(df.columns)}."
                )

    return None


# ---------------- GENERIC COMPUTATION ENGINE ----------------
def compute_answer(question, df):
    q = question.lower()

    # 🔐 Schema-aware guard
    schema_error = validate_schema(question, df)
    if schema_error:
        return schema_error

    numeric_cols = df.select_dtypes(include="number").columns.tolist()
    if not numeric_cols:
        return None

    num_col = pick_numeric_column(question, numeric_cols)

    # ---------- BASIC STATISTICS ----------
    if "minimum" in q or "min" in q or "least" in q:
        return f"The minimum {num_col} value is {df[num_col].min():.2f}."

    if "maximum" in q or "max" in q or "highest" in q:
        return f"The maximum {num_col} value is {df[num_col].max():.2f}."

    if "average" in q or "mean" in q:
        return f"The average {num_col} value is {df[num_col].mean():.2f}."

    if "total" in q or "sum" in q:
        return f"The total {num_col} value is {df[num_col].sum():.2f}."

    if "median" in q or "middle" in q:
        return f"The median {num_col} value is {df[num_col].median():.2f}."

    # ---------- YEAR-BASED AGGREGATION ----------
    date_cols = [c for c in df.columns if "date" in c.lower() or "year" in c.lower()]
    if date_cols:
        date_col = date_cols[0]
        try:
            df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
            yearly = df.groupby(df[date_col].dt.year)[num_col].sum()

            if "least" in q or "minimum" in q:
                return f"The year with the lowest total {num_col} was {int(yearly.idxmin())}."

            if "highest" in q or "maximum" in q:
                return f"The year with the highest total {num_col} was {int(yearly.idxmax())}."

        except Exception:
            pass

    # ---------- TREND-BASED PREDICTION ----------
    if "predict" in q or "future" in q or "next" in q:
        if date_cols:
            date_col = date_cols[0]
            try:
                df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
                df_sorted = df.sort_values(date_col)
                values = df_sorted[num_col].dropna()

                if len(values) >= 2:
                    trend = values.iloc[-1] - values.iloc[0]
                    direction = (
                        "increasing" if trend > 0 else
                        "decreasing" if trend < 0 else
                        "stable"
                    )

                    return (
                        f"Based on historical data, {num_col} shows a {direction} trend over time. "
                        "A precise numerical prediction would require a forecasting model."
                    )
            except Exception:
                pass

    return None


# ---------------- MAIN ENTRY ----------------
def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No question provided"}))
        return

    question = sys.argv[1]
    csv_path = get_latest_csv()

    if not csv_path:
        print(json.dumps({
            "question": question,
            "dataset_context": {},
            "computed_answer": None
        }))
        return

    df = pd.read_csv(csv_path)

    payload = {
        "question": question,
        "dataset_context": build_dataset_context(df),
        "computed_answer": compute_answer(question, df)
    }

    print(json.dumps(payload))


if __name__ == "__main__":
    main()
