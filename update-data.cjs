const fs = require('fs');

let content = fs.readFileSync('src/data.ts', 'utf-8');

// Replace USR-001 completely
const regex = /,\s*\{\s*id:\s*'USR-001'[\s\S]*?\}\s*\];/g;
content = content.replace(regex, '\n];');

fs.writeFileSync('src/data.ts', content);
