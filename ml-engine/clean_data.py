import pandas as pd
import sys
import os
import json

from stages.validation import validate_dataset
from stages.etl import run_etl
from stages.metadata import generate_metadata
from stages.analytics import generate_eda_markdown


def process_dataset(file_path):
    # Load dataset
    original_df = pd.read_csv(file_path)
 feature/new-work
    # missing values report
    report["missing_values"] = df.isnull().sum().to_dict()

    # Validate dataset
  validate_dataset(original_df)
   main

    # Run ETL cleaning
    cleaned_df = run_etl(original_df.copy())

 feature/new-work
    # fill numeric nulls with mean
    for col in df.select_dtypes(include=["int64", "float64"]).columns:
        df[col] = df[col].fillna(df[col].mean())

    # fill categorical nulls with mode
    for col in df.select_dtypes(include=["object"]).columns:
        if not df[col].mode().empty:
            df[col] = df[col].fillna(df[col].mode()[0])

    report["cleaned_shape"] = df.shape

    return df, report
    # Generate metadata report (JSON)
    report = generate_metadata(original_df, cleaned_df)

    # Generate EDA Markdown report
    generate_eda_markdown(cleaned_df)

    return cleaned_df, report


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python clean_data.py <path_to_dataset>")
        sys.exit(1)

    input_path = sys.argv[1]

    # Create required directories
    os.makedirs("data/cleaned", exist_ok=True)
    os.makedirs("reports", exist_ok=True)

    # Process dataset
    cleaned_df, analysis = process_dataset(input_path)

    # Save cleaned dataset
    output_file = f"data/cleaned/cleaned_{os.path.basename(input_path)}"
    cleaned_df.to_csv(output_file, index=False)

    # Save JSON analysis report
    with open("reports/analysis.json", "w") as f:
        json.dump(analysis, f, indent=4)

    print(json.dumps({
        "cleaned_file": output_file,
        "report_file": "reports/analysis.json",
        "eda_summary": "reports/eda_summary.md"
    }))
    main
