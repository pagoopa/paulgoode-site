// Loading hints for images in Markdown (posts, series entries, pages).
// It runs before Astro turns each image into a responsive <img>, so the
// attributes set here reach that <img>.
//
// - The first image in a document loads right away, with high priority. It is
//   usually what the reader sees first, so lazy-loading it delays the page.
// - `sizes` tells the browser how wide the image is shown, so it picks a file
//   to match instead of one as wide as the screen. The widths follow the
//   post column (820 on desktop) and the gallery grid (3 across, 2 on
//   tablets, 1 on phones) in src/styles/global.css and prose.css.

const COLUMN = '(max-width: 1023px) 100vw, 820px';
const GALLERY = '(max-width: 599px) 100vw, (max-width: 1023px) 50vw, 265px';

// True when the image's paragraph sits between <div class="gallery"> and </div>.
// Markdown keeps that HTML as raw nodes beside the paragraphs, not around them.
function inGallery(node, ctx) {
  const paragraph = ctx.parent(node);
  const root = paragraph && ctx.parent(paragraph);
  if (!root?.children) return false;
  const before = root.children.slice(0, root.children.indexOf(paragraph));
  for (let i = before.length - 1; i >= 0; i--) {
    const value = before[i].type === 'raw' ? before[i].value : '';
    if (/<\/div>/.test(value)) return false;
    if (/<div[^>]*class="[^"]*\bgallery\b/.test(value)) return true;
  }
  return false;
}

export function postImages() {
  // One instance per document, so "first image" is counted per post.
  return () => {
    let seenFirst = false;
    return {
      name: 'post-images',
      element: {
        filter: ['img'],
        visit(node, ctx) {
          if (!node.properties?.sizes) {
            ctx.setProperty(node, 'sizes', inGallery(node, ctx) ? GALLERY : COLUMN);
          }
          if (!seenFirst) {
            seenFirst = true;
            ctx.setProperty(node, 'loading', 'eager');
            ctx.setProperty(node, 'fetchpriority', 'high');
          }
        },
      },
    };
  };
}
