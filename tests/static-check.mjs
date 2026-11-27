import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

assert.match(html, /^<!DOCTYPE html>/i, 'index.html must keep a doctype');
assert.match(html, /<\/html>\s*$/i, 'index.html must end with </html>');
assert.doesNotMatch(html, /doubao\.link/i, 'third-party page source must not be embedded');
assert.doesNotMatch(html, /<script\b[^>]*\bsrc=/i, 'external script tags are not allowed');

const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
assert.ok(scripts.length > 0, 'index.html must contain inline application code');

for(const [, source] of scripts){
  assert.doesNotThrow(() => new Function(source), 'inline JavaScript must parse');
}

console.log(`static checks passed (${html.length} chars)`);
