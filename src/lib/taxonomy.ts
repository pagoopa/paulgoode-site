import type { CollectionEntry } from 'astro:content';
import { domain, type Domain } from './labels';
import { getJournalPosts, POSTS_PER_PAGE } from './blog';

type Post = CollectionEntry<'blog'>;

/** The five categories, in the order of the content model. */
export const categories = domain.options;

export function categoryLabel(category: Domain) {
  return category[0].toUpperCase() + category.slice(1);
}

/** "1 post", "12 posts". */
export function postCount(n: number) {
  return `${n} ${n === 1 ? 'post' : 'posts'}`;
}

/** Page 1 is /category/art/; later pages are /category/art/page/2/, … */
export function categoryUrl(category: string, page = 1) {
  return page === 1 ? `/category/${category}/` : `/category/${category}/page/${page}/`;
}

export function tagUrl(tag: string, page = 1) {
  return page === 1 ? `/tag/${tag}/` : `/tag/${tag}/page/${page}/`;
}

export async function postsInCategory(category: Domain) {
  return (await getJournalPosts()).filter((post) => post.data.category === category);
}

export async function postsWithTag(tag: string) {
  return (await getJournalPosts()).filter((post) => post.data.tags.includes(tag));
}

/** Every category with its post count, most posts first, then A to Z. */
export async function getCategoryCounts() {
  const posts = await getJournalPosts();
  const counts = categories.map((c) => [c, posts.filter((p) => p.data.category === c).length] as const);
  return counts.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** Every tag that a published post uses, with its post count: most used first, then A to Z. */
export async function getTagCounts() {
  const counts = new Map<string, number>();
  for (const post of await getJournalPosts()) {
    for (const t of post.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** The pages of a filtered list of posts, for getStaticPaths: [1, 2, …]. */
export function pageNumbers(posts: Post[]) {
  const count = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  return Array.from({ length: count }, (_, i) => i + 1);
}
