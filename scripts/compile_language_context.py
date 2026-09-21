import json
import re

# Read existing translations from LanguageContext.tsx
with open("src/context/LanguageContext.tsx", "r", encoding="utf-8") as f:
    existing_file = f.read()

with open("/tmp/translations_map.json", "r", encoding="utf-8") as f:
    new_translations = json.load(f)

with open("/tmp/word_expansions.json", "r", encoding="utf-8") as f:
    word_expansions = json.load(f)

# Extract TRANSLATIONS object from existing file
match = re.search(r'export const TRANSLATIONS: Record<string, string> = \{([\s\S]*?)\n\};', existing_file)
if not match:
    raise ValueError("Could not find TRANSLATIONS in LanguageContext.tsx")

existing_dict_raw = match.group(1)
dict_entries = {}

# Parse existing entries
for line in existing_dict_raw.split('\n'):
    m = re.match(r"^\s*['\"](.*?)['\"]\s*:\s*['\"](.*?)['\"]\s*,?", line)
    if m:
        dict_entries[m.group(1)] = m.group(2)

print(f"Existing dictionary entries: {len(dict_entries)}")

# Merge new translations
for k, v in new_translations.items():
    dict_entries[k] = v

print(f"Total merged dictionary entries: {len(dict_entries)}")

# Also extract existing WORD_MAP
match_wm = re.search(r'const WORD_MAP: Record<string, string> = \{([\s\S]*?)\n\};', existing_file)
wm_entries = {}
if match_wm:
    for line in match_wm.group(1).split('\n'):
        m = re.match(r"^\s*['\"](.*?)['\"]\s*:\s*['\"](.*?)['\"]\s*,?", line)
        if m:
            wm_entries[m.group(1)] = m.group(2)

print(f"Existing WORD_MAP entries: {len(wm_entries)}")

# Merge word expansions
for k, v in word_expansions.items():
    wm_entries[k] = v

print(f"Total merged WORD_MAP entries: {len(wm_entries)}")

# Format TRANSLATIONS
formatted_trans = "export const TRANSLATIONS: Record<string, string> = {\n"
# Sort by length descending for best phrase matching
for k in sorted(dict_entries.keys(), key=lambda x: (-len(x), x)):
    # Escape quotes
    k_esc = k.replace('\\', '\\\\').replace("'", "\\'")
    v_esc = dict_entries[k].replace('\\', '\\\\').replace("'", "\\'")
    formatted_trans += f"  '{k_esc}': '{v_esc}',\n"
formatted_trans += "};"

# Format WORD_MAP
formatted_wm = "const WORD_MAP: Record<string, string> = {\n"
for k in sorted(wm_entries.keys(), key=lambda x: (-len(x), x)):
    k_esc = k.replace('\\', '\\\\').replace("'", "\\'")
    v_esc = wm_entries[k].replace('\\', '\\\\').replace("'", "\\'")
    formatted_wm += f"  '{k_esc}': '{v_esc}',\n"
formatted_wm += "};"

# Generate new LanguageContext.tsx
new_code = f"""import React, {{"createContext", "useContext", "useState", "useEffect", "useRef", "ReactNode"}} from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {{
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (text: string, fallback?: string) => string;
  isHindi: boolean;
}}

// Master comprehensive dictionary for Crime Matrix Portal ({len(dict_entries)} entries)
{formatted_trans}

// Vocabulary mapping for word-level translation in dynamic strings ({len(wm_entries)} words)
{formatted_wm}

// Pre-sorted translation keys
const SORTED_KEYS = Object.keys(TRANSLATIONS).sort((a, b) => b.length - a.length);
const SORTED_WORDS = Object.keys(WORD_MAP).sort((a, b) => b.length - a.length);

/**
 * Universal Hindi translation function for any text in Crime Matrix Portal
 */
export function translateToHindi(text: string): string {{
  if (!text) return text;

  // 1. Direct exact match
  if (TRANSLATIONS[text]) {{
    return TRANSLATIONS[text];
  }}

  // 2. Exact match with whitespace preserved
  const trimmed = text.trim();
  if (TRANSLATIONS[trimmed]) {{
    const leading = text.match(/^\\s*/)?.[0] || '';
    const trailing = text.match(/\\s*$/)?.[0] || '';
    return leading + TRANSLATIONS[trimmed] + trailing;
  }}

  // If text is purely numeric, punctuation, or technical code (e.g. SHA-256 hashes, URLs, UUIDs), return as is
  if (/^[0-9\\s.,:/#@*+=_\\-\\(\\)\\[\\]%]+$/.test(text)) {{
    return text;
  }}
  if (text.startsWith('http://') || text.startsWith('https://') || text.includes('@gmail.com') || /^[a-f0-9]{{32,64}}$/i.test(text)) {{
    return text;
  }}

  let result = text;

  // 3. Multi-phrase replacement using sorted dictionary keys with boundary lookaround
  for (let i = 0; i < SORTED_KEYS.length; i++) {{
    const key = SORTED_KEYS[i];
    if (key.length < 3) continue;

    if (result.includes(key)) {{
      const escaped = key.replace(/[-/\\\\^$*+?.()|[\\]{{}}]/g, '\\\\$&');
      // Use boundary: start or non-alphanumeric before, end or non-alphanumeric after
      const regex = new RegExp(`(^|(?<=[^a-zA-Z0-9]))${{escaped}}(?=[^a-zA-Z0-9]|$)`, 'g');
      result = result.replace(regex, TRANSLATIONS[key]);
    }}
  }}

  // 4. Word-level replacement for any residual English terms
  if (/[a-zA-Z]/.test(result)) {{
    for (let i = 0; i < SORTED_WORDS.length; i++) {{
      const word = SORTED_WORDS[i];
      if (word.length < 2) continue;

      const escaped = word.replace(/[-/\\\\^$*+?.()|[\\]{{}}]/g, '\\\\$&');
      const regex = new RegExp(`(^|(?<=[^a-zA-Z0-9]))${{escaped}}(?=[^a-zA-Z0-9]|$)`, 'gi');
      if (regex.test(result)) {{
        result = result.replace(regex, WORD_MAP[word]);
      }}
    }}
  }}

  return result;
}}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Storage for original English text and attributes of DOM nodes
const originalTextMap = new WeakMap<Node, string>();
const originalAttrMap = new WeakMap<Element, {{ placeholder?: string; title?: string; 'aria-label'?: string; value?: string }}>();

export const LanguageProvider: React.FC<{{ children: ReactNode }}> = ({{ children }}) => {{
  const [language, setLanguageState] = useState<Language>(() => {{
    try {{
      const saved = localStorage.getItem('crime_matrix_lang');
      return saved === 'hi' ? 'hi' : 'en';
    }} catch {{
      return 'en';
    }}
  }});

  const observerRef = useRef<MutationObserver | null>(null);
  const isTranslatingRef = useRef(false);

  const setLanguage = (lang: Language) => {{
    setLanguageState(lang);
    try {{
      localStorage.setItem('crime_matrix_lang', lang);
    }} catch {{
      // ignore
    }}
  }};

  const toggleLanguage = () => {{
    setLanguage(language === 'en' ? 'hi' : 'en');
  }};

  const t = (text: string, fallback?: string): string => {{
    if (language === 'en') {{
      return fallback || text;
    }}
    return translateToHindi(text) || fallback || text;
  }};

  // DOM Live Translation Engine
  useEffect(() => {{
    if (typeof document === 'undefined') return;

    document.documentElement.lang = language;

    const translateNode = (node: Node) => {{
      // Handle text nodes
      if (node.nodeType === Node.TEXT_NODE) {{
        const text = node.nodeValue;
        if (!text || !text.trim()) return;

        // Skip script, style, code, or contenteditable parents
        const parent = node.parentElement;
        if (parent) {{
          const tag = parent.tagName.toUpperCase();
          if (
            tag === 'SCRIPT' ||
            tag === 'STYLE' ||
            tag === 'NOSCRIPT' ||
            tag === 'CODE' ||
            tag === 'PRE' ||
            parent.closest('[data-no-translate="true"]') !== null ||
            parent.isContentEditable
          ) {{
            return;
          }}
        }}

        // If node has English letters or hasn't been recorded yet, store original
        const currentVal = node.nodeValue || '';
        const hasEnglish = /[a-zA-Z]/.test(currentVal);
        if (!originalTextMap.has(node) || hasEnglish) {{
          originalTextMap.set(node, currentVal);
        }}

        const original = originalTextMap.get(node) || currentVal;
        const translated = translateToHindi(original);
        if (node.nodeValue !== translated) {{
          node.nodeValue = translated;
        }}
      }} else if (node.nodeType === Node.ELEMENT_NODE) {{
        const el = node as HTMLElement;
        const tag = el.tagName.toUpperCase();
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') return;
        if (el.closest('[data-no-translate="true"]')) return;

        // Translate placeholders
        if (el.getAttribute('placeholder')) {{
          const ph = el.getAttribute('placeholder')!;
          if (!originalAttrMap.has(el)) {{
            originalAttrMap.set(el, {{ placeholder: ph }});
          }} else {{
            const cur = originalAttrMap.get(el)!;
            if (!cur.placeholder || /[a-zA-Z]/.test(ph)) cur.placeholder = ph;
          }}
          const originalPh = originalAttrMap.get(el)?.placeholder || ph;
          const translatedPh = translateToHindi(originalPh);
          if (el.getAttribute('placeholder') !== translatedPh) {{
            el.setAttribute('placeholder', translatedPh);
          }}
        }}

        // Translate title attribute
        if (el.getAttribute('title')) {{
          const ttl = el.getAttribute('title')!;
          if (!originalAttrMap.has(el)) {{
            originalAttrMap.set(el, {{ title: ttl }});
          }} else {{
            const cur = originalAttrMap.get(el)!;
            if (!cur.title || /[a-zA-Z]/.test(ttl)) cur.title = ttl;
          }}
          const originalTtl = originalAttrMap.get(el)?.title || ttl;
          const translatedTtl = translateToHindi(originalTtl);
          if (el.getAttribute('title') !== translatedTtl) {{
            el.setAttribute('title', translatedTtl);
          }}
        }}

        // Translate aria-label
        if (el.getAttribute('aria-label')) {{
          const al = el.getAttribute('aria-label')!;
          if (!originalAttrMap.has(el)) {{
            originalAttrMap.set(el, {{ 'aria-label': al }});
          }} else {{
            const cur = originalAttrMap.get(el)!;
            if (!cur['aria-label'] || /[a-zA-Z]/.test(al)) cur['aria-label'] = al;
          }}
          const originalAl = originalAttrMap.get(el)?.['aria-label'] || al;
          const translatedAl = translateToHindi(originalAl);
          if (el.getAttribute('aria-label') !== translatedAl) {{
            el.setAttribute('aria-label', translatedAl);
          }}
        }}

        // Walk all child nodes
        for (let i = 0; i < el.childNodes.length; i++) {{
          translateNode(el.childNodes[i]);
        }}
      }}
    }};

    const restoreNode = (node: Node) => {{
      if (node.nodeType === Node.TEXT_NODE) {{
        if (originalTextMap.has(node)) {{
          const original = originalTextMap.get(node);
          if (original !== undefined && node.nodeValue !== original) {{
            node.nodeValue = original;
          }}
        }}
      }} else if (node.nodeType === Node.ELEMENT_NODE) {{
        const el = node as HTMLElement;
        if (originalAttrMap.has(el)) {{
          const stored = originalAttrMap.get(el)!;
          if (stored.placeholder) el.setAttribute('placeholder', stored.placeholder);
          if (stored.title) el.setAttribute('title', stored.title);
          if (stored['aria-label']) el.setAttribute('aria-label', stored['aria-label']);
          if (stored.value && (el as HTMLInputElement).value !== undefined) {{
            (el as HTMLInputElement).value = stored.value;
          }}
        }}
        for (let i = 0; i < el.childNodes.length; i++) {{
          restoreNode(el.childNodes[i]);
        }}
      }}
    }};

    if (language === 'hi') {{
      // Translate existing DOM immediately
      translateNode(document.body);

      // Start observing for dynamically added elements or text changes
      const observer = new MutationObserver((mutations) => {{
        if (isTranslatingRef.current) return;
        isTranslatingRef.current = true;
        try {{
          observer.disconnect();
          for (const mutation of mutations) {{
            if (mutation.type === 'childList') {{
              for (let i = 0; i < mutation.addedNodes.length; i++) {{
                translateNode(mutation.addedNodes[i]);
              }}
            }} else if (mutation.type === 'characterData' && mutation.target) {{
              translateNode(mutation.target);
            }}
          }}
        }} finally {{
          observer.observe(document.body, {{
            childList: true,
            subtree: true,
            characterData: true,
          }});
          isTranslatingRef.current = false;
        }}
      }});

      observer.observe(document.body, {{
        childList: true,
        subtree: true,
        characterData: true,
      }});

      observerRef.current = observer;

      // Periodic sweep to ensure dynamic React renders/modals are translated
      const intervalId = setInterval(() => {{
        if (language === 'hi') {{
          translateNode(document.body);
        }}
      }}, 500);

      return () => {{
        clearInterval(intervalId);
        if (observerRef.current) {{
          observerRef.current.disconnect();
          observerRef.current = null;
        }}
      }};
    }} else {{
      // Disconnect observer and restore English
      if (observerRef.current) {{
        observerRef.current.disconnect();
        observerRef.current = null;
      }}
      restoreNode(document.body);
    }}

    return () => {{
      if (observerRef.current) {{
        observerRef.current.disconnect();
        observerRef.current = null;
      }}
    }};
  }}, [language]);

  return (
    <LanguageContext.Provider
      value={{{{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isHindi: language === 'hi',
      }}}}
    >
      {{children}}
    </LanguageContext.Provider>
  );
}};

export const useLanguage = (): LanguageContextType => {{
  const context = useContext(LanguageContext);
  if (!context) {{
    throw new Error('useLanguage must be used within a LanguageProvider');
  }}
  return context;
}};
"""

with open("src/context/LanguageContext.tsx", "w", encoding="utf-8") as f:
    f.write(new_code)

print("src/context/LanguageContext.tsx successfully updated!")
