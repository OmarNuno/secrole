# SecRole mark

The production mark follows the approved **A: Interlocking R** direction: two
geometric pieces, an open diagonal seam, and a single electric blue (`#2B8CFF`).
It has a transparent background, with no emoji, tile, glow, gradient, or embedded
bitmap.

- `public/secrole-mark.svg` is the master vector, on a 64 × 64 viewBox
- `public/favicon.svg` is an identical copy for browser tabs
- The header displays the mark at 32 × 32 beside the existing live-text SecRole
  wordmark and subtitle; its empty alt text avoids repeating the link's name
- Keep the paths, viewBox, and fill synchronized in both SVGs; `npm test` checks
  this along with the header dimensions and favicon reference

The existing header layout, theme colors, navigation, and data-derived counts
are unchanged. The same blue mark works against the light and dark backgrounds.
The site currently uses an SVG favicon and has no web app manifest or separate
app-icon set.

For raster exports, render the SVG at the target size with a vector renderer
rather than scaling up a PNG. For example, with Inkscape installed:

```sh
inkscape public/secrole-mark.svg --export-type=png --export-width=256 --export-filename=secrole-mark-256.png
```
