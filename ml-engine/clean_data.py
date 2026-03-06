import pandas as pd

 feature/day4-data-cleaning
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

from stages.validation import validate_dataset
from stages.etl import run_etl
from stages.metadata import generate_metadata
from stages.analytics import generate_eda_markdown


def process_dataset(file_path):
    # Load dataset
    original_df = pd.read_csv(file_path)

    # Validate dataset
    validate_dataset(original_df)

    # Run ETL cleaning
    cleaned_df = run_etl(original_df.copy())

    # Generate metadata report (JSON)
    report = generate_metadata(original_df, cleaned_df)

    # Generate EDA Markdown report
    generate_eda_markdown(cleaned_df)
     machine-learning

    return cleaned_df, report


if __name__ == "__main__":
    feature/day4-data-cleaning

    dataset_path = "ml-engine/data/raw/sales_order.csv"

    cleaned_df, report = clean_data(dataset_path)

    print("Cleaning completed")
    print(report)

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
         machine-learning
