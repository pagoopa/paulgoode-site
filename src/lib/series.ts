import { getCollection, type CollectionEntry } from 'astro:content';

/** Entries that can be shown: drafts only while running the site locally. */
export async function getSeriesEntries(seriesId?: string) {
  const entries = await getCollection(
    'entries',
    ({ data }) => (import.meta.env.DEV || !data.draft) && (!seriesId || data.series.id === seriesId),
  );
  // In number order: 001 first.
  return entries.sort((a, b) => a.data.number.localeCompare(b.data.number));
}

/** /series/<series>/<entry> */
export function entryUrl(entry: CollectionEntry<'entries'>) {
  return `/series/${entry.data.series.id}/${entry.id}`;
}
