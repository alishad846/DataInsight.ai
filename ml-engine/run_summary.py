import json
import pandas as pd
from analytics.summary import compute_summary
import os


def generate_summary(df):
    os.makedirs("reports", exist_ok=True)

    summary = compute_summary(df)

    with open("reports/eda_summary.json", "w") as f:
        json.dump(summary, f, indent=4)

    print("EDA summary saved to reports/eda_summary.json")

    return summary


# Only run this block if file executed directly
if __name__ == "__main__":
    print("This script should be used inside pipeline.")