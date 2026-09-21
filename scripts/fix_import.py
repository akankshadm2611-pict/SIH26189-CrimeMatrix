with open("src/context/LanguageContext.tsx", "r", encoding="utf-8") as f:
    code = f.read()

code = code.replace(
    'import React, {\'createContext\', \'useContext\', \'useState\', \'useEffect\', \'useRef\', \'ReactNode\'} from \'react\';',
    'import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from \'react\';'
)
code = code.replace(
    'import React, {"createContext", "useContext", "useState", "useEffect", "useRef", "ReactNode"} from \'react\';',
    'import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from \'react\';'
)

with open("src/context/LanguageContext.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("Fixed import!")
