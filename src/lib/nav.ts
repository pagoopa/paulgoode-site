// The newsletter lives on Substack; /newsletter on this site links to it. Once this site
// launches at paulgoode.com, Substack moves to its own address.
export const substackUrl = 'https://paulgoode.substack.com';

// The site's main links, shared by the header and footer.
export const navItems: { href: string; label: string; also?: string[] }[] = [
  { href: '/', label: 'Blog' },
  // Series pages are projects too, so Projects stays current on them.
  { href: '/projects', label: 'Projects', also: ['/series'] },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
];
