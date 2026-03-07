import pandas as pd
import numpy as np
import json
import os
import sys
import warnings

warnings.filterwarnings("ignore")


MISSING_DROP_THRESHOLD   = 0.50
UNIQUE_ID_THRESHOLD      = 0.95
FREE_TEXT_AVG_LEN        = 15
OUTLIER_IQR_FACTOR       = 1.5
SKEWNESS_THRESHOLD       = 1.0


def load_dataset(path: str) -> pd.DataFrame:
    ext = os.path.splitext(path)[1].lower()
    loaders = {
        ".csv":     lambda p: pd.read_csv(p),
        ".xlsx":    lambda p: pd.read_excel(p, engine="openpyxl"),
        ".xls":     lambda p: pd.read_excel(p),
        ".json":    lambda p: pd.read_json(p),
        ".parquet": lambda p: pd.read_parquet(p),
    }
    if ext not in loaders:
        raise ValueError(
            f"Unsupported file format: '{ext}'. Supported: CSV, Excel, JSON, Parquet."
        )
    return loaders[ext](path)


def triage_columns(df: pd.DataFrame) -> dict:
    n = len(df)
    dropped_constant  = []
    dropped_missing   = []
    dropped_id_like   = []
    dropped_free_text = []

    for col in df.columns:
        series = df[col]
        null_pct    = series.isnull().mean()
        unique_pct  = series.nunique() / n if n > 0 else 0

        if null_pct > MISSING_DROP_THRESHOLD:
            dropped_missing.append(col)
            continue

        if series.dropna().nunique() <= 1:
            dropped_constant.append(col)
            continue

        if unique_pct >= UNIQUE_ID_THRESHOLD and not pd.api.types.is_datetime64_any_dtype(series):
            if series.dtype == object:
                dropped_id_like.append(col)
                continue

        if series.dtype == object and unique_pct >= 0.50:
            avg_len = series.dropna().astype(str).str.len().mean()
            if avg_len >= FREE_TEXT_AVG_LEN:
                dropped_free_text.append(col)
                continue

    all_dropped = set(
        dropped_constant + dropped_missing + dropped_id_like + dropped_free_text
    )
    kept = [c for c in df.columns if c not in all_dropped]

    return {
        "dropped_constant":  dropped_constant,
        "dropped_missing":   dropped_missing,
        "dropped_id_like":   dropped_id_like,
        "dropped_free_text": dropped_free_text,
        "kept":              kept,
    }


def extract_datetime_features(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    new_cols = []
    for col in df.columns:
        series = df[col]

        is_dt = pd.api.types.is_datetime64_any_dtype(series)
        if not is_dt and series.dtype == object:
            parsed = pd.to_datetime(series, errors="coerce")
            if parsed.notna().mean() >= 0.7:
                df[col] = parsed
                is_dt = True

        if is_dt:
            prefix = col.replace(" ", "_").lower()
            df[col] = pd.to_datetime(df[col], errors="coerce")
            df[f"{prefix}_year"]       = df[col].dt.year
            df[f"{prefix}_month"]      = df[col].dt.month
            df[f"{prefix}_day"]        = df[col].dt.day
            df[f"{prefix}_day_of_week"]= df[col].dt.dayofweek
            df[f"{prefix}_hour"]       = df[col].dt.hour
            df[f"{prefix}_is_weekend"] = df[col].dt.dayofweek.isin([5, 6]).astype(int)
            new_cols += [
                f"{prefix}_year", f"{prefix}_month", f"{prefix}_day",
                f"{prefix}_day_of_week", f"{prefix}_hour", f"{prefix}_is_weekend",
            ]
            df.drop(columns=[col], inplace=True)

    return df, new_cols


def impute_missing(df: pd.DataFrame) -> dict:
    log = {}
    for col in df.columns:
        null_count = df[col].isnull().sum()
        if null_count == 0:
            continue

        if pd.api.types.is_numeric_dtype(df[col]):
            fill_val = df[col].median()
            df[col].fillna(fill_val, inplace=True)
            log[col] = f"numeric → median ({round(float(fill_val), 4)})"

        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col].fillna(method="ffill", inplace=True)
            df[col].fillna(method="bfill", inplace=True)
            log[col] = "datetime → forward-fill"

        else:
            if df[col].dropna().empty:
                df[col].fillna("Unknown", inplace=True)
                log[col] = "categorical → 'Unknown' (no mode available)"
            else:
                fill_val = df[col].mode()[0]
                df[col].fillna(fill_val, inplace=True)
                log[col] = f"categorical → mode ('{fill_val}')"

    return log


def cap_outliers(df: pd.DataFrame) -> dict:
    log = {}
    for col in df.select_dtypes(include="number").columns:
        q1  = df[col].quantile(0.25)
        q3  = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - OUTLIER_IQR_FACTOR * iqr
        upper = q3 + OUTLIER_IQR_FACTOR * iqr

        capped = ((df[col] < lower) | (df[col] > upper)).sum()
        if capped > 0:
            df[col] = df[col].clip(lower=lower, upper=upper)
            log[col] = {
                "lower_fence":  round(float(lower), 4),
                "upper_fence":  round(float(upper), 4),
                "capped_count": int(capped),
            }
    return log


def fix_skewness(df: pd.DataFrame) -> dict:
    log = {}
    for col in df.select_dtypes(include="number").columns:
        skew = float(df[col].skew())
        if abs(skew) > SKEWNESS_THRESHOLD and df[col].min() >= 0:
            df[col] = np.log1p(df[col])
            log[col] = round(skew, 4)
    return log


def label_encode(df: pd.DataFrame) -> dict:
    log = {}
    for col in df.select_dtypes(include=["object", "category"]).columns:
        df[col] = df[col].astype("category")
        categories = dict(enumerate(df[col].cat.categories))
        mapping = {str(v): int(k) for k, v in categories.items()}
        df[col] = df[col].cat.codes
        log[col] = {"mapping": mapping}
    return log


def clean_dataset(path: str) -> tuple[pd.DataFrame, dict]:
    report = {"source_file": os.path.abspath(path)}

    df = load_dataset(path)
    report["original_shape"] = {"rows": int(df.shape[0]), "columns": int(df.shape[1])}
    report["original_columns"] = df.columns.tolist()

    triage = triage_columns(df)
    all_dropped = (
        triage["dropped_constant"]
        + triage["dropped_missing"]
        + triage["dropped_id_like"]
        + triage["dropped_free_text"]
    )
    df = df[triage["kept"]].copy()
    report["dropped_columns"] = {
        "constant":  triage["dropped_constant"],
        "missing_gt_50pct": triage["dropped_missing"],
        "id_like":   triage["dropped_id_like"],
        "free_text": triage["dropped_free_text"],
        "total_dropped": len(all_dropped),
    }

    impute_log = impute_missing(df)
    report["imputation"] = impute_log

    df, new_dt_cols = extract_datetime_features(df)
    report["datetime_features_added"] = new_dt_cols

    outlier_log = cap_outliers(df)
    report["outlier_capping"] = outlier_log

    skew_log = fix_skewness(df)
    report["skewness_correction"] = {
        col: {"original_skewness": skew, "transform": "log1p"}
        for col, skew in skew_log.items()
    }

    encode_log = label_encode(df)
    report["label_encoding"] = encode_log

    non_numeric = df.select_dtypes(exclude="number").columns.tolist()
    if non_numeric:
        df.drop(columns=non_numeric, inplace=True)
        report["extra_dropped_non_numeric"] = non_numeric

    report["cleaned_shape"] = {"rows": int(df.shape[0]), "columns": int(df.shape[1])}
    report["cleaned_columns"] = df.columns.tolist()
    report["status"] = "success"

    return df, report


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
        err = {"error": "No dataset path provided. Use CLI arg or stdin JSON with 'dataset_path' key."}
        print(json.dumps(err))
        sys.exit(1)

    if not os.path.exists(dataset_path):
        err = {"error": f"File not found: {dataset_path}"}
        print(json.dumps(err))
        sys.exit(1)

    try:
        cleaned_df, cleaning_report = clean_dataset(dataset_path)

        os.makedirs("data/cleaned", exist_ok=True)
        base_name = os.path.splitext(os.path.basename(dataset_path))[0]
        csv_path  = f"data/cleaned/cleaned_{base_name}.csv"
        cleaned_df.to_csv(csv_path, index=False)

        os.makedirs("report_json", exist_ok=True)
        report_path = f"report_json/{base_name}_cleaning_report.json"
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(cleaning_report, f, indent=4, default=str)

        summary = {
            "status":          "success",
            "cleaned_file":    os.path.abspath(csv_path),
            "report_file":     os.path.abspath(report_path),
            "original_rows":   cleaning_report["original_shape"]["rows"],
            "original_columns":cleaning_report["original_shape"]["columns"],
            "cleaned_rows":    cleaning_report["cleaned_shape"]["rows"],
            "cleaned_columns": cleaning_report["cleaned_shape"]["columns"],
            "dropped_columns": cleaning_report["dropped_columns"]["total_dropped"],
            "datetime_features_added": len(cleaning_report["datetime_features_added"]),
            "outlier_cols_capped": len(cleaning_report["outlier_capping"]),
            "skew_corrected_cols": len(cleaning_report["skewness_correction"]),
            "label_encoded_cols":  len(cleaning_report["label_encoding"]),
        }
        print(json.dumps(summary, indent=2))

    except Exception as e:
        err = {"error": str(e), "status": "failed"}
        sys.stderr.write(str(e) + "\n")
        print(json.dumps(err))
        sys.exit(1)
