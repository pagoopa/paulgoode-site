import { getCollection, type CollectionEntry } from 'astro:content';

export type Product = CollectionEntry<'products'>;

export async function getProducts(): Promise<Product[]> {
  const products = await getCollection('products');
  return products.sort((a, b) => a.data.order - b.data.order);
}

const priceFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function formatPrice(price: number): string {
  return priceFmt.format(price);
}

/** "Acrylic on paper" -> "acrylic" — used as a filter key. */
export function mediumKey(medium: string): string {
  return medium.split(' ')[0].toLowerCase();
}

export function productUrl(product: Product): string {
  return `/shop/${product.id}/`;
}
