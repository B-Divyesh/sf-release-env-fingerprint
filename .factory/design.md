# Visual thesis: the release proof sheet

Release Env Fingerprint uses a **dithered/halftone print system** inspired by a
release engineer's proof sheet: one imperfect field is compared against a
known plate, registration marks reveal misalignment, and a bright proof stamp
signals trust. The texture explains the product's job—finding small differences
without exposing the underlying ink—rather than decorating a generic devtool.

## Palette

The site is intentionally single-mode, like warm uncoated stock under a bench
lamp. Painting every surface explicitly prevents accidental system-dark-mode
contrast regressions.

| Token | Value | Use |
| --- | --- | --- |
| paper | `#F3EBD8` | page background |
| paper-high | `#FFF9EA` | inset examples |
| ink | `#191A18` | primary text and outlines |
| ink-muted | `#55584F` | secondary copy |
| press-blue | `#145A68` | links, focus, matched state |
| signal-red | `#B22E2E` | drift and proof marks |
| ochre | `#B66A19` | warning and halftone detail |
| moss | `#386641` | success |

Ink on paper is 14.4:1; muted ink on paper is 6.4:1; paper-high on press-blue
is above 7:1. Status always includes text and shape, never color alone.

## Typography and spacing

- Display: `Arial Black`, `Franklin Gothic Heavy`, sans-serif. Tight, uppercase
  labels evoke specimen cards and stay system-local with no font transfer.
- Body/code: `IBM Plex Mono`-like system stack (`ui-monospace`, SFMono-Regular,
  Consolas). The mono rhythm suits environment keys and keeps tabular data
  aligned. No external font requests.
- Scale: 14 / 16 / 20 / 28 / clamp(44–78) px with 1.5 body leading.
- Spacing: 4 px base; primary steps 8, 12, 16, 24, 32, 48, 72, 96 px.
  Content caps at 1180 px and prose at 68 characters.

## Composition and interaction grammar

The hero is a two-column proof table: claim and command on the left, an original
environment comparison press plate on the right. Thick 2 px rules, clipped
corners, numbered section marks, and offset red/blue dots create physical
registration depth. Cards appear only for independent workflow stages. Buttons
compress by 1 px on press; copy actions swap labels in place; demo toggles feel
like selecting rows on an inspection sheet. Focus is a 3 px press-blue ring
with a paper gap. At 390 px, navigation labels reduce, columns stack, and dense
comparison rows become name-first blocks without horizontal page scrolling.

## Motion policy

On entry, the hero image settles upward 10 px over 240 ms and result rows appear
over 180 ms after a demo comparison. Only opacity and transform animate. There
is no looping animation or flashing. Under `prefers-reduced-motion: reduce`,
all transitions and transforms are removed and state changes are immediate.

## Asset plan and provenance

- `site/public/proof-sheet.webp`: one original raster hero, generated for this
  product with `/opt/fleet/lib/gen-image.sh` (factory-image deployment), then
  locally converted to WebP. Prompt: “Editorial risograph screen-print
  illustration for a developer CLI landing page; two overlapping environment
  fingerprint sheets with rows of abstract blocks and check marks, one red
  registration offset revealing a missing row, magnifying loupe, crop marks,
  coarse halftone dots and ink misregistration; flat limited palette warm cream,
  near-black, deep teal, vermilion red, ochre; landscape composition; no
  readable words, no logos, no gradients, no photorealism, no watermark.”
- Registration targets, dotted fields, arrows, and the small fingerprint mark
  are hand-made CSS/SVG primitives authored in this repository.
- Generated asset license: project-owned output created via the factory image
  deployment on 2026-08-28. No third-party stock or icon assets are used.

## Accessibility and performance treatment

The raster has explicit dimensions, meaningful alt text, and responsive sizes;
it is the only above-fold image and is capped below 300 KB. Halftone texture is
decorative and never carries information. Controls are at least 44 px, status
labels include symbols plus words, and the document preserves one `h1`, ordered
headings, landmarks, a skip link, and visible focus.

## Polish round 1

The visual thesis remains unchanged. On phones, the proof-sheet image yields
to the job statement, sample action, and three facts so the first screen stays
decisive. The sample uses a sticky ochre proof label as its persistent demo
boundary. Real legal and error routes reuse the paper, press rules,
registration-shadow layers, and display/mono pairing. No new image asset or
third-party material was introduced.
