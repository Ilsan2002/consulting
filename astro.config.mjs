import { defineConfig } from 'astro/config';

// Kenius v3 — static output; build.format 'file' emits services.html etc.
// so URLs match the current Cloudflare Pages clean-URL setup exactly.
export default defineConfig({
  site: 'https://kenius.us',
  output: 'static',
  build: { format: 'file' },
});
