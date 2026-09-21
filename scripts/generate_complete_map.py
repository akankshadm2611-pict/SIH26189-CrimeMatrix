import json
import re

with open("/tmp/clean_missing.json") as f:
    clean_missing = json.load(f)

print(f"Total clean missing to translate: {len(clean_missing)}")

# Write all clean missing strings to a text file for comprehensive translation mapping
with open("/tmp/strings_to_map.txt", "w") as f:
    for s in clean_missing:
        f.write(s + "\n")
