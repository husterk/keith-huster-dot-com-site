import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { satteri } from '@astrojs/markdown-satteri';

const externalLinks = {
  name: 'external-links',
  element: {
    filter: ['a'],
    visit(node) {
      const href = node.properties?.href;
      if (
        typeof href !== 'string' ||
        !/^https?:\/\//.test(href) ||
        href.includes('keithhuster.com')
      )
        return;
      return { ...node, properties: { ...node.properties, target: '_blank', rel: 'noopener' } };
    },
  },
};

export default defineConfig({
  site: 'https://keithhuster.com',
  output: 'static',
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  build: { inlineStylesheets: 'always' },
  prefetch: false,
  markdown: { processor: satteri({ hastPlugins: [externalLinks] }) },
});
