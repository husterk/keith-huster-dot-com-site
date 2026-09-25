import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

type Single = 'site' | 'leadership' | 'patents' | 'beyond' | 'resume' | 'colophon';

type Facts = CollectionEntry<'resume'>['data']['facts'];

const FACT = /\{\{(\w+)\}\}/g;

function fill<T>(value: T, facts: Facts): T {
  if (typeof value === 'string') {
    return value.replace(FACT, (_, name: string) => {
      if (!(name in facts)) throw new Error(`Unknown fact {{${name}}}; add it to resume.yaml`);
      return String(facts[name]);
    }) as T;
  }
  if (Array.isArray(value)) return value.map((item) => fill(item, facts)) as T;
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, fill(item, facts)]),
    ) as T;
  }
  return value;
}

async function entry<C extends Single>(collection: C): Promise<CollectionEntry<C>['data']> {
  const found = await getEntry(collection, collection);
  if (!found) throw new Error(`Missing content entry ${collection}/${collection}`);
  return found.data as CollectionEntry<C>['data'];
}

const facts = async () => (await entry('resume')).facts;

async function single<C extends Single>(collection: C): Promise<CollectionEntry<C>['data']> {
  return fill(await entry(collection), await facts());
}

export const getSite = () => single('site');
export const getLeadership = () => single('leadership');
export const getPatents = () => single('patents');
export const getBeyond = () => single('beyond');
export const getResume = () => single('resume');
export const getColophon = () => single('colophon');

export const getPositions = async () => [...(await getResume()).positions].reverse();

export const getExperience = async () => {
  const [positions, site, known] = await Promise.all([getPositions(), getSite(), facts()]);
  return (await getCollection('experience'))
    .map(({ id, data }) => {
      const card = fill(data, known);
      const covered = positions.filter(
        (p) => card.orgs.includes(p.org) && (!card.team || p.team === card.team),
      );
      if (!covered.length) throw new Error(`Experience card ${id} matches no résumé position`);
      const start = covered[0].start;
      const end = covered[covered.length - 1].end;
      const places = [
        ...new Set(covered.map((p) => (p.location.includes('(Remote)') ? 'Remote' : p.location))),
      ];
      const years = `${start.slice(0, 4)} – ${end ? end.slice(0, 4) : site.experience.nowLabel}`;
      return { ...card, start, current: end === null, dates: `${years} · ${places.join(', ')}` };
    })
    .sort((a, b) => a.start.localeCompare(b.start));
};

export const getImpact = async () => {
  const known = await facts();
  return (await getCollection('impact'))
    .map((e) => fill(e.data, known))
    .sort((a, b) => a.order - b.order);
};
