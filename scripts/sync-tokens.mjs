// Copies the design variables from design/shop.pen into src/styles/tokens.css,
// so the site's colors, fonts and sizes always match the design file.
// Also builds the Google Fonts link from the font variables.
// Runs automatically before `npm run dev` and `npm run build`.
//
// The variables mirror the Figma "PG Library" file and use two theme axes:
// - device (desktop / tablet / mobile): desktop values go in :root, the others
//   in the media queries below.
// - mode (light / dark): light is the default; dark applies under
//   [data-theme="dark"] on any element.
import { readFileSync, writeFileSync } from 'node:fs';

const PEN = new URL('../design/shop.pen', import.meta.url);
const OUT = new URL('../src/styles/tokens.css', import.meta.url);

// Viewport widths where the tablet and mobile values take over.
const BREAKPOINTS = {
  tablet: '(max-width: 1023px)',
  mobile: '(max-width: 599px)',
};

// Fallback stacks appended to each font family while the web font loads.
const FONT_FALLBACKS = {
  Inter: '-apple-system, BlinkMacSystemFont, sans-serif',
  Unbounded: 'Arial Black, sans-serif',
};

// Weights the site uses (400, 500, 600), plus 700 so fonts without a 600
// fall back to a real bold instead of a faked one.
// Families listed in FONT_AXES get extra axes instead.
const WEIGHTS = '400;500;600;700';
const FONT_AXES = {
  // Fraunces adjusts its letterforms by size (optical size, "opsz").
  Fraunces: 'opsz,wght@9..144,400;9..144,500;9..144,600',
};

const { variables = {} } = JSON.parse(readFileSync(PEN, 'utf8'));

function cssName(name, type) {
  return type === 'color' ? `--color-${name}` : `--${name}`;
}

// Themed variables store a list of { value, theme }. Pick the entry that
// matches every axis it names; axes it doesn't name don't matter.
function valueFor(value, theme) {
  if (!Array.isArray(value)) return value;
  const fits = (t = {}) => Object.entries(t).every(([axis, v]) => theme[axis] === v);
  return (value.find((v) => fits(v.theme)) ?? value[0]).value;
}

function cssValue(name, type, v) {
  if (typeof v === 'string' && v.startsWith('$')) {
    const ref = v.slice(1);
    return `var(${cssName(ref, variables[ref]?.type)})`;
  }
  if (type === 'color') return v.toLowerCase();
  // Type style line heights are ratios of the font size, columns are a count and
  // weights have no unit. The font-line-height-* primitives stay in px.
  if (type === 'number') return /^type-.*-line-height$|columns|^font-weight-/.test(name) ? `${v}` : `${v}px`;
  return `'${v}', ${FONT_FALLBACKS[v] ?? 'sans-serif'}`;
}

const BASE = { mode: 'light', device: 'desktop' };
const VARIANTS = {
  tablet: { ...BASE, device: 'tablet' },
  mobile: { ...BASE, device: 'mobile' },
  dark: { ...BASE, mode: 'dark' },
};

const groups = { color: [], font: [], other: [] };
const overrides = { tablet: [], mobile: [], dark: [] };
const families = new Set();
for (const [name, { type, value }] of Object.entries(variables)) {
  // CSS has no use for booleans (e.g. "show nav"); the layout handles those.
  if (type === 'boolean') continue;
  const base = cssValue(name, type, valueFor(value, BASE));
  const line = (v) => `  ${cssName(name, type)}: ${v};`;
  if (type === 'color') groups.color.push(line(base));
  else if (type === 'string') groups.font.push(line(base));
  else groups.other.push(line(base));
  if (type === 'string' && !String(value).startsWith('$')) families.add(value);
  const vals = Object.fromEntries(
    Object.entries(VARIANTS).map(([variant, theme]) => [variant, cssValue(name, type, valueFor(value, theme))]),
  );
  // Mobile widths also match the tablet query, so mobile only needs what differs from tablet.
  if (vals.tablet !== base) overrides.tablet.push(line(vals.tablet));
  if (vals.mobile !== vals.tablet) overrides.mobile.push(line(vals.mobile));
  if (vals.dark !== base) overrides.dark.push(line(vals.dark));
}

const fontsUrl =
  'https://fonts.googleapis.com/css2?' +
  [...families]
    .map((f) => `family=${f.replace(/ /g, '+')}:${FONT_AXES[f] ?? `wght@${WEIGHTS}`}`)
    .join('&') +
  '&display=swap';

const block = (selector, lines, indent = '') =>
  `${indent}${selector} {\n${lines.map((l) => indent + l).join('\n')}\n${indent}}`;

const css = `/* Generated from design/shop.pen by scripts/sync-tokens.mjs. Do not edit by hand:
   change the variables in pen.dev, save, and run \`npm run tokens\` (or dev/build). */

@import url('${fontsUrl}');

:root {
${[groups.color, groups.font, groups.other].filter((g) => g.length).map((g) => g.join('\n')).join('\n\n')}
}

@media ${BREAKPOINTS.tablet} {
${block(':root', overrides.tablet, '  ')}
}

@media ${BREAKPOINTS.mobile} {
${block(':root', overrides.mobile, '  ')}
}

${block('[data-theme="dark"]', overrides.dark)}
`;

writeFileSync(OUT, css);
console.log(`tokens: wrote ${Object.keys(variables).length} variables to src/styles/tokens.css`);

// Check the fonts exist on Google Fonts and report missing weights.
// Offline is fine: the check is skipped.
try {
  const res = await fetch(fontsUrl, {
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': 'Mozilla/5.0 Chrome/130' }, // ask for woff2 with real weights
  });
  if (!res.ok) {
    console.warn(
      `tokens: warning: Google Fonts couldn't load ${[...families].join(' / ')} (HTTP ${res.status}). ` +
        'Check the font names in pen.dev match Google Fonts exactly.',
    );
  } else {
    const body = await res.text();
    for (const family of families) {
      if (FONT_AXES[family]) continue;
      const blocks = body.split('@font-face').filter((b) => b.includes(`'${family}'`));
      const have = new Set(blocks.map((b) => b.match(/font-weight: (\d+)/)?.[1]));
      const missing = ['400', '500', '600'].filter((w) => !have.has(w));
      if (missing.length) {
        console.warn(`tokens: note: ${family} has no weight ${missing.join(', ')}; the browser uses the nearest weight instead.`);
      }
    }
  }
} catch {
  // No network: skip the check.
}
