const fs = require('fs');

const lines = fs.readFileSync('index.tsx', 'utf8').split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
    // lines is 0-indexed. 
    // Line 396 is index 395
    // Line 439 is index 438
    if (i >= 395 && i <= 438) {
        continue;
    }
    newLines.push(lines[i]);
}

fs.writeFileSync('index.tsx', newLines.join('\n'), 'utf8');
console.log('Fixed completely!');
