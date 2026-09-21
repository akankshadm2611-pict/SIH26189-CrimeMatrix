import json
import re

# Read clean missing strings
with open("/tmp/clean_missing.json") as f:
    clean_missing = json.load(f)

# Read indexed missing to ensure 100% coverage
print(f"Total clean missing: {len(clean_missing)}")
