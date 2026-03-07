def generate_eda_markdown(df, output_path="reports/eda_summary.md"):

    with open(output_path, "w") as f:

        f.write("# EDA Summary\n\n")

        # Dataset Overview
        f.write("## Dataset Overview\n")
        f.write(f"Rows: {len(df)}\n")
        f.write(f"Columns: {len(df.columns)}\n\n")

        # Missing Values
        f.write("## Missing Values (%)\n")
        missing = (df.isnull().mean() * 100).round(2)
        for col, val in missing.items():
            f.write(f"{col}: {val}%\n")

        # Duplicate Rows
        f.write("\n## Duplicate Rows\n")
        f.write(f"{df.duplicated().sum()} duplicates found\n\n")

        # Basic Statistics
        f.write("## Basic Statistics\n")
        f.write(df.describe().to_string())
        f.write("\n\n")

    
        # Sales by Region
        if "region" in df.columns and "sales" in df.columns:
            f.write("## Sales by Region\n")
            region_sales = df.groupby("region")["sales"].sum()
            f.write(region_sales.to_string())
            f.write("\n\n")

        # Sales by Category
        if "category" in df.columns and "sales" in df.columns:
            f.write("## Sales by Category\n")
            category_sales = df.groupby("category")["sales"].sum()
            f.write(category_sales.to_string())
            f.write("\n\n")

        # Monthly Sales Trend
        if "order_month" in df.columns and "sales" in df.columns:
            f.write("## Monthly Sales Trend\n")
            monthly_sales = df.groupby("order_month")["sales"].sum()
            f.write(monthly_sales.to_string())
            f.write("\n\n")
            
            
        # Correlation with Sales (Feature Importance Insight)
        if "sales" in df.columns:
            f.write("## Correlation with Sales\n")
            correlation = df.corr(numeric_only=True)["sales"].sort_values(ascending=False)
            f.write(correlation.to_string())
            f.write("\n\n")