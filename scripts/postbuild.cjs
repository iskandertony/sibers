// scripts/postbuild.cjs
// Copies dist/index.html to dist/404.html for SPA fallback on GitHub Pages
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const src = path.join(dist, 'index.html');
const dst = path.join(dist, '404.html');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dst);
  console.log('[postbuild] 404.html created');
} else {
  console.warn('[postbuild] index.html not found');
}
