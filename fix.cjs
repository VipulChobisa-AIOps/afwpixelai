const fs = require('fs');
let content = fs.readFileSync('index.tsx', 'utf8');

// I will just use regex to remove the duplicate segment.
// It starts with 'const validateKey = async' and ends with 'const fileInputRef = useRef<HTMLInputElement>(null);' right before the actual 'const validateKey' we want to keep.

content = content.replace(/  const validateKey = async \(key: string, isSilentLoad = false\) => \{\n    setIsValidating\(true\);[\s\S]*?  const fileInputRef = useRef<HTMLInputElement>\(null\);\n/m, '');

fs.writeFileSync('index.tsx', content, 'utf8');
console.log("Fixed duplicates!");
