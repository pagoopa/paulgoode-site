// The site's main links, shared by the header and footer.
export const navItems: { href: string; label: string; also?: string[] }[] = [
  { href: '/', label: 'Blog' },
  // Series pages are projects too, so Projects stays current on them.
  { href: '/projects', label: 'Projects', also: ['/series'] },
  { href: 'https://paulgoode.substack.com', label: 'Newsletter' },
  { href: 'https://shop.paulgoode.com', label: 'Shop' },
  { href: '/about', label: 'About' },
];
