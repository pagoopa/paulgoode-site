// Adds a new piece to the shop. Asks a few questions, copies the photos into
// src/assets/products/<slug>/ and writes src/content/products/<slug>.md.
// Run with `npm run new-product`. Tip: drag photos from Finder into the
// terminal to paste their paths.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const PRODUCTS = new URL('../src/content/products/', import.meta.url);
const ASSETS = new URL('../src/assets/products/', import.meta.url);
const IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.webp'];

const rl = createInterface({ input: stdin, output: stdout });

async function ask(question, { fallback, check } = {}) {
  for (;;) {
    const hint = fallback !== undefined && fallback !== '' ? ` (${fallback})` : '';
    const answer = (await rl.question(`${question}${hint}: `)).trim() || fallback || '';
    const problem = check?.(answer);
    if (!problem) return answer;
    console.log(`  ${problem}`);
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Splits pasted paths. Handles 'quotes' and backslash-escaped spaces from Finder drags. */
function splitPaths(text) {
  const paths = [];
  const re = /'([^']*)'|"([^"]*)"|((?:\\.|\S)+)/g;
  for (const m of text.matchAll(re)) {
    paths.push(m[1] ?? m[2] ?? m[3].replace(/\\(.)/g, '$1'));
  }
  return paths;
}

/** Quotes a YAML value only when it needs it. */
function yaml(value) {
  return /^[\w\s,.'’″×()&/-]+$/.test(value) && !/^\s|\s$/.test(value)
    ? value
    : JSON.stringify(value);
}

function nextOrder() {
  let max = 0;
  for (const file of readdirSync(PRODUCTS)) {
    const match = readFileSync(new URL(file, PRODUCTS), 'utf8').match(/^order:\s*(\d+)/m);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max + 1;
}

console.log('New shop piece. Press Enter to accept the value in brackets.\n');

const name = await ask('Name', { check: (v) => (v ? '' : 'A name is required.') });
const slug = await ask('URL slug', {
  fallback: slugify(name),
  check: (v) =>
    !/^[a-z0-9-]+$/.test(v)
      ? 'Use lowercase letters, numbers and dashes.'
      : existsSync(new URL(`${v}.md`, PRODUCTS))
        ? `src/content/products/${v}.md already exists.`
        : '',
});
const price = await ask('Price in dollars', {
  check: (v) => (/^\d+$/.test(v) ? '' : 'Whole dollars only, e.g. 200.'),
});
const size = await ask('Size', { fallback: '22″ × 30″' });
const medium = await ask('Medium', { fallback: 'Acrylic on paper' });
const signature = /^y/i.test(await ask('Signature piece? y/n', { fallback: 'n' }));
const tags = (await ask('Tags, comma separated (e.g. pattern, landscape)', { fallback: '' }))
  .split(',')
  .map((t) => t.trim().toLowerCase())
  .filter(Boolean);
const order = await ask('Position in the shop', {
  fallback: String(nextOrder()),
  check: (v) => (/^\d+$/.test(v) ? '' : 'Use a number.'),
});

let photos = [];
while (photos.length === 0) {
  photos = splitPaths(await ask('Photos (drag them in; the first is the main image)'));
  const bad = photos.filter((p) => !existsSync(p) || !IMAGE_TYPES.includes(extname(p).toLowerCase()));
  if (bad.length) {
    console.log(`  Can't use: ${bad.join(', ')}. Use .jpg, .png or .webp files.`);
    photos = [];
  }
}

const images = [];
for (const [i, photo] of photos.entries()) {
  const fallback =
    i === 0 ? `${name}, ${medium.toLowerCase()} by Paul Goode` : `${name} hanging on the studio wall`;
  const alt = await ask(`Description of photo ${i + 1} for screen readers`, { fallback });
  const ext = extname(photo).toLowerCase().replace('.jpeg', '.jpg');
  images.push({ photo, file: `${i + 1}${ext}`, alt });
}
const paymentLink = await ask('Stripe Payment Link (leave blank to add later)', {
  fallback: '',
  check: (v) => (!v || /^https:\/\/\S+$/.test(v) ? '' : 'Paste the full https:// link.'),
});
rl.close();

const dir = new URL(`${slug}/`, ASSETS);
mkdirSync(dir, { recursive: true });
for (const image of images) copyFileSync(image.photo, new URL(image.file, dir));

const lines = [
  '---',
  `name: ${yaml(name)}`,
  `price: ${Number(price)}`,
  `size: ${yaml(size)}`,
  `medium: ${yaml(medium)}`,
  `signature: ${signature}`,
  ...(tags.length ? [`tags: [${tags.map(yaml).join(', ')}]`] : []),
  `order: ${Number(order)}`,
  'images:',
  ...images.flatMap((image) => [
    `  - src: ../../assets/products/${slug}/${image.file}`,
    `    alt: ${yaml(image.alt)}`,
  ]),
  ...(paymentLink
    ? [`paymentLink: ${paymentLink}`]
    : ['# Paste the Stripe Payment Link here to turn on the Buy button.', '# paymentLink: https://buy.stripe.com/...']),
  'sold: false',
  '---',
  '',
];
writeFileSync(new URL(`${slug}.md`, PRODUCTS), lines.join('\n'));

console.log(`\nAdded src/content/products/${slug}.md with ${images.length} photo(s).`);
console.log(`Run \`npm run dev\` and open /shop/${slug}/ to check it.`);
