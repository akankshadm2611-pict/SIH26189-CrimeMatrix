import json

with open("/tmp/missing_strings.json") as f:
    missing = json.load(f)

# Filter out empty or pure symbols
clean_missing = []
for s in missing:
    s_strip = s.strip()
    if not s_strip:
        continue
    # Filter out pure punctuation / template syntax
    has_letters = any(c.isalpha() for c in s_strip)
    if not has_letters:
        continue
    if s_strip.startswith("${") or s_strip.endswith("}"):
        continue
    clean_missing.append(s)

print(f"Clean missing strings: {len(clean_missing)}")
