// Copies the design variables from design/site.pen into src/styles/tokens.css,
// so the site's colors, fonts and sizes always match the design file.
// Also builds the Google Fonts link from the font variables.
// Runs automatically before `npm run dev` and `npm run build`.
//
// site.pen is the source of truth for the variables, which use two theme axes:
// - device (sm / md / lg / xl): lg values go in :root,
//   md and sm in the media queries below. xl isn't used yet: it only differs
//   from lg in layout-screen-width, which the site doesn't read.
// - mode (light / dark): light is the default; dark applies under
//   [data-theme="dark"] on any element.
import { readFileSync, writeFileSync } from 'node:fs';

const PEN = new URL('../design/site.pen', import.meta.url);
const OUT = new URL('../src/styles/tokens.css', import.meta.url);

// Viewport widths where the md (tablet) and sm (phone) values take over.
const BREAKPOINTS = {
  md: '(max-width: 1023px)',
  sm: '(max-width: 599px)',
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

const { variables = {}, themes = {} } = JSON.parse(readFileSync(PEN, 'utf8'));

// Stop if the device names change again, rather than quietly dropping the
// tablet and phone values.
const missingDevices = ['lg', 'md', 'sm'].filter((d) => !themes.device?.includes(d));
if (missingDevices.length) {
  throw new Error(
    `tokens: site.pen has no "${missingDevices.join('", "')}" device theme (found: ${themes.device?.join(', ') || 'none'}). ` +
      'Update BASE, VARIANTS and BREAKPOINTS in scripts/sync-tokens.mjs to match.',
  );
}

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

const BASE = { mode: 'light', device: 'lg' };
const VARIANTS = {
  md: { ...BASE, device: 'md' },
  sm: { ...BASE, device: 'sm' },
  dark: { ...BASE, mode: 'dark' },
};

const groups = { color: [], font: [], other: [] };
const overrides = { md: [], sm: [], dark: [] };
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
  // Phone widths also match the md query, so sm only needs what differs from md.
  if (vals.md !== base) overrides.md.push(line(vals.md));
  if (vals.sm !== vals.md) overrides.sm.push(line(vals.sm));
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

const css = `/* Generated from design/site.pen by scripts/sync-tokens.mjs. Do not edit by hand:
   change the variables in pen.dev, save, and run \`npm run tokens\` (or dev/build). */

@import url('${fontsUrl}');

:root {
${[groups.color, groups.font, groups.other].filter((g) => g.length).map((g) => g.join('\n')).join('\n\n')}
}

@media ${BREAKPOINTS.md} {
${block(':root', overrides.md, '  ')}
}

@media ${BREAKPOINTS.sm} {
${block(':root', overrides.sm, '  ')}
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
