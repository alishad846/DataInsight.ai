import sys
import json
import pandas as pd
from analytics.summary import compute_summary

try:
    # ✅ Read JSON from STDIN (not argv)
    payload = json.load(sys.stdin)

    df = pd.read_csv(payload["dataset_path"])
    summary = compute_summary(df)

    print(json.dumps(summary))

except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
