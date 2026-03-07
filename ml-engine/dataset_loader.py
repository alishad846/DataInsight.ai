import os
import pandas as pd
import sys

def load_dataset(file_path):
    # Check file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError("File not found")

    # Validate file type
    if not file_path.endswith((".csv", ".xlsx")):
        raise ValueError("Only CSV and Excel files are allowed")

    # Load dataset
    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)

    # Basic validation
    if df.empty:
        raise ValueError("Dataset is empty")

    if len(df) < 5:
        raise ValueError("Dataset too small")

    # Save raw copy
    os.makedirs("data/raw", exist_ok=True)
    filename = os.path.basename(file_path)
    save_path = f"data/raw/{filename}"
    df.to_csv(save_path, index=False)

    print(f"Dataset saved to {save_path}")

    return df


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python dataset_loader.py <path_to_dataset>")
        sys.exit(1)

    input_path = sys.argv[1]
    load_dataset(input_path)