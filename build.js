/**
 * Reads the version from package.json, runs Terser to minify the source,
 * then prepends a license banner that always stays in sync with the current version.
 */
const { execSync } = require('child_process');
const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const banner = `/*! KD Scroller v${pkg.version} | (c) 2026 KhvichaDev | MIT License */\n`;

execSync('npx terser kd-scroller.js -o kd-scroller.min.js -c -m', { stdio: 'inherit' });

/** Terser preserves string contents verbatim, so the CSS template literal
 * retains its original indentation. This collapses those '\n' + spaces
 * sequences into a single space, cutting file size without affecting CSS validity.
 */
let minified = fs.readFileSync('./kd-scroller.min.js', 'utf8');
minified = minified.replace(/\\n\s+/g, ' ');
fs.writeFileSync('./kd-scroller.min.js', banner + minified);

console.log(`\n✓ Build complete — v${pkg.version}`);
