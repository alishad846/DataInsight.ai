# EDA Summary

## Dataset Overview
Rows: 34
Columns: 10

## Missing Values (%)
order_id: 0.0%
order_date: 0.0%
product: 0.0%
category: 0.0%
region: 0.0%
quantity: 0.0%
unit_price: 0.0%
sales: 0.0%
order_month: 0.0%
avg_price_per_unit: 0.0%

## Duplicate Rows
0 duplicates found

## Basic Statistics
          order_id                     order_date   quantity   unit_price        sales  order_month  avg_price_per_unit
count    34.000000                             34  34.000000    34.000000    34.000000    34.000000           34.000000
mean   1017.500000  2023-06-19 16:56:28.235294208   2.794118  1084.294118  2308.970588     6.352941         1084.294118
min    1001.000000            2023-01-05 00:00:00   1.000000   299.000000   499.000000     1.000000          299.000000
25%    1009.250000            2023-03-19 06:00:00   2.000000   499.000000  1497.000000     3.250000          499.000000
50%    1017.500000            2023-06-12 12:00:00   2.000000   999.000000  1999.000000     6.000000          999.000000
75%    1025.750000            2023-09-07 18:00:00   3.750000  1874.000000  2998.000000     9.000000         1874.000000
max    1034.000000            2023-12-20 00:00:00   7.000000  1999.000000  5997.000000    12.000000         1999.000000
std       9.958246                            NaN   1.647393   716.105779  1319.635154     3.566531          716.105779

## Sales by Region
region
East     24180
North    19467
South    17481
West     17377

## Sales by Category
category
Accessories    32053
Apparel        16467
Footwear       29985

## Monthly Sales Trend
order_month
1      3894
2      5996
3      7091
4      4991
5      9491
6      4395
7      6788
8      8690
9      5497
10     3093
11     6496
12    12083

## Correlation with Sales
sales                 1.000000
unit_price            0.628521
avg_price_per_unit    0.628521
order_id              0.297572
order_month           0.296825
quantity              0.054262

