## Dataset Overview
1. Total Rows: 51,290
2. Total Columns: 27
3. Dataset Source: Kaggle – Global Superstore Sales Dataset
4. Target Variable: Sales

## Data Quality Assessment
Missing Values
1. Total Missing Values: Minimal
2. Columns with Missing Values: Some shipping-related and categorical columns
Handling Strategy:
1. Numerical columns - Median imputation
2. Categorical columns - Mode or "Unknown"
3. Target variable - No missing values allowed 

## Duplicate Records
1. Total Duplicates: Checked using full-row comparison
2. Action Taken: Duplicates removed before model training

## Outliers
1. Detection Method: Interquartile Range 
2. Columns Affected: Sales, Profit, Quantity
3. Handling Strategy: Extreme outliers retained if business-valid otherwise flagged for review

## Revenue Insights
1. Top Category: Technology
2. Top Product: High-end Office Equipment & Accessories
3. Highest Sales Region: Western Region

## Profitability Insights
1. High Discount Impact:Strong negative correlation observed between Discount and Profit.
Higher discounts often reduce profitability significantly
2. Loss-Making Segments: Some subcategories show negative overall profit due to excessive discounting.

## Trend Insights
1. Yearly Growth: Sales show steady year-over-year growth trend.
2. Seasonal Pattern: Higher sales observed during Q4 (holiday season), indicating seasonal demand spike.

## Model Performance
1. Model Used: Random Forest Regressor (Best Performing Model)
2. Evaluation Strategy: Train-Test Split (80/20)
3. RMSE: 277.27
4. R² Score: 0.71
## Feature Importance:
1. Quantity
2. Discount
3. Category
4. Sub-Category
5. Shipping Cost
6. Region
Quantity and Discount have the strongest impact on Sales prediction.

## Limitations
1. Dataset limited to historical transactional data only
2. External macroeconomic factors not included
3. Marketing spend not included
4. Seasonality modeled implicitly, not explicitly
5. Potential minor leakage if not careful with date-based splitting
6. Model does not account for inventory constraints

## Recommendations
1. Reduce aggressive discounting on low-margin products
2. Focus on profitable subcategories within Technology and Office Supplies
3. Optimize shipping strategies to reduce cost impact
4. Monitor loss-making segments and apply pricing optimization
5. Consider time-series modeling for improved seasonal forecasting
5. Introduce customer segmentation strategy (RFM) for targeted marketing