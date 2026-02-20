import pandas as pd
df = pd.read_csv("data/raw/small_business_sales.csv")  ## to read the csv file
   

print("Dataset Shape (Rows, Columns):", df.shape) ##   (Rows, Columns): (34, 8)

print("\nColumn Names:")
print(df.columns)      ## the column name  




print("\nMissing Values Count:")
print(df.isnull().sum()) ## print the missing velue 


 