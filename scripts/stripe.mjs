// Connects the shop to Stripe. Needs STRIPE_SECRET_KEY in .env (never committed).
//
//   npm run stripe-links   Creates a Stripe product, price and Payment Link for
//                          every unsold piece without a link, and writes the
//                          link into its Markdown file. With a live key it also
//                          replaces test-mode links.
//   npm run stripe-sold    Marks pieces `sold: true` once their link has a
//                          completed, paid checkout.
//
// Add --dry-run to either command to see what would change without changing it.
//
// Each link sells once (it switches off after one purchase), ships free within
// the US and has Stripe Tax add sales tax on top of the price.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const PRODUCTS = new URL('../src/content/products/', import.meta.url);
const API = 'https://api.stripe.com/v1';

// Stripe Tax codes: general tangible goods, and shipping.
const TAX_CODE_ARTWORK = 'txcd_99999999';
const TAX_CODE_SHIPPING = 'txcd_92010001';
const SHIP_TO = ['US'];

const [command] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');
const key = process.env.STRIPE_SECRET_KEY ?? '';
const live = /^(sk|rk)_live_/.test(key);

if (!['links', 'sold'].includes(command)) {
  console.error('Usage: node scripts/stripe.mjs links|sold [--dry-run]');
  process.exit(1);
}
if (!/^(sk|rk)_(test|live)_/.test(key) && !(dryRun && command === 'links')) {
  console.error('Add STRIPE_SECRET_KEY=sk_test_... (or rk_test_...) to .env first.');
  process.exit(1);
}
console.log(`Stripe ${live ? 'LIVE' : 'test'} mode${dryRun ? ' (dry run, nothing changes)' : ''}.\n`);

// ---- Stripe API ----------------------------------------------------------

/** Flattens {a: {b: [1]}} into Stripe's form fields: a[b][0]=1. */
function form(params, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(params)) {
    const name = prefix ? `${prefix}[${k}]` : k;
    if (v === undefined) continue;
    if (v !== null && typeof v === 'object') form(v, name, out);
    else out.append(name, String(v));
  }
  return out;
}

async function stripe(method, path, params, idempotencyKey) {
  const query = method === 'GET' && params ? `?${form(params)}` : '';
  const res = await fetch(`${API}${path}${query}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(idempotencyKey && { 'Idempotency-Key': idempotencyKey }),
    },
    body: method === 'POST' ? form(params) : undefined,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Stripe ${method} ${path}: ${body.error?.message ?? res.status}`);
  return body;
}

async function listAll(path, params = {}) {
  const items = [];
  let starting_after;
  for (;;) {
    const page = await stripe('GET', path, { ...params, limit: 100, starting_after });
    items.push(...page.data);
    if (!page.has_more) return items;
    starting_after = page.data.at(-1).id;
  }
}

// ---- Product files -------------------------------------------------------

function field(text, name) {
  const raw = text.match(new RegExp(`^${name}:[ \\t]*(.*)$`, 'm'))?.[1].trim();
  return raw?.startsWith('"') ? JSON.parse(raw) : raw;
}

function readProducts() {
  return readdirSync(PRODUCTS)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const url = new URL(file, PRODUCTS);
      const text = readFileSync(url, 'utf8');
      return {
        url,
        text,
        slug: file.replace(/\.md$/, ''),
        name: field(text, 'name'),
        price: Number(field(text, 'price')),
        size: field(text, 'size'),
        medium: field(text, 'medium'),
        paymentLink: field(text, 'paymentLink'),
        sold: field(text, 'sold') === 'true',
      };
    });
}

function setPaymentLink(product, link) {
  let text = product.text;
  if (/^paymentLink:/m.test(text)) {
    text = text.replace(/^paymentLink:.*$/m, `paymentLink: ${link}`);
  } else {
    text = text
      .replace(/^# Paste the Stripe Payment Link.*\n/m, '')
      .replace(/^# paymentLink:.*$/m, `paymentLink: ${link}`);
    if (!/^paymentLink:/m.test(text)) text = text.replace(/^sold:/m, `paymentLink: ${link}\nsold:`);
  }
  writeFileSync(product.url, text);
}

function setSold(product) {
  writeFileSync(product.url, product.text.replace(/^sold:.*$/m, 'sold: true'));
}

// ---- Commands ------------------------------------------------------------

async function freeShippingRate() {
  const rates = await listAll('/shipping_rates', { active: true });
  const existing = rates.find((r) => r.metadata?.paulgoode_site === 'free');
  if (existing) return existing.id;
  const rate = await stripe('POST', '/shipping_rates', {
    type: 'fixed_amount',
    display_name: 'Free shipping',
    fixed_amount: { amount: 0, currency: 'usd' },
    tax_behavior: 'exclusive',
    tax_code: TAX_CODE_SHIPPING,
    metadata: { paulgoode_site: 'free' },
  });
  return rate.id;
}

async function links() {
  // A test-mode link (buy.stripe.com/test_...) doesn't work for real buyers,
  // so a live run replaces it.
  const needsLink = (p) => !p.sold && (!p.paymentLink || (live && p.paymentLink.includes('/test_')));
  const todo = readProducts().filter(needsLink);
  if (todo.length === 0) return console.log('Every unsold piece already has a link.');
  if (dryRun) {
    for (const p of todo) console.log(`Would create a link for ${p.name} ($${p.price}).`);
    return;
  }

  const shippingRate = await freeShippingRate();
  for (const p of todo) {
    // Idempotency keys make a re-run after a failure reuse what was already
    // created (for 24 hours) instead of making duplicates.
    const idem = `paulgoode-${p.slug}-${p.price}`;
    const product = await stripe(
      'POST',
      '/products',
      {
        name: p.name,
        description: [p.medium, p.size].filter(Boolean).join(', '),
        tax_code: TAX_CODE_ARTWORK,
        metadata: { slug: p.slug },
      },
      `${idem}-product`,
    );
    const price = await stripe(
      'POST',
      '/prices',
      { product: product.id, unit_amount: p.price * 100, currency: 'usd', tax_behavior: 'exclusive' },
      `${idem}-price`,
    );
    const link = await stripe(
      'POST',
      '/payment_links',
      {
        line_items: [{ price: price.id, quantity: 1 }],
        automatic_tax: { enabled: true },
        shipping_address_collection: { allowed_countries: SHIP_TO },
        shipping_options: [{ shipping_rate: shippingRate }],
        restrictions: { completed_sessions: { limit: 1 } },
        inactive_message: `${p.name} has sold. Thank you for looking!`,
        after_completion: {
          type: 'hosted_confirmation',
          hosted_confirmation: {
            custom_message: `Thank you! ${p.name} will ship from the studio soon.`,
          },
        },
        metadata: { slug: p.slug },
      },
      `${idem}-link`,
    );
    setPaymentLink(p, link.url);
    console.log(`${p.name}: ${link.url}`);
  }
}

async function sold() {
  const products = readProducts().filter((p) => !p.sold && p.paymentLink);
  if (products.length === 0) return console.log('No unsold pieces with links to check.');
  const byUrl = new Map((await listAll('/payment_links')).map((l) => [l.url, l]));

  let changed = 0;
  for (const p of products) {
    const link = byUrl.get(p.paymentLink);
    if (!link) {
      console.log(`${p.name}: link not found in this Stripe mode, skipped.`);
      continue;
    }
    const sessions = await listAll('/checkout/sessions', { payment_link: link.id, status: 'complete' });
    if (!sessions.some((s) => s.payment_status === 'paid')) continue;
    changed++;
    if (dryRun) console.log(`Would mark ${p.name} sold.`);
    else {
      setSold(p);
      console.log(`${p.name}: marked sold.`);
    }
  }
  if (changed === 0) console.log('No new sales.');
}

await (command === 'links' ? links() : sold());
