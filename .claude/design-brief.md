# Local Praxis Design Brief

**Aesthetic:** Swiss-brutalist / Unimark-descended. References: Vignelli's Piccolo Teatro posters, Müller-Brockmann grids, NPS Unigrid, Klim's Söhne specimen pages, rsms.me, Linear docs. The visual system is the opposite of SaaS — it signals permanence and ownership, which is the product premise.

---

## Typography

Two typefaces. No third. No serifs.

| Role | Font | Weight | Size | Tracking | Line height | Case |
|---|---|---|---|---|---|---|
| Hero headline | Archivo Black | 900 | ~8rem (clamp to viewport) | `-0.045em` | 0.84 | UPPER |
| Section headline | Archivo Black | 900 | ~4rem | `-0.045em` | 0.9 | UPPER |
| Eyebrow / small-caps label | IBM Plex Mono | 500 | 0.9rem | `0.24em` | 1 | UPPER |
| Body | IBM Plex Mono | 400 | 1rem | 0 | 1.5 | sentence |
| Small print | IBM Plex Mono | 400 | 0.8rem | 0 | 1.5 | sentence, opacity 0.65 |
| Button label | IBM Plex Mono | 600 | 0.875rem | `0.14em` | 1 | UPPER |

Google Fonts import (single line, all four pages):

```html
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Removed from the stack (never re-introduce):** Instrument Serif, Satoshi, Roboto Mono, Helvetica Neue as a display face, Impact, IBM Plex Sans.

---

## Color

Four tokens. That's all.

| Token | Hex | Use |
|---|---|---|
| `--paper` | `#D8DBD0` | Page background; button fills on invert |
| `--ink` | `#0A0A0A` | All text, all linework, all borders |
| `--red` | `#C8342E` | CTAs, the single loudest mark on a section. Rationed |
| `--cyan` | `#4A90B8` | Active / in-progress state (e.g., active tab). Rationed |

**No** gradients. **No** drop shadows. **No** box-shadows. **No** blue chrome. **No** cream variations. Red and cyan are semantic and reserved — if you find yourself using either for decoration, pick ink or paper instead.

Dark mode flips `--paper` and `--ink` only. `--red` and `--cyan` stay constant.

---

## Geometry

- `border-radius: 0` everywhere, globally. No exceptions.
- Borders: `1.5px solid var(--ink)`.
- No `box-shadow`, no `filter: drop-shadow`.
- Images have hard edges. No rounded corners, no overlays, no vignettes.

---

## Buttons & CTAs

Rectangles. No fill gradients. No icons inside unless functionally required. Three variants, nothing else:

**Primary (red):** `var(--red)` fill, `var(--paper)` text, `1.5px solid var(--ink)` border. Hover: fill flips to `var(--paper)`, text to `var(--red)`. Reserved for the single primary conversion action per section.

**Default (ink):** `var(--ink)` fill, `var(--paper)` text, `1.5px solid var(--ink)` border. Hover: fill flips to `var(--paper)`, text to `var(--ink)`.

**Ghost:** transparent fill, `var(--ink)` text, `1.5px solid var(--ink)` border. Hover: fill flips to `var(--ink)`, text to `var(--paper)`.

Transition: `0.1s ease` on background-color and color only. No motion.

---

## Layout

- 12-column grid, generous gutters, alignment is non-negotiable.
- Max content width ~1200px with comfortable horizontal padding (2rem desktop, 1.5rem mobile).
- Vertical rhythm: sections breathe. ~6–8rem between major sections.
- Horizontal rules (1.5px ink) separate information bands.
- Horizontal anchoring preferred over stacked: pair subtext and buttons side-by-side when space allows.

---

## Interaction

- Transitions: `0.1s ease` only. No easing curves longer than that.
- No fades, no glows, no lifts, no parallax.
- Hover states: invert fill. That's it.
- Focus: 1.5px ink outline, `outline-offset: -1.5px`. Never a glow or shadow.
- `prefers-reduced-motion`: respect it. Animations collapse to instant.

---

## Logo

**LOCALPRAXIS** — one word, no space. "LOCAL" in `--ink`. "PRAXIS" in `--red`. American Airlines split. Archivo Black or Helvetica-style heavy sans at display sizes; not Archivo Black in small-inline contexts where it would fight with body text.

---

## Voice

Direct, plainspoken, no marketing filler. Short sentences. Period instead of em-dash when in doubt (no em-dashes in copy). Lower-case sentence where possible; ALL CAPS only on display headlines, eyebrows, and button labels.

Tagline (do not change): **Stop renting your software. Own it.**

---

## When in doubt

The more austere option is the right one. If a component feels like it's trying, strip it.

Hold new components up next to the reference carousel (Piccolo Teatro, American Airlines mark, NPS Unigrid, Klim Söhne specimen, Linear docs). If it doesn't belong in that set, it doesn't belong on this site.
