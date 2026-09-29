// Copies the design variables from design/shop.pen into src/styles/tokens.css,
// so the site's colors, fonts and sizes always match the design file.
// Also builds the Google Fonts link from the font variables.
// Runs automatically before `npm run dev` and `npm run build`.
import { readFileSync, writeFileSync } from 'node:fs';

const PEN = new URL('../design/shop.pen', import.meta.url);
const OUT = new URL('../src/styles/tokens.css', import.meta.url);

// Fallback stacks appended to font variables while the web font loads.
const FONT_FALLBACKS = {
  'font-display': 'Georgia, serif',
  'font-body': '-apple-system, BlinkMacSystemFont, sans-serif',
};

// Weights the site uses. Families listed in FONT_AXES get extra axes instead.
const WEIGHTS = '400;500;600';
const FONT_AXES = {
  // Fraunces adjusts its letterforms by size (optical size, "opsz").
  Fraunces: 'opsz,wght@9..144,400;9..144,500;9..144,600',
};

const { variables = {} } = JSON.parse(readFileSync(PEN, 'utf8'));

function cssName(name, type) {
  return type === 'color' ? `--color-${name}` : `--${name}`;
}

// Themed variables store a list of values; use the one without a theme.
function baseValue(value) {
  if (!Array.isArray(value)) return value;
  return (value.find((v) => !v.theme) ?? value[0]).value;
}

function cssValue(name, { type, value }) {
  const v = baseValue(value);
  if (typeof v === 'string' && v.startsWith('$')) {
    const ref = v.slice(1);
    return `var(${cssName(ref, variables[ref]?.type)})`;
  }
  if (type === 'color') return v.toLowerCase();
  if (type === 'number') return `${v}px`;
  if (name.startsWith('font-')) {
    return `'${v}', ${FONT_FALLBACKS[name] ?? 'sans-serif'}`;
  }
  return JSON.stringify(v);
}

const groups = { color: [], font: [], other: [] };
const families = new Set();
for (const [name, def] of Object.entries(variables)) {
  const line = `  ${cssName(name, def.type)}: ${cssValue(name, def)};`;
  if (def.type === 'color') groups.color.push(line);
  else if (name.startsWith('font-')) {
    groups.font.push(line);
    const family = baseValue(def.value);
    if (!String(family).startsWith('$')) families.add(family);
  } else groups.other.push(line);
}

const fontsUrl =
  'https://fonts.googleapis.com/css2?' +
  [...families]
    .map((f) => `family=${f.replace(/ /g, '+')}:${FONT_AXES[f] ?? `wght@${WEIGHTS}`}`)
    .join('&') +
  '&display=swap';

const css = `/* Generated from design/shop.pen by scripts/sync-tokens.mjs. Do not edit by hand:
   change the variables in pen.dev, save, and run \`npm run tokens\` (or dev/build). */

@import url('${fontsUrl}');

:root {
${[groups.color, groups.font, groups.other].filter((g) => g.length).map((g) => g.join('\n')).join('\n\n')}
}
`;

writeFileSync(OUT, css);
console.log(`tokens: wrote ${Object.keys(variables).length} variables to src/styles/tokens.css`);

// Check the fonts exist on Google Fonts. Offline is fine; only a real
// "not found" from Google is reported.
try {
  const res = await fetch(fontsUrl, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) {
    console.warn(
      `tokens: warning: Google Fonts couldn't load ${[...families].join(' / ')} (HTTP ${res.status}). ` +
        'Check the font names in pen.dev match Google Fonts exactly.',
    );
  }
} catch {
  // No network: skip the check.
}
