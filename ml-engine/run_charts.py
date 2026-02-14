import sys, json, pandas as pd
from analytics.line import line_chart
from analytics.bar import bar_chart
from analytics.pie import pie_chart

payload = json.load(sys.stdin)
df = pd.read_csv(payload["dataset_path"])

chart = payload["chart"]

if chart == "line":
    result = line_chart(df)
elif chart == "bar":
    result = bar_chart(df)
elif chart == "pie":
    result = pie_chart(df)
else:
    raise ValueError("Unsupported chart type")

print(json.dumps(result))
