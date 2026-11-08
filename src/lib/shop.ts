// The public Big Cartel catalog. Checkout stays on the shop. This feed is read
// at build time, so a sale shows up here on the next build. The shop itself
// refuses a second buyer immediately.
const FEED_URL = 'https://api.bigcartel.com/hello-7905/products.json';

export const shopOrigin = 'https://shop.paulgoode.com';

type FeedCategory = { name: string; permalink: string };
type FeedImage = { secure_url?: string; url: string; width: number; height: number };
type FeedOption = { sold_out: boolean };
type FeedProduct = {
  name: string;
  permalink: string;
  position: number;
  price: number;
  description: string;
  status: string;
  options: FeedOption[];
  images: FeedImage[];
  categories: FeedCategory[];
};

export type ShopProduct = {
  name: string;
  summary: string;
  eyebrow: string;
  href: string;
  image?: { src: string; width: number; height: number };
  soldOut: boolean;
  categories: { name: string; permalink: string }[];
  // A print-on-demand piece. Big Cartel does not say "unlimited" in the feed.
  // Set the product to No limit, and put it in a category whose name or
  // permalink contains "print". sold_out then stays false, and this page
  // files it under Prints instead of with the originals.
  print: boolean;
};

const visible = new Set(['active', 'sold_out', 'coming_soon']);

function plain(html: string) {
  // The size and medium are the first line. A later line is the series badge,
  // which the card already shows as its eyebrow.
  const firstLine = html.split(/<br\s*\/?>/i)[0] ?? html;
  return firstLine
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function money(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

function isPrint(categories: FeedCategory[]) {
  return categories.some((category) => /print/i.test(category.permalink) || /print/i.test(category.name));
}

function isSoldOut(product: FeedProduct) {
  if (product.status === 'sold_out') return true;
  return product.options.length > 0 && product.options.every((option) => option.sold_out);
}

function eyebrow(product: FeedProduct, print: boolean, soldOut: boolean) {
  if (product.status === 'coming_soon') return 'Coming soon';
  if (soldOut) return 'Sold out';
  if (print) return 'Print';
  if (product.categories.some((category) => category.permalink === 'signature-work')) return 'Signature work';
  return 'Original';
}

function normalize(product: FeedProduct): ShopProduct {
  const print = isPrint(product.categories);
  const soldOut = isSoldOut(product);
  const image = product.images[0];
  const description = plain(product.description ?? '');
  return {
    name: product.name,
    summary: description ? `${money(product.price)} · ${description}` : money(product.price),
    eyebrow: eyebrow(product, print, soldOut),
    href: `${shopOrigin}/product/${product.permalink}`,
    image: image
      ? { src: image.secure_url || image.url, width: image.width, height: image.height }
      : undefined,
    soldOut,
    categories: product.categories.map((category) => ({
      name: category.name,
      permalink: category.permalink,
    })),
    print,
  };
}

/** Filter chips, in the order categories first appear on the products. */
export function shopFilters(products: ShopProduct[]) {
  const seen = new Map<string, string>();
  for (const product of products) {
    for (const category of product.categories) {
      if (!seen.has(category.permalink)) seen.set(category.permalink, category.name);
    }
  }
  return [...seen].map(([value, label]) => ({ value, label }));
}

/** Active, sold-out, and coming-soon products, in the shop's own order. */
export async function getShopProducts(): Promise<ShopProduct[]> {
  const response = await fetch(FEED_URL);
  if (!response.ok) throw new Error(`Big Cartel product feed responded ${response.status}`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Big Cartel product feed was not a list');
  return (data as FeedProduct[])
    .filter((product) => visible.has(product.status))
    .sort((a, b) => a.position - b.position)
    .map(normalize);
}
