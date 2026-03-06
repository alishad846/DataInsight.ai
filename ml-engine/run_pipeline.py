print("FILE STARTED")

from clean_data import clean_data
from run_summary import generate_summary
from train_model import train_model


def run_pipeline():
    print("STEP 1: Cleaning Data")
    cleaned_df, report = clean_data("data/raw/superstore_sales.csv")

    print("STEP 2: Generating Summary")
    generate_summary(cleaned_df)

    print("STEP 3: Training Model")
    train_model(cleaned_df)

    print("PIPELINE COMPLETED SUCCESSFULLY")


if __name__ == "__main__":
    run_pipeline()