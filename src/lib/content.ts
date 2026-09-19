import { getCollection, getEntry } from 'astro:content';

async function single<C extends 'site' | 'leadership' | 'patents' | 'beyond'>(
  collection: C,
  id: C,
) {
  const entry = await getEntry(collection, id);
  if (!entry) throw new Error(`Missing content entry ${collection}/${id}`);
  return entry.data;
}

export const getSite = () => single('site', 'site');
export const getLeadership = () => single('leadership', 'leadership');
export const getPatents = () => single('patents', 'patents');
export const getBeyond = () => single('beyond', 'beyond');
export const getExperience = async () => (await getCollection('experience')).map((e) => e.data);
export const getChart = async () => (await getCollection('chart')).map((e) => e.data);
export const getImpact = async () => (await getCollection('impact')).map((e) => e.data);
