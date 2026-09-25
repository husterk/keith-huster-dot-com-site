import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';
import { parse } from 'yaml';

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
    contact: z.object({
      eyebrow: z.string(),
      heading: z.string(),
      formIntro: z.string(),
      linkedinLabel: z.string(),
      githubLabel: z.string(),
    }),
    footer: z.string(),
    footerLinks: z.object({ colophon: z.string(), back: z.string() }),
    seo: z.object({ title: z.string(), description: z.string() }),
    person: z.object({
      jobTitle: z.string(),
      employer: z.string(),
      city: z.string(),
      region: z.string(),
      country: z.string(),
    }),
    nav: z.object({
      links: z.array(link).min(1),
      menu: z.string(),
      cta: link,
      skip: z.string(),
    }),
    experience: z.object({
      eyebrow: z.string(),
      heading: z.string(),
      intro: z.string(),
      nowLabel: z.string(),
    }),
    impact: z.object({ eyebrow: z.string(), heading: z.string(), segmentLabel: z.string() }),
    form: z.object({
      name: z.string(),
      email: z.string(),
      message: z.string(),
      company: z.string(),
      submit: z.string(),
      retry: z.string(),
      fallback: z.string(),
      noscript: z.string(),
      messages: z.record(z.string(), z.string()),
    }),
    endpoint: z.record(z.string(), z.string()),
    notFound: z.object({
      title: z.string(),
      description: z.string(),
      eyebrow: z.string(),
      heading: z.string(),
      body: z.string(),
      cta: z.string(),
    }),
    analytics: z.object({
      googleMeasurementId: z
        .string()
        .regex(/^G-[A-Z0-9]+$/, 'use the GA4 measurement ID, G-XXXXXXXXXX'),
    }),
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
  loader: file('src/content/chart.yaml', {
    parser: (text) =>
      (parse(text) as Record<string, unknown>[]).map((row, index) => ({
        id: String(index),
        ...row,
      })),
  }),
  schema: z.object({
    org: z.string(),
    title: z.string(),
    team: z.string().nullable(),
    start: yearMonth,
    end: yearMonth.nullable(),
  }),
});

const impact = defineCollection({
  loader: file('src/content/impact.yaml'),
  schema: z.object({
    order: z.number().int(),
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
  schema: section.omit({ paragraphs: true }).extend({
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

const phoneNumber = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;

const resume = defineCollection({
  loader: file('src/content/resume.yaml'),
  schema: z
    .object({
      headline: z.string(),
      tagline: z.string(),
      location: z.string(),
      summary: z.string().min(50),
      highlights: z.array(z.string()).min(1),
      positions: z
        .array(
          z.object({
            org: z.string(),
            industry: z.string(),
            title: z.string(),
            team: z.string().nullable(),
            location: z.string(),
            start: yearMonth,
            end: yearMonth.nullable(),
            bullets: z.array(z.string()).min(1),
          }),
        )
        .min(1)
        .refine(
          (positions) => positions.every((p, i) => i === 0 || p.start <= positions[i - 1].start),
          'list positions newest first',
        ),
      education: z
        .array(
          z.object({
            degree: z.string(),
            school: z.string(),
            location: z.string(),
            start: z.number().int(),
            end: z.number().int(),
          }),
        )
        .min(1),
      skills: z.array(z.object({ label: z.string(), items: z.string() })).min(1),
      projects: z.array(z.object({ name: z.string(), body: z.string() })),
      beyond: z.array(z.string()),
    })
    .refine(
      (resume) => !phoneNumber.test(JSON.stringify(resume)),
      'no phone numbers in the résumé',
    ),
});

const colophon = defineCollection({
  loader: file('src/content/colophon.yaml'),
  schema: z.object({
    eyebrow: z.string(),
    title: z.string(),
    description: z.string(),
    sourceNote: z.string(),
    statsLabel: z.string(),
    updatedLabel: z.string(),
    sections: z.record(
      z.enum(['kit', 'decisions', 'route', 'credits']),
      z.object({ emoji: z.string(), title: z.string() }),
    ),
    map: z.object({
      label: z.string(),
      railNote: z.string(),
      labels: z.array(
        z.object({
          text: z.string(),
          kind: z.enum(['place', 'big', 'mile']),
          x: z.number(),
          y: z.number(),
          anchor: z.enum(['start', 'middle', 'end']),
        }),
      ),
    }),
    intro: z.string(),
    summary: z.string(),
    repo: z.url(),
    updated: z.coerce.date(),
    stats: z.array(stat).length(4),
    kit: z
      .array(z.object({ emoji: z.string(), label: z.string(), title: z.string(), why: z.string() }))
      .min(6),
    decisions: z.array(z.object({ emoji: z.string(), title: z.string(), body: z.string() })).min(3),
    legend: z
      .array(
        z.object({ emoji: z.string(), place: z.string(), section: z.string(), color: z.string() }),
      )
      .length(6),
    themeNote: z.string(),
    credits: z.string(),
  }),
});

export const collections = {
  site,
  experience,
  chart,
  impact,
  leadership,
  patents,
  beyond,
  resume,
  colophon,
};
