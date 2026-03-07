import pandas as pd
df = pd.read_csv("C:\\Users\\sachi\\DataInsight.ai\\ml-engine\\data\\raw\\superstore_sales.csv")
print("Missing values per column:\n")
print(df.isnull().sum())
print("\nTotal missing values:", df.isnull().sum().sum())
