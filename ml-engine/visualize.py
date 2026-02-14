import pandas as pd
import sys
import json
import os

file_path = sys.argv[1]
df = pd.read_csv(file_path)

os.makedirs("visuals", exist_ok=True)

summary = {
    "rows": df.shape[0],
    "columns": df.shape[1],
    "column_names": list(df.columns),
    "numeric_columns": list(df.select_dtypes(include="number").columns)
}

with open("visuals/summary.json", "w") as f:
    json.dump(summary, f, indent=4)

print(json.dumps({"visual_file": "visuals/summary.json"}))
