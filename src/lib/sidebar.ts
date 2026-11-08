import { sidebarSection, type SidebarSection } from './labels';

/** All the sidebar sections, in order. */
export const allSidebarSections = sidebarSection.options;

/**
 * The sections to show on a page. A section that links to the page you're on is left out
 * automatically (About on /about, Newsletter on /newsletter), and a page can hide more.
 */
export function getSidebarSections(pathname: string, hide: SidebarSection[] = []): SidebarSection[] {
  const hidden = new Set<SidebarSection>(hide);
  if (pathname.startsWith('/about')) hidden.add('about');
  if (pathname.startsWith('/newsletter')) hidden.add('newsletter');
  return allSidebarSections.filter((section) => !hidden.has(section));
}
