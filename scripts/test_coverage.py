import json
import re

with open("/tmp/new_translations.json") as f:
    new_trans = json.load(f)

with open("/tmp/word_expansions.json") as f:
    words = json.load(f)

with open("/tmp/clean_missing.json") as f:
    clean_missing = json.load(f)

uncovered = []
for s in clean_missing:
    if s in new_trans:
        continue
    s_trim = s.strip()
    if s_trim in new_trans:
        continue
    # Test if words would cover it
    tokens = re.findall(r'[a-zA-Z]+', s)
    covered_tokens = [t for t in tokens if t in words or t.capitalize() in words or t.lower() in words]
    if len(covered_tokens) == len(tokens):
        continue
    uncovered.append((s, [t for t in tokens if t not in words and t.capitalize() not in words and t.lower() not in words]))

print(f"Uncovered strings: {len(uncovered)}")
for s, missing_tokens in uncovered[:40]:
    print(f"  {repr(s)} => missing: {missing_tokens}")
