// Turns the Figma variables snapshot (design/figma-variables.json, made with
// scripts/figma-export.js) into pen.dev variables, and compares them with the
// variables in design/shop.pen.
//
//   npm run figma:pen            report what's added, changed or missing
//   npm run figma:pen -- --json  print the added and changed variables as JSON,
//                                ready for pen.dev's SetVariables()
//
// Pen names mirror the Figma paths in kebab-case, without the collection name:
// Primitives "Font/Size/12" -> font-size-12, Color "Text/On Accent" -> text-on-accent,
// Size "Type/Headings/Header 1/Size" -> type-h1-size, Font "Font Family/Body" -> font-body.
// Collections with modes become theme axes: Color -> mode, Size -> device.
import { readFileSync } from 'node:fs';

const SNAPSHOT = new URL('../design/figma-variables.json', import.meta.url);
const PEN = new URL('../design/shop.pen', import.meta.url);

const THEME_AXES = { Color: 'mode', Size: 'device' };

// The Ecommerce collection came in with a template and mostly repeats the
// Scale primitives. It gets merged into the main system by hand, not copied.
const SKIP = new Set(['Ecommerce']);

// Pen sets font weights as numbers, not Figma's style names.
const WEIGHTS = { Regular: 400, Medium: 500, 'Semi Bold': 600, Bold: 700 };

const { collections } = JSON.parse(readFileSync(SNAPSHOT, 'utf8'));
const { variables: pen = {} } = JSON.parse(readFileSync(PEN, 'utf8'));

function penName(collection, path) {
  let p = path;
  if (collection === 'Font') p = p.replace(/^Font Family\//, 'Font/');
  p = p.replace(/^Type\/(Headings|Body)\//, 'Type/').replace(/^Type\/Header (\d)/, 'Type/H$1');
  return p.replace(/[/ ]/g, '-').toLowerCase();
}

// Follows "@Collection/Path" references down to a raw value for one mode.
// A referenced single-mode collection always uses its only mode.
function resolve(value, mode) {
  while (typeof value === 'string' && value.startsWith('@')) {
    const [collection, ...rest] = value.slice(1).split('/');
    const c = collections[collection];
    const values = c.variables[rest.join('/')];
    value = values[c.modes.length > 1 ? mode : 0];
  }
  return value;
}

const round = (n) => Math.round(n * 10000) / 10000;

function penValue(name, path, collection, value, mode) {
  const c = collections[collection];
  if (name.startsWith('font-weight-')) return WEIGHTS[value];
  // Pen line heights are a multiple of the font size, so type styles store the ratio.
  if (/^type-.*-line-height$/.test(name)) {
    const size = c.variables[path.replace(/Line Height$/, 'Size')][mode];
    return round(resolve(value, mode) / resolve(size, mode));
  }
  // Type styles keep plain numbers, as they always have in shop.pen.
  if (name.startsWith('type-')) return round(resolve(value, mode));
  if (typeof value === 'string' && value.startsWith('@')) {
    const [ref, ...rest] = value.slice(1).split('/');
    return '$' + penName(ref, rest.join('/'));
  }
  if (typeof value === 'string' && value.startsWith('#')) return value.toLowerCase();
  return value;
}

function penType(name, value) {
  if (name.startsWith('font-weight-')) return 'number';
  const v = resolve(value, 0);
  if (typeof v === 'number') return 'number';
  if (typeof v === 'boolean') return 'boolean';
  return v.startsWith('#') ? 'color' : 'string';
}

const target = {};
for (const [collection, { modes, variables }] of Object.entries(collections)) {
  if (SKIP.has(collection)) continue;
  const axis = THEME_AXES[collection];
  for (const [path, values] of Object.entries(variables)) {
    const name = penName(collection, path);
    const type = penType(name, values[0]);
    const value = axis
      ? modes.map((m, i) => ({ value: penValue(name, path, collection, values[i], i), theme: { [axis]: m.toLowerCase() } }))
      : penValue(name, path, collection, values[0], 0);
    if (name in target) throw new Error(`Two Figma variables map to the Pen name "${name}"`);
    target[name] = { type, value };
  }
}

// A themed value that's the same in every mode equals a plain value.
const flat = ({ type, value }) =>
  Array.isArray(value) && value.every((v) => JSON.stringify(v.value) === JSON.stringify(value[0].value))
    ? { type, value: value[0].value }
    : { type, value };
const same = (a, b) => JSON.stringify(flat(a)) === JSON.stringify(flat(b));
const added = Object.keys(target).filter((n) => !(n in pen));
const changed = Object.keys(target).filter((n) => n in pen && !same(target[n], pen[n]));
const extra = Object.keys(pen).filter((n) => !(n in target));

if (process.argv.includes('--json')) {
  const out = Object.fromEntries([...added, ...changed].map((n) => [n, target[n]]));
  console.log(JSON.stringify(out));
} else {
  const list = (label, names, show) => {
    console.log(`${label}: ${names.length}`);
    for (const n of names) console.log(`  ${n}${show ? `  ${show(n)}` : ''}`);
  };
  console.log(`figma:pen: ${Object.keys(target).length} Figma variables, ${Object.keys(pen).length} in shop.pen`);
  list('Not in shop.pen yet', added);
  list('Different in shop.pen', changed, (n) => `pen ${JSON.stringify(pen[n].value)} -> figma ${JSON.stringify(target[n].value)}`);
  list('In shop.pen but not in Figma', extra);
  for (const c of SKIP) {
    console.log(`Skipped the ${c} collection (${Object.keys(collections[c].variables).length} variables): merge by hand.`);
  }
}
