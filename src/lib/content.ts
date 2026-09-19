import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

async function single<C extends 'site' | 'leadership' | 'patents' | 'beyond'>(
  collection: C,
  id: C,
): Promise<CollectionEntry<C>['data']> {
  const entry = await getEntry(collection, id);
  if (!entry) throw new Error(`Missing content entry ${collection}/${id}`);
  return entry.data as CollectionEntry<C>['data'];
}

export const getSite = () => single('site', 'site');
export const getLeadership = () => single('leadership', 'leadership');
export const getPatents = () => single('patents', 'patents');
export const getBeyond = () => single('beyond', 'beyond');

export const getExperience = async () =>
  (await getCollection('experience'))
    .map((e) => e.data)
    .sort((a, b) => a.start.localeCompare(b.start));

export const getChart = async () =>
  (await getCollection('chart')).map((e) => e.data).sort((a, b) => a.x - b.x);

export const getImpact = async () =>
  (await getCollection('impact')).map((e) => e.data).sort((a, b) => a.order - b.order);
