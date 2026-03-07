# stages/validation.py

def validate_dataset(df):
    if df.empty:
        raise ValueError("Dataset is empty")

    if len(df) < 5:
        raise ValueError("Dataset too small")

    return True