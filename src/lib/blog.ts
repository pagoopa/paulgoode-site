import { getCollection, type CollectionEntry } from 'astro:content';

/** How many posts the journal shows per page: the lead card, then two rows of two. */
export const POSTS_PER_PAGE = 5;

/** Published posts, newest first. Drafts only show while running the site locally. */
export async function getJournalPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** Page 1 is the home page; later pages are /blog/page/2, /blog/page/3, … */
export function journalPageUrl(page: number) {
  return page === 1 ? '/' : `/blog/page/${page}`;
}

/** "Sunday, Sep 27, 2026": the date line on a post. */
export const postDateFormat = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  // pubDate is midnight UTC; without this it shows the day before in US time zones.
  timeZone: 'UTC',
});

/** The card's summary: the post's description, or else the start of its first paragraph. */
export function postSummary(post: CollectionEntry<'blog'>) {
  if (post.data.description) return post.data.description;
  const paragraph = (post.body ?? '')
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !/^(#|!\[|<|>|[-*]\s|\d+\.\s|```)/.test(block));
  const text = (paragraph ?? '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ');
  return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, '')}…` : text;
}
