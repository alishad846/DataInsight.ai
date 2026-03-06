import pandas as pd

def clean_data(file_path):

    # read dataset
    df = pd.read_csv(file_path)

    # work on copy
    df = df.copy()

    report = {}
    report["original_shape"] = df.shape

    # remove duplicates
    df = df.drop_duplicates()

    # remove id columns
    id_cols = [c for c in df.columns if "id" in c.lower()]
    df = df.drop(columns=id_cols, errors="ignore")

    # fill numeric nulls
    for col in df.select_dtypes(include=["int64","float64"]).columns:
        df[col] = df[col].fillna(df[col].median())

    # fill text nulls
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].fillna("unknown")

    # remove remaining null rows
    df = df.dropna()

    report["cleaned_shape"] = df.shape

    return df, report


if __name__ == "__main__":

    dataset_path = "ml-engine/data/raw/sales_order.csv"

    cleaned_df, report = clean_data(dataset_path)

    print("Cleaning completed")
    print(report)