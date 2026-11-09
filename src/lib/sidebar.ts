import { sidebarSection, type SidebarSection } from './labels';

/** All the sidebar sections, in order. */
export const allSidebarSections = sidebarSection.options;

/**
 * Sections hidden on every page for now. Take a name out of this list to bring that section back
 * (it can still be hidden on single pages with `sidebarHide` in a page's top block).
 */
const hiddenEverywhere: SidebarSection[] = ['about'];

/**
 * The sections to show on a page. A section that links to the page you're on is left out
 * automatically (About on /about, Newsletter on /newsletter), and a page can hide more.
 */
export function getSidebarSections(pathname: string, hide: SidebarSection[] = []): SidebarSection[] {
  const hidden = new Set<SidebarSection>([...hiddenEverywhere, ...hide]);
  if (pathname.startsWith('/about')) hidden.add('about');
  if (pathname.startsWith('/newsletter')) hidden.add('newsletter');
  return allSidebarSections.filter((section) => !hidden.has(section));
}
