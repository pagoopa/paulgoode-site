/**
 * The title in the browser tab, in search results and in link previews: "<page> - Paul Goode".
 * Each page passes just its own name to the layout, and this adds the site's name:
 *   Home       the newest post's title (the lead post)
 *   A post     the post's title
 *   A page     the page's name (About, Projects, Newsletter, Contact)
 *   A project  the project's name
 * A page with no name of its own is titled just "Paul Goode".
 */
export const siteName = 'Paul Goode';

export function pageTitle(title?: string) {
  return title && title !== siteName ? `${title} - ${siteName}` : siteName;
}
