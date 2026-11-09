// The newsletter lives on Substack; /newsletter on this site links to it. Once this site
// launches at paulgoode.com, Substack moves to its own address.
export const substackUrl = 'https://paulgoode.substack.com';

type NavItem = { href: string; label: string; also?: string[]; hidden?: boolean };

// The site's main links, shared by the header and footer. `hidden: true` leaves a link out for
// now; take it off when the page is ready.
const allNavItems: NavItem[] = [
  { href: '/', label: 'Blog' },
  // Series pages are projects too, so Projects stays current on them.
  { href: '/projects', label: 'Projects', also: ['/series'], hidden: true },
  { href: '/newsletter', label: 'Newsletter' },
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About' },
];

export const navItems = allNavItems.filter((item) => !item.hidden);
