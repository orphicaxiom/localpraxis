# CLAUDE.md — Local Praxis

## Project

Local Praxis is a custom software business in Port Aransas, TX. This repo hosts both the marketing site at localpraxis.com and the product demos that ship with it.

- **Repo:** `orphicaxiom/localpraxis`
- **Hosting:** GitHub Pages
- **Domain:** localpraxis.com (CNAME in repo root)
- **Stack:** Vanilla HTML/CSS/JS. No frameworks, no build step, no dependencies.
- **Owner:** James Johnson (jim@localpraxis.com)

---

## Design Direction — TWO SYSTEMS

This repo runs two distinct visual systems. Identify which one your task belongs to **before** writing any CSS, copy, or markup. Mixing them is a bug.

| System | Scope | Display | Body/UI | Mono | Aesthetic |
|---|---|---|---|---|---|
| **Marketing** | localpraxis.com brand surfaces | Archivo Black | IBM Plex Mono | — | Swiss-Brutalist |
| **Product** | All `demos/`, client deployments, internal tools | EB Garamond | Inter | Roboto Mono | Editorial-warm SaaS |

### Decision rule

- Editing `index.html`, `about.html`, future `/blog/*` posts, social/print materials, OG images, READMEs aimed at the public → **Marketing system**.
- Editing anything inside `demos/`, any client-facing product UI, internal tools or dashboards → **Product system**.

If a file straddles both (e.g. a marketing landing page that embeds a product screenshot), the system applies per-region: chrome stays in the host system, embedded artifacts stay in their own.

---

## MARKETING SYSTEM — Swiss-Brutalist / Unimark-Descended

**Source of truth:** `.claude/design-brief.md`. Read it before any visual change to marketing surfaces.

References: Vignelli's Piccolo Teatro posters, Müller-Brockmann grids, the NPS Unigrid system, Klim Söhne specimen pages, Linear docs.

- **Typography:** 2-tier. Archivo Black (900) for display/headlines. IBM Plex Mono (400/500/600) for body, labels, nav, buttons.
- **Color:** Paper `#D8DBD0` + Ink `#0A0A0A` + Red `#C8342E` + Cyan `#4A90B8`. Red for CTAs only. Cyan for active/in-progress states only. No gradients, no other accents.
- **Logo:** LOCALPRAXIS — "LOCAL" in ink, "PRAXIS" in red. American Airlines split.
- **Geometry:** `border-radius: 0` everywhere. `1.5px solid var(--ink)` borders. **No `box-shadow`.**
- **Interaction:** 0.1s snap transitions on `background-color` and `color` only. Buttons invert fill on hover. No fades, glows, or lifts.
- **Layout:** 12-column grid, generous gutters, max width ~1200px. Information banding with horizontal rules. Section vertical rhythm 6–8rem.
- **Never use in marketing:** Instrument Serif, Satoshi, EB Garamond, Inter, Roboto Mono, Helvetica Neue, Impact, IBM Plex Sans, any rounded corner, any drop shadow, any color outside the four-token palette.

### Marketing font imports

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## PRODUCT SYSTEM — Editorial-Warm SaaS

**Source of truth:** `demos/rental.html` is the canonical reference implementation. Extract `:root` tokens and component patterns from it when building new product surfaces. A formal `demos/DESIGN.md` may follow; until then, rental.html IS the spec.

### Typography

- **Display (serif):** EB Garamond, weights 400 / 600 / 700 (regular + italic each). Used for h1/h2, sidebar branding, and as a hover-state swap on nav items.
- **Body/UI (sans):** Inter, weights 400 / 500 / 600 / 700. Default body, all controls.
- **Mono accents:** Roboto Mono, weights 400 / 500. Reserved for small uppercase technical labels (status strips, file metadata, debug chrome).
- **Base:** `font-size: 15px`, `line-height: 1.5`, antialiased.

### Color tokens (canonical `:root`)

```css
:root {
  --warm-white: #F2ECE4;   /* page background */
  --cream:      #EAE3D8;   /* secondary surface */
  --ink:        #2C2A28;   /* primary text */
  --ink-mid:    #4A4745;   /* secondary text */
  --ink-light:  #7A7572;   /* tertiary text */
  --accent:        #256193;   /* saturated blue — sidebar, links, focus */
  --accent-hover:  #1D4E76;
  --accent-subtle: color-mix(in srgb, #256193 10%, transparent);
  --yellow:        #F2CE72;   /* mustard — CTA, active nav, partial states */
  --yellow-hover:  #E5C060;
  --rule:        #2C2A28;     /* heavy border */
  --rule-light:  #C4BBB0;     /* hairline border, table dividers */
  --status-green:    #0A9C78; /* confirmed, available */
  --status-amber:    #F2CE72; /* warning (= --yellow) */
  --status-red:      #C85A17; /* terracotta — overdue, danger */
  --status-charcoal: #4A4745; /* neutral status (= --ink-mid) */
}

[data-theme="dark"] {
  --warm-white: #1C1917;
  --cream:      #292524;
  --ink:        #F2ECE4;
  --ink-mid:    #A8A29E;
  --ink-light:  #78716C;
  --rule:       #5C5652;
  --rule-light: #44403C;
  --accent-subtle: color-mix(in srgb, var(--accent) 15%, transparent);
}
```

Status colors do NOT change in dark mode — only surfaces and ink ramps shift.

### Geometry & interaction

- Hairline borders (`1px solid var(--rule-light)`) for cards, tables, dividers; heavier `1px solid var(--ink)` for primary edges.
- **Hard-edge offset shadows on CTAs:** `box-shadow: 2px 2px 0px var(--ink)` at rest, collapsing on hover/active. This is a load-bearing aesthetic, not a violation.
- Small radii allowed (e.g. 4–6px on buttons, badges) — the system reads as warm-editorial, not brutalist.
- Transitions: 0.15s–0.2s easing. Use `cubic-bezier(0.16, 1, 0.3, 1)` (the rental.html `--ease`) for anything kinetic.
- Generous spacing, editorial whitespace, no information density panic.

### Product font imports

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- **Never use in product:** Archivo Black, IBM Plex Mono, paper/red/cyan brutalist palette, `border-radius: 0` as a global rule, the four-token marketing color set.

---

## Skill File Status

The `local-praxis-*` skill files predate the two-system framing and contain mixed guidance. Treat them as advisory only. CLAUDE.md (this file) supersedes them.

### `local-praxis-design` SKILL.md
- Visual guidance is **outdated for both systems** — references terracotta, Instrument Serif, Satoshi, rounded corners, slow animations that don't match either current direction.
- Do not follow visual guidance from this file. Use this CLAUDE.md and (for marketing) `.claude/design-brief.md` instead.

### `local-praxis-code` SKILL.md
- Wrong: "Hosting: Netlify" → Hosting is **GitHub Pages**.
- Keep: quality standards, responsive approach, accessibility requirements (system-agnostic).

### `local-praxis-brand` SKILL.md
- Wrong: email listed as Gmail → Correct email is **jim@localpraxis.com**.
- Keep: voice, tone, copy guidelines. Apply to all written content in either system.
- Note: brand voice says "no em dashes" — respect this in all copy.

---

## Agent Usage Rules

`.claude/agents/` is not present in this repo — the agents historically referenced (`design-reviewer.md`, `frontend-developer.md`, `copy-editor.md`, `ux-tester-agent.md`, `new-demo.md`) don't exist. Treat that table as aspirational until the files are created.

Until then:
- Identify the system (marketing vs product) before any visual or CSS change.
- For marketing, read `.claude/design-brief.md` and reference the brief's image set (Piccolo Teatro, NPS Unigrid, Klim Söhne, Linear docs, rsms.me).
- For product, read `demos/rental.html`'s `:root` block and the closest existing component, then match its patterns.
- For copy: follow voice guidance in `.claude/design-brief.md` (direct, plainspoken, short sentences, no em-dashes) regardless of system.

---

## Code Standards

System-agnostic baseline:

- Vanilla HTML/CSS/JS. No React, no Tailwind, no build tools.
- Single-file architecture: each page contains its CSS in `<style>` and JS in `<script>`. Demos may externalize shared data files (e.g. `demos/data.js`).
- CSS custom properties for all colors, fonts, and reusable values.
- `requestAnimationFrame` for value animations.
- `IntersectionObserver` for scroll triggers.
- Scroll listeners: `{ passive: true }`.
- `prefers-reduced-motion` must be respected.
- Dark mode via `[data-theme="dark"]` — maintain for new styles in both systems.
- Semantic HTML, ARIA where needed, 44px touch targets on mobile.

System-specific overrides:

| Rule | Marketing | Product |
|---|---|---|
| Global `border-radius` | `0` everywhere | small radii allowed (4–6px on controls) |
| `box-shadow` | banned | hard-edge offset (`2px 2px 0px var(--ink)`) on CTAs is canonical |
| Transition timing | `0.1s ease` only | `0.15s–0.2s`, `cubic-bezier(0.16, 1, 0.3, 1)` for kinetic |
| Border weight | `1.5px solid var(--ink)` | `1px solid var(--rule-light)` hairline + `1px solid var(--ink)` heavy |

---

## Task Execution Protocol

1. **Identify the system** (marketing vs product) from the file path and surface intent.
2. **Read the relevant source of truth:** `.claude/design-brief.md` for marketing, `demos/rental.html` for product.
3. **Make the smallest targeted change** that accomplishes the task.
4. **Preserve all existing content and functionality.**
5. **If ambiguous within a system, default to the more structurally austere option** (marketing) or **the closest existing rental.html pattern** (product).
6. **Never mix systems within a single component.** If you find yourself reaching for a token that belongs to the other system, stop and re-check the surface.
