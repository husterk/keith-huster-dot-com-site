import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const link = z.object({ label: z.string(), href: z.string() });
const stat = z.object({ value: z.string(), label: z.string() });
const yearMonth = z.string().regex(/^\d{4}-\d{2}$/, 'use YYYY-MM');

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
    chips: z.array(z.string()).min(1),
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
    start: yearMonth,
    end: yearMonth.nullable(),
    location: z.string(),
    current: z.boolean().default(false),
    dates: z.string(),
    cardTitle: z.string(),
    summary: z.string(),
  }),
});

const chart = defineCollection({
  loader: file('src/content/chart.yaml'),
  schema: z.object({
    x: z.number().min(0).max(1280),
    y: z.number().min(0).max(300),
    year: z.string(),
    label: z.string().optional(),
    note: z.string().optional(),
    labelAnchor: z.enum(['start', 'middle', 'end']).default('middle'),
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
  schema: section.extend({ bigNumber: z.string(), education: z.array(z.string()).min(1) }),
});

const beyond = defineCollection({
  loader: file('src/content/beyond.yaml'),
  schema: section.extend({
    feature: z.object({
      caption: z.string(),
      title: z.string(),
      body: z.string(),
      from: z.string(),
      to: z.string(),
    }),
    boxes: z
      .array(z.object({ caption: z.string(), title: z.string(), body: z.string() }))
      .length(3),
  }),
});

export const collections = { site, experience, chart, impact, leadership, patents, beyond };
