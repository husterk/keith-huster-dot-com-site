import { createHash } from 'node:crypto';
import { headScript, unregisterServiceWorkers } from './src/lib/inline-scripts.mjs';
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

const sha256 = (code) => `sha256-${createHash('sha256').update(code).digest('base64')}`;

export default defineConfig({
  site: 'https://keithhuster.com',
  output: 'static',
  adapter: cloudflare({ imageService: 'passthrough' }),
  session: false,
  build: { inlineStylesheets: 'always', format: 'file' },
  prefetch: false,
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self' https://cloudflareinsights.com",
        'frame-src https://challenges.cloudflare.com',
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      styleDirective: {
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
      scriptDirective: {
        hashes: [sha256(headScript), sha256(unregisterServiceWorkers)],
        resources: [
          "'self'",
          'https://challenges.cloudflare.com',
          'https://static.cloudflareinsights.com',
        ],
      },
    },
  },
  markdown: { processor: satteri({ hastPlugins: [externalLinks] }) },
});
