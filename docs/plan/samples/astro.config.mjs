import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://keithhuster.com',
  output: 'static',                 // default; every page prerendered, api/contact opts out with prerender = false
  adapter: cloudflare(),            // v14: built on @cloudflare/vite-plugin; astro dev runs in workerd, astro preview runs the built Worker
  build: { inlineStylesheets: 'always' },   // one page, one request: inline the ~12 KB of CSS
  prefetch: false,
});
