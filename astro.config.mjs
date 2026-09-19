import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://keithhuster.com',
  output: 'static',
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  build: { inlineStylesheets: 'always' },
  prefetch: false,
});
