import pandas as pd
import sys
import os
import json


def clean_data(file_path):
    # Read dataset
    df = pd.read_csv(file_path)

    report = {}
    report["original_shape"] = df.shape

    # Remove duplicate rows
    df = df.drop_duplicates()

    # Missing values report
    report["missing_values"] = df.isnull().sum().to_dict()

    # Drop columns with more than 50% missing values
    threshold = len(df) * 0.5
    df = df.dropna(thresh=threshold, axis=1)

    # Fill numeric nulls with mean
    numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns
    for col in numeric_cols:
        df[col] = df[col].fillna(df[col].mean())

    # Fill categorical nulls with mode
    cat_cols = df.select_dtypes(include=["object"]).columns
    for col in cat_cols:
        if not df[col].mode().empty:
            df[col] = df[col].fillna(df[col].mode()[0])

    report["cleaned_shape"] = df.shape

    return df, report


if __name__ == "__main__":

    # Check input argument
    if len(sys.argv) < 2:
        print("Usage: python clean_data.py <csv_file>")
        sys.exit(1)

    input_path = sys.argv[1]

    if not os.path.exists(input_path):
        print(f"Error: File '{input_path}' not found.")
        sys.exit(1)

    # Create folders
    os.makedirs("data/cleaned", exist_ok=True)
    os.makedirs("reports", exist_ok=True)

    # Run cleaning
    cleaned_df, analysis = clean_data(input_path)

    # Save cleaned dataset
    output_file = f"data/cleaned/cleaned_{os.path.basename(input_path)}"
    cleaned_df.to_csv(output_file, index=False)

    # Save analysis report
    report_file = "reports/analysis.json"
    with open(report_file, "w") as f:
        json.dump(analysis, f, indent=4)

    # Print result (for backend integration)
    result = {
        "cleaned_file": output_file,
        "report_file": report_file
    }

    print(json.dumps(result))