import pandas as pd
import numpy as np
import json
import os
import sys
import warnings

warnings.filterwarnings("ignore")

def load_dataset(path: str) -> pd.DataFrame:
    ext = os.path.splitext(path)[1].lower()
    loaders = {
        ".csv":     lambda p: pd.read_csv(p),
        ".xlsx":    lambda p: pd.read_excel(p),
        ".xls":     lambda p: pd.read_excel(p),
        ".json":    lambda p: pd.read_json(p),
        ".parquet": lambda p: pd.read_parquet(p),
    }
    if ext not in loaders:
        raise ValueError(f"Unsupported file format: '{ext}'. Supported: CSV, Excel, JSON, Parquet.")
    return loaders[ext](path)


def get_file_info(path: str, df: pd.DataFrame) -> dict:
    size_bytes = os.path.getsize(path)

    encoding = "N/A"
    ext = os.path.splitext(path)[1].lower()
    if ext in (".csv", ".json"):
        try:
            import chardet
            with open(path, "rb") as f:
                raw = f.read(100_000)
            detected = chardet.detect(raw)
            encoding = detected.get("encoding", "utf-8") or "utf-8"
        except ImportError:
            encoding = "utf-8"

    return {
        "file_name":     os.path.basename(path),
        "file_path":     os.path.abspath(path),
        "file_format":   ext.lstrip("."),
        "file_size_kb":  round(size_bytes / 1024, 2),
        "file_size_mb":  round(size_bytes / (1024 * 1024), 4),
        "encoding":      encoding,
    }


def get_shape_info(df: pd.DataFrame) -> dict:
    mem_bytes = df.memory_usage(deep=True).sum()
    return {
        "rows":           int(df.shape[0]),
        "columns":        int(df.shape[1]),
        "total_cells":    int(df.shape[0] * df.shape[1]),
        "memory_usage_kb": round(mem_bytes / 1024, 2),
        "memory_usage_mb": round(mem_bytes / (1024 * 1024), 4),
    }


def detect_dataset_type(df: pd.DataFrame) -> dict:
    has_datetime = False
    datetime_cols = []

    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            has_datetime = True
            datetime_cols.append(col)
        elif df[col].dtype == object:
            parsed = pd.to_datetime(df[col], errors="coerce")
            if parsed.notna().sum() > 0.7 * len(df):
                has_datetime = True
                datetime_cols.append(col)

    numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()

    likely_task = "unknown"
    if numeric_cols:
        target_hints = ["target", "label", "class", "output", "y", "result", "status", "survived"]
        for col in df.columns:
            if col.lower() in target_hints:
                n_unique = df[col].nunique()
                likely_task = "classification" if n_unique <= 20 else "regression"
                break
        if likely_task == "unknown":
            if has_datetime:
                likely_task = "time_series"
            elif len(numeric_cols) > len(categorical_cols):
                likely_task = "regression"
            else:
                likely_task = "classification"

    if has_datetime:
        detected_type = "time_series" if likely_task == "time_series" else "tabular_with_datetime"
    elif len(categorical_cols) == 0:
        detected_type = "tabular_numeric"
    elif len(numeric_cols) == 0:
        detected_type = "tabular_categorical"
    else:
        detected_type = "tabular_mixed"

    return {
        "detected_type":        detected_type,
        "likely_ml_task":       likely_task,
        "has_datetime_column":  has_datetime,
        "datetime_columns":     datetime_cols,
        "numeric_column_count":    len(numeric_cols),
        "categorical_column_count": len(categorical_cols),
    }


def _safe_val(val):
    if isinstance(val, (np.integer,)):
        return int(val)
    if isinstance(val, (np.floating,)):
        return None if np.isnan(val) else float(val)
    if isinstance(val, (np.bool_,)):
        return bool(val)
    if isinstance(val, pd.Timestamp):
        return str(val)
    return val


def analyze_numeric_column(series: pd.Series) -> dict:
    clean = series.dropna()
    if len(clean) == 0:
        return {}

    q1 = float(clean.quantile(0.25))
    q3 = float(clean.quantile(0.75))
    iqr = q3 - q1
    lower_fence = q1 - 1.5 * iqr
    upper_fence = q3 + 1.5 * iqr
    outlier_mask = (clean < lower_fence) | (clean > upper_fence)
    outlier_count = int(outlier_mask.sum())

    return {
        "min":                round(float(clean.min()), 6),
        "max":                round(float(clean.max()), 6),
        "mean":               round(float(clean.mean()), 6),
        "median":             round(float(clean.median()), 6),
        "std":                round(float(clean.std()), 6),
        "variance":           round(float(clean.var()), 6),
        "skewness":           round(float(clean.skew()), 6),
        "kurtosis":           round(float(clean.kurtosis()), 6),
        "q1":                 round(q1, 6),
        "q3":                 round(q3, 6),
        "iqr":                round(iqr, 6),
        "lower_fence":        round(lower_fence, 6),
        "upper_fence":        round(upper_fence, 6),
        "outlier_count":      outlier_count,
        "outlier_percentage": round(outlier_count / len(clean) * 100, 2),
        "zero_count":         int((clean == 0).sum()),
        "negative_count":     int((clean < 0).sum()),
        "positive_count":     int((clean > 0).sum()),
    }


def analyze_categorical_column(series: pd.Series) -> dict:
    clean = series.dropna()
    if len(clean) == 0:
        return {}

    value_counts = clean.value_counts()
    top_val = value_counts.index[0] if len(value_counts) > 0 else None
    top_count = int(value_counts.iloc[0]) if len(value_counts) > 0 else 0

    top_20 = value_counts.head(20).to_dict()
    top_20_serializable = {str(k): int(v) for k, v in top_20.items()}

    avg_str_len = round(float(clean.astype(str).str.len().mean()), 2)
    max_str_len = int(clean.astype(str).str.len().max())

    return {
        "top_value":             str(top_val) if top_val is not None else None,
        "top_value_count":       top_count,
        "top_value_percentage":  round(top_count / len(clean) * 100, 2),
        "value_counts":          top_20_serializable,
        "avg_string_length":     avg_str_len,
        "max_string_length":     max_str_len,
    }


def analyze_datetime_column(series: pd.Series) -> dict:
    if not pd.api.types.is_datetime64_any_dtype(series):
        series = pd.to_datetime(series, errors="coerce")

    clean = series.dropna()
    if len(clean) == 0:
        return {}

    return {
        "min_date":    str(clean.min()),
        "max_date":    str(clean.max()),
        "date_range_days": int((clean.max() - clean.min()).days),
        "unique_years": sorted(clean.dt.year.unique().tolist()),
        "unique_months": int(clean.dt.to_period("M").nunique()),
    }


def analyze_column(df: pd.DataFrame, col: str) -> dict:
    series = df[col]
    n_total = len(series)
    null_count = int(series.isnull().sum())
    non_null = series.dropna()
    unique_count = int(series.nunique())

    sample_raw = non_null.head(5).tolist()
    sample_values = [_safe_val(v) for v in sample_raw]

    mem_kb = round(series.memory_usage(deep=True) / 1024, 3)

    if pd.api.types.is_numeric_dtype(series):
        dtype_category = "numeric"
    elif pd.api.types.is_datetime64_any_dtype(series):
        dtype_category = "datetime"
    elif pd.api.types.is_bool_dtype(series):
        dtype_category = "boolean"
    else:
        parsed = pd.to_datetime(series, errors="coerce")
        if parsed.notna().sum() > 0.7 * n_total:
            dtype_category = "datetime"
        else:
            dtype_category = "categorical"

    col_info = {
        "name":               col,
        "dtype":              str(series.dtype),
        "dtype_category":     dtype_category,
        "null_count":         null_count,
        "null_percentage":    round(null_count / n_total * 100, 2) if n_total > 0 else 0.0,
        "non_null_count":     int(n_total - null_count),
        "non_null_percentage": round((n_total - null_count) / n_total * 100, 2) if n_total > 0 else 0.0,
        "unique_count":       unique_count,
        "unique_percentage":  round(unique_count / n_total * 100, 2) if n_total > 0 else 0.0,
        "is_constant":        unique_count == 1,
        "is_unique_id":       unique_count == n_total,
        "sample_values":      sample_values,
        "memory_usage_kb":    mem_kb,
    }

    if dtype_category == "numeric":
        col_info["numeric_stats"] = analyze_numeric_column(series)
    elif dtype_category == "datetime":
        col_info["datetime_stats"] = analyze_datetime_column(series)
    else:
        col_info["categorical_stats"] = analyze_categorical_column(series)

    return col_info


def get_missing_analysis(df: pd.DataFrame) -> dict:
    total_cells = df.shape[0] * df.shape[1]
    total_missing = int(df.isnull().sum().sum())
    missing_per_col = df.isnull().sum()

    columns_with_missing = [
        {
            "column":          col,
            "missing_count":   int(missing_per_col[col]),
            "missing_percentage": round(missing_per_col[col] / df.shape[0] * 100, 2),
        }
        for col in missing_per_col[missing_per_col > 0].index
    ]
    columns_with_missing.sort(key=lambda x: x["missing_count"], reverse=True)

    severe_missing = [c for c in columns_with_missing if c["missing_percentage"] > 50]

    return {
        "total_missing":              total_missing,
        "total_missing_percentage":   round(total_missing / total_cells * 100, 2) if total_cells > 0 else 0.0,
        "columns_with_missing_count": len(columns_with_missing),
        "columns_without_missing_count": int(df.shape[1] - len(columns_with_missing)),
        "columns_with_missing":       columns_with_missing,
        "severe_missing_columns":     severe_missing,
        "rows_with_any_missing":      int(df.isnull().any(axis=1).sum()),
        "completely_empty_rows":      int((df.isnull().all(axis=1)).sum()),
    }


def get_duplicate_analysis(df: pd.DataFrame) -> dict:
    dup_count = int(df.duplicated().sum())
    return {
        "duplicate_rows":       dup_count,
        "duplicate_percentage": round(dup_count / len(df) * 100, 2) if len(df) > 0 else 0.0,
        "unique_rows":          int(len(df) - dup_count),
    }


def get_correlation_analysis(df: pd.DataFrame) -> dict:
    numeric_df = df.select_dtypes(include=["number"])

    if numeric_df.shape[1] < 2:
        return {
            "method":                "pearson",
            "matrix":                {},
            "high_correlation_pairs": [],
            "note":                  "Less than 2 numeric columns; correlation skipped.",
        }

    corr = numeric_df.corr(method="pearson").round(4)

    matrix = {}
    for col in corr.columns:
        matrix[col] = {
            other: (None if np.isnan(v) else round(float(v), 4))
            for other, v in corr[col].items()
            if other != col
        }

    high_pairs = []
    cols = corr.columns.tolist()
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            val = corr.iloc[i, j]
            if not np.isnan(val) and abs(val) >= 0.7:
                high_pairs.append({
                    "col1":        cols[i],
                    "col2":        cols[j],
                    "correlation": round(float(val), 4),
                    "strength":    "strong positive" if val > 0 else "strong negative",
                })

    high_pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)

    return {
        "method":                "pearson",
        "matrix":                matrix,
        "high_correlation_pairs": high_pairs,
    }


def compute_data_quality_score(df: pd.DataFrame, col_reports: list, missing: dict, dupes: dict) -> dict:
    score = 100
    issues = []

    missing_pct = missing["total_missing_percentage"]
    if missing_pct > 0:
        penalty = min(30, missing_pct * 2)
        score -= penalty
        issues.append(f"{missing['total_missing']} missing values across dataset ({missing_pct}%)")

    for col in missing.get("severe_missing_columns", []):
        issues.append(f"Column '{col['column']}' has {col['missing_percentage']}% missing values (severe)")

    dup_pct = dupes["duplicate_percentage"]
    if dup_pct > 0:
        penalty = min(15, dup_pct * 3)
        score -= penalty
        issues.append(f"{dupes['duplicate_rows']} duplicate rows ({dup_pct}%)")

    constant_cols = [c["name"] for c in col_reports if c.get("is_constant")]
    if constant_cols:
        score -= len(constant_cols) * 2
        issues.append(f"Constant columns (zero variance): {', '.join(constant_cols)}")

    for col in col_reports:
        stats = col.get("numeric_stats", {})
        out_pct = stats.get("outlier_percentage", 0)
        if out_pct > 10:
            score -= min(5, out_pct * 0.2)
            issues.append(f"High outliers in '{col['name']}': {out_pct}%")

    for col in col_reports:
        stats = col.get("numeric_stats", {})
        skew = stats.get("skewness", 0) or 0
        if abs(skew) > 5:
            issues.append(f"High skewness in '{col['name']}': {round(skew, 2)}")

    score = max(0, round(score, 1))

    if score >= 90:
        grade = "A"
    elif score >= 75:
        grade = "B"
    elif score >= 60:
        grade = "C"
    elif score >= 45:
        grade = "D"
    else:
        grade = "F"

    return {
        "score":  score,
        "grade":  grade,
        "issues": issues,
        "recommendation": (
            "Dataset is clean and ready for ML."          if grade == "A" else
            "Minor issues detected. Cleaning recommended." if grade == "B" else
            "Moderate issues. Cleaning required."          if grade == "C" else
            "Severe issues. Extensive cleaning needed."    if grade == "D" else
            "Dataset quality is very poor. Review data source."
        ),
    }


def generate_full_report(path: str) -> dict:
    df = load_dataset(path)

    file_info   = get_file_info(path, df)
    shape_info  = get_shape_info(df)
    type_info   = detect_dataset_type(df)
    col_reports = [analyze_column(df, col) for col in df.columns]
    missing     = get_missing_analysis(df)
    dupes       = get_duplicate_analysis(df)
    correlation = get_correlation_analysis(df)
    quality     = compute_data_quality_score(df, col_reports, missing, dupes)

    column_summary = {
        "total":       int(df.shape[1]),
        "numeric":     int(df.select_dtypes(include="number").shape[1]),
        "categorical": int(df.select_dtypes(include=["object", "category"]).shape[1]),
        "datetime":    int(df.select_dtypes(include=["datetime64"]).shape[1]),
        "boolean":     int(df.select_dtypes(include="bool").shape[1]),
        "constant":    sum(1 for c in col_reports if c.get("is_constant")),
        "unique_id_like": sum(1 for c in col_reports if c.get("is_unique_id")),
    }

    report = {
        "file_info":      file_info,
        "shape":          shape_info,
        "dataset_type":   type_info,
        "column_summary": column_summary,
        "columns":        col_reports,
        "missing_values": missing,
        "duplicates":     dupes,
        "correlation":    correlation,
        "data_quality":   quality,
    }

    return report


if __name__ == "__main__":
    dataset_path = None

    if len(sys.argv) > 1:
        dataset_path = sys.argv[1]

    else:
        try:
            payload = json.load(sys.stdin)
            dataset_path = payload.get("dataset_path")
        except Exception:
            pass

    if not dataset_path:
        error = {"error": "No dataset path provided. Use CLI arg or stdin JSON with 'dataset_path' key."}
        print(json.dumps(error))
        sys.exit(1)

    if not os.path.exists(dataset_path):
        error = {"error": f"File not found: {dataset_path}"}
        print(json.dumps(error))
        sys.exit(1)

    try:
        report = generate_full_report(dataset_path)

        os.makedirs("report_json", exist_ok=True)
        base_name = os.path.splitext(os.path.basename(dataset_path))[0]
        out_path = f"report_json/{base_name}_report.json"

        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=4, default=str)

        print(json.dumps(report, default=str))

    except Exception as e:
        error_payload = {"error": str(e)}
        sys.stderr.write(str(e) + "\n")
        print(json.dumps(error_payload))
        sys.exit(1)
