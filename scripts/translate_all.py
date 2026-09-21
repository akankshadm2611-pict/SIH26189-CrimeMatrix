import json
import re

# Load existing translations from LanguageContext.tsx
with open("src/context/LanguageContext.tsx") as f:
    lc_content = f.read()

# Load clean missing
with open("/tmp/clean_missing.json") as f:
    clean_missing = json.load(f)

print(f"Total clean missing to provide: {len(clean_missing)}")
