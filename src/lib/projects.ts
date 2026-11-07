import { getCollection, type CollectionEntry } from 'astro:content';

/** Projects that can be shown (drafts only while running the site locally), in order. */
export async function getProjects() {
  const all = (await getCollection('projects', ({ data }) => import.meta.env.DEV || !data.draft)).sort(
    (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || a.data.title.localeCompare(b.data.title),
  );
  const featured = all.find((p) => p.data.featured);
  return { all, featured, others: all.filter((p) => p !== featured) };
}

/** /projects/<project>, or the series' own landing page for a series project. */
export function projectUrl(project: CollectionEntry<'projects'>) {
  return project.data.series ? `/series/${project.data.series.id}` : `/projects/${project.id}`;
}
