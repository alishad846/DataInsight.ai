import pandas as pd
import sys
import os
import json

def clean_data(file_path):
    df = pd.read_csv(file_path)

    report = {}
    report["original_shape"] = df.shape

    # remove duplicate rows
    df = df.drop_duplicates()

    # missing values
    report["missing_values"] = df.isnull().sum().to_dict()

    # drop columns with >50% missing
    threshold = len(df) * 0.5
    df = df.dropna(thresh=threshold, axis=1)

    # fill numeric nulls with mean
    for col in df.select_dtypes(include=["int64", "float64"]).columns:
        df[col].fillna(df[col].mean(), inplace=True)

    # fill categorical nulls with mode
    for col in df.select_dtypes(include=["object"]).columns:
        df[col].fillna(df[col].mode()[0], inplace=True)

    report["cleaned_shape"] = df.shape

    return df, report


if __name__ == "__main__":
    input_path = sys.argv[1]

    os.makedirs("data/cleaned", exist_ok=True)
    os.makedirs("reports", exist_ok=True)

    cleaned_df, analysis = clean_data(input_path)

    output_file = f"data/cleaned/cleaned_{os.path.basename(input_path)}"
    cleaned_df.to_csv(output_file, index=False)

    with open("reports/analysis.json", "w") as f:
        json.dump(analysis, f, indent=4)

    print(json.dumps({
        "cleaned_file": output_file,
        "report_file": "reports/analysis.json"
    }))
