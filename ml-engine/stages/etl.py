import pandas as pd

def run_etl(df):

    df = df.drop_duplicates()   # Remove duplicate rows
 
    threshold = len(df) * 0.5          # Drop columns with more than 50% missing values
    df = df.dropna(thresh=threshold, axis=1)

    for col in df.select_dtypes(include=["int64", "float64"]).columns: # Fill numeric nulls with mean
        df[col] = df[col].fillna(df[col].mean())

    for col in df.select_dtypes(include=["object"]).columns:  # Fill categorical nulls with mode
        df[col] = df[col].fillna(df[col].mode()[0])

    # FEATURE ENGINEERING
    if "order_date" in df.columns:   # Extract month from order_date
        df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
        df["order_month"] = df["order_date"].dt.month
        
    if "sales" in df.columns and "quantity" in df.columns:   # Create average price per unit
        df["avg_price_per_unit"] = df["sales"] / df["quantity"]

    return df