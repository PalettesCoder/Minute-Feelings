const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

const idx = c.indexOf('setActiveChapterId(ch.id)');
if (idx === -1) {
  console.log('NOT FOUND');
} else {
  const snippet = c.substring(idx - 100, idx + 300);
  console.log('FOUND AT', idx);
  console.log(snippet);
}
