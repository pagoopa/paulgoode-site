// Exports the PG Library's variables, text styles and effect styles from Figma.
// This isn't a Node script: Claude runs it inside Figma through the Figma MCP
// `use_figma` tool (file fhD5RfaBFvLbVNegqRAdDX), then saves the result as
// design/figma-variables.json. `npm run figma:pen` turns that file into
// shop.pen variables.
//
// The MCP tool truncates results over 20 KB, so set PART to 'variables' and
// then 'styles' and merge the two results into one file.
//
// Format:
// - collections: { [name]: { modes: [...], variables: { [path]: [value per mode] } } }
// - colors are hex; references to other variables are "@Collection/Path".
const PART = 'variables';

const cols = await figma.variables.getLocalVariableCollectionsAsync();
const all = await figma.variables.getLocalVariablesAsync();
const byId = Object.fromEntries(all.map((v) => [v.id, v]));
const colById = Object.fromEntries(cols.map((c) => [c.id, c]));
const ref = (id) => `${colById[byId[id].variableCollectionId].name}/${byId[id].name}`;
const hex = ({ r, g, b, a }) =>
  '#' +
  [r, g, b, ...(a !== undefined && a < 1 ? [a] : [])]
    .map((x) => Math.round(x * 255).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
const round = (n) => Math.round(n * 10000) / 10000;
const value = (v) => {
  if (v && v.type === 'VARIABLE_ALIAS') return '@' + ref(v.id);
  if (v && typeof v === 'object' && 'r' in v) return hex(v);
  return typeof v === 'number' ? round(v) : v;
};

if (PART === 'variables') {
  const collections = {};
  for (const c of cols) {
    const variables = {};
    for (const id of c.variableIds) {
      const v = byId[id];
      variables[v.name] = c.modes.map((m) => value(v.valuesByMode[m.modeId]));
    }
    collections[c.name] = { modes: c.modes.map((m) => m.name), variables };
  }
  return { collections };
}

const textStyles = {};
for (const s of await figma.getLocalTextStylesAsync()) {
  textStyles[s.name] = {
    font: `${s.fontName.family} ${s.fontName.style}`,
    size: s.fontSize,
    lineHeight: s.lineHeight.unit === 'AUTO' ? 'auto' : s.lineHeight.value,
    letterSpacing: round(s.letterSpacing.value),
    case: s.textCase,
  };
}
const effectStyles = {};
for (const s of await figma.getLocalEffectStylesAsync()) {
  effectStyles[s.name] = s.effects.map((e) => ({
    type: e.type, color: hex(e.color), x: e.offset.x, y: e.offset.y, blur: e.radius, spread: e.spread,
  }));
}
return { textStyles, effectStyles };
