// The journal as an RSS feed: /rss.xml, newest posts first.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getJournalPosts } from '../lib/blog';

export async function GET(context: APIContext) {
  const posts = await getJournalPosts();
  return rss({
    title: 'Paul Goode — Journal',
    description: 'Drawing is thinking. Posts about art, design, spirit, life and the studio.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description ?? '',
      link: `/blog/${post.id}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
  });
}
