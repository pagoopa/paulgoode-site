import { getEntry, render } from 'astro:content';

/** Loads a page's copy from src/content/pages/<id>.md. */
export async function getPage(id: string) {
  const page = await getEntry('pages', id);
  if (!page) throw new Error(`Missing src/content/pages/${id}.md`);
  const { Content } = await render(page);
  return { data: page.data, Content };
}
