import pandas as pd 
import numpy as np

df = pd.read_csv("data/raw/small_business_sales.csv") ## lode the dataset

print("Original Shape:", df.shape)

print("\nMissing Values (Column-wise):")
print(df.isnull().sum())  ## check missing values 

numeric_cols = df.select_dtypes(include=np.number).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())  ##Fill numeric missing values


df = df.dropna() ##drope remaining missing values

df["order_date"] = pd.to_datetime(df["order_date"])  ##convert data column 
print("\nCleaned Shape:", df.shape)


df.to_csv("data/processed/cleaned_sales.csv", index=False)  ##saved cleaned dataset
print("\nCleaned dataset saved successfully!")

# NumPy calculations
quantity_array = df["quantity"].to_numpy()

print("\nNumPy Calculations:")
print("Mean:", np.mean(quantity_array)) ## Calculate Mean
print("Median:", np.median(quantity_array)) ## Calculate Median
print("Standard Deviation:", np.std(quantity_array)) ## Calculate Standard Deviation

X = df.drop("sales", axis=1) ## Feature Separation
y = df["sales"]
print("\nFeatures Shape:", X.shape)
print("Target Shape:", y.shape)
