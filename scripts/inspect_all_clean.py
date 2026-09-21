import json

with open("/tmp/clean_missing.json") as f:
    clean_missing = json.load(f)

for idx, s in enumerate(clean_missing):
    print(f"{idx}: {repr(s)}")
