// src/content.config.ts — the contract for everything in src/content/. Astro 7 / Zod 4 syntax (z.email(), z.url()).
// A build fails with a readable error if a file doesn't match these shapes.
import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const link = z.object({ label: z.string(), href: z.string() });
const stat = z.object({ value: z.string(), label: z.string() });
const ym = z.string().regex(/^\d{4}-\d{2}$/, 'use YYYY-MM');

const site = defineCollection({
  loader: file('src/content/site.yaml'),
  schema: z.object({
    name: z.string(),
    headline: z.object({ lead: z.string(), accent: z.string() }),
    roles: z.string(),
    rolesShort: z.string(),
    location: z.string(),
    intro: z.string().min(50),
    cta: z.object({ primary: link, secondary: link }),
    stats: z.array(stat).length(4),
    links: z.object({ email: z.email(), linkedin: z.url(), github: z.url() }),
    contact: z.object({ eyebrow: z.string(), heading: z.string() }),
    footer: z.string(),
    turnstileSiteKey: z.string(),
  }),
});

const experience = defineCollection({
  loader: file('src/content/experience.yaml'),
  schema: z.object({
    org: z.string(),
    team: z.string().optional(),
    title: z.string(),
    start: ym,
    end: ym.nullable(),            // null = present
    location: z.string(),
    current: z.boolean().default(false),
    summary: z.string(),
    chartLabel: z.string(),
    elevation: z.number().min(0).max(300).optional(),
  }),
});

const impact = defineCollection({
  loader: file('src/content/impact.yaml'),
  schema: z.object({
    title: z.string(),
    body: z.string(),
    result: stat,
    tags: z.array(z.string()).default([]),
  }),
});

const section = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  paragraphs: z.array(z.string()).min(1),
});

const leadership = defineCollection({
  loader: file('src/content/leadership.yaml'),
  schema: section.extend({ cells: z.array(stat).length(4) }),
});

const patents = defineCollection({
  loader: file('src/content/patents.yaml'),
  schema: section.extend({ bigNumber: z.string(), education: z.array(z.string()) }),
});

const beyond = defineCollection({
  loader: file('src/content/beyond.yaml'),
  schema: section.extend({
    feature: z.object({ caption: z.string(), title: z.string(), body: z.string(), from: z.string(), to: z.string() }),
    boxes: z.array(z.object({ caption: z.string(), title: z.string(), body: z.string() })).length(3),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({ title: z.string(), description: z.string(), updated: z.coerce.date() }),
});

export const collections = { site, experience, impact, leadership, patents, beyond, pages };
