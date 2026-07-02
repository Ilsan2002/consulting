#!/usr/bin/env node
/**
 * Multi-viewport screenshot + console-error capture for the visual feedback loop.
 *
 * Usage:
 *   node screenshot.mjs <url-or-html-file> <output-dir> [--viewport name:WxH ...]
 *
 * Examples:
 *   node screenshot.mjs ./dist/index.html ./shots
 *   node screenshot.mjs http://localhost:3000 ./shots
 *   node screenshot.mjs ./index.html ./shots --viewport ultrawide:1920x1080
 *
 * Setup (once per environment):
 *   npm i playwright
 *   npx playwright install chromium --with-deps   # or --only-shell if deps fail
 *
 * Output: <output-dir>/{desktop,tablet,mobile}.png (full-page)
 *         <output-dir>/console.log (errors/warnings, if any)
 */

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DEFAULT_VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const [, , target, outDir = './shots', ...rest] = process.argv;
if (!target) {
  console.error('Usage: node screenshot.mjs <url-or-html-file> <output-dir> [--viewport name:WxH ...]');
  process.exit(1);
}

const extraViewports = [];
for (let i = 0; i < rest.length; i++) {
  if (rest[i] === '--viewport' && rest[i + 1]) {
    const [name, dims] = rest[++i].split(':');
    const [width, height] = (dims || '').split('x').map(Number);
    if (name && width && height) extraViewports.push({ name, width, height });
  }
}
const viewports = extraViewports.length ? extraViewports : DEFAULT_VIEWPORTS;

const url = /^https?:\/\//i.test(target)
  ? target
  : pathToFileURL(resolve(target)).href;

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const consoleLines = [];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  page.on('console', (msg) => {
    if (['error', 'warning'].includes(msg.type())) {
      consoleLines.push(`[${vp.name}] [${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => consoleLines.push(`[${vp.name}] [pageerror] ${err.message}`));

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch {
    // networkidle can hang on long-polling pages; fall back to load
    await page.goto(url, { waitUntil: 'load', timeout: 30000 }).catch((e) => {
      consoleLines.push(`[${vp.name}] [navigation-failed] ${e.message}`);
    });
  }
  // Let fonts/animations settle so the screenshot reflects the real render
  await page.waitForTimeout(1200);

  const path = resolve(outDir, `${vp.name}.png`);
  await page.screenshot({ path, fullPage: true });
  console.log(`✓ ${vp.name} (${vp.width}x${vp.height}) → ${path}`);
  await page.close();
}

await browser.close();

if (consoleLines.length) {
  const logPath = resolve(outDir, 'console.log');
  writeFileSync(logPath, consoleLines.join('\n') + '\n');
  console.log(`⚠ ${consoleLines.length} console issue(s) → ${logPath}`);
} else {
  console.log('✓ no console errors/warnings');
}
