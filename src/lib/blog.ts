import { getCollection } from 'astro:content';

/** How many posts the journal shows per page. */
export const POSTS_PER_PAGE = 3;

/** Published posts, newest first. Drafts only show while running the site locally. */
export async function getJournalPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Page 1 is the home page; later pages are /blog/page/2, /blog/page/3, … */
export function journalPageUrl(page: number) {
  return page === 1 ? '/' : `/blog/page/${page}`;
}
