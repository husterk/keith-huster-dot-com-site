import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

const content = async (name: string) =>
  parse(await readFile(new URL(`../src/content/${name}.yaml`, import.meta.url), 'utf8'));
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

// Numerals come from {{facts}}; these checks cover the copy that spells a fact out in words.
test('copy that spells out a résumé fact agrees with it', async () => {
  const { facts } = (await content('resume'))[0];
  const leadership = (await content('leadership'))[0];
  const olo = (await content('experience')).find((card: { id: string }) => card.id === 'olo-infra');
  const prose = leadership.paragraphs.join(' ');

  expect(leadership.heading.toLowerCase()).toContain(`${words[facts.teamSize]} engineers`);
  expect(leadership.heading.toLowerCase()).toContain(
    `${words[facts.highSeverityIncidents]} high-severity incidents`,
  );
  expect(prose).toContain(`${words[facts.teamSize]}-engineer`);
  expect(prose).toContain(`hired and onboarded ${words[facts.hires]} `);
  expect(prose).toContain(`${words[facts.highSeverityIncidents]} high-severity`);
  expect(prose).toContain(`more than ${String(facts.mentored).replace('+', '')} engineers`);
  expect(olo.summary).toContain(`${words[facts.teamSize]}-engineer`);
});

test('every {{fact}} placeholder resolves in the built pages', async () => {
  for (const page of ['index', 'colophon', 'resume', '404']) {
    const html = await readFile(new URL(`../dist/client/${page}.html`, import.meta.url), 'utf8');
    expect(html, page).not.toMatch(/\{\{\w+\}\}/);
  }
});
