# CLAUDE.md — Local Praxis

## Project

Local Praxis is a custom software business in Port Aransas, TX. This repo is the marketing site at localpraxis.com.

- **Repo:** `orphicaxiom/localpraxis`
- **Hosting:** GitHub Pages
- **Domain:** localpraxis.com (CNAME in repo root)
- **Stack:** Vanilla HTML/CSS/JS. No frameworks, no build step, no dependencies.
- **Owner:** James Johnson (jim@localpraxis.com)

---

## Design Direction — READ THIS FIRST

**The design brief at `.claude/design-brief.md` is the single source of truth for ALL visual decisions.**

Read it before any visual, CSS, or layout work. It supersedes ALL skill files.

### Current Aesthetic: Swiss-Brutalist / Unimark-Descended

The site references Vignelli's Piccolo Teatro posters, Müller-Brockmann grids, the NPS Unigrid system, Klim Söhne specimen pages, and Linear docs. Key principles:

- **Typography:** 2-tier system. Archivo Black (900) for display/headlines. IBM Plex Mono (400/500/600) for body, labels, nav, buttons. No serifs. No Helvetica Neue, no Impact, no Satoshi, no Instrument Serif, no IBM Plex Sans.
- **Color:** Paper `#D8DBD0` + Ink `#0A0A0A` + Red `#C8342E` + Cyan `#4A90B8`. Red for CTAs only. Cyan for active/in-progress states only. No gradients, no other accents.
- **Logo:** LOCALPRAXIS — "LOCAL" in ink, "PRAXIS" in red. American Airlines split.
- **Geometry:** `border-radius: 0` everywhere. `1.5px solid var(--ink)` borders. No shadows, no drop-shadows.
- **Interaction:** 0.1s snap transitions on background-color and color only. Buttons invert fill on hover. No fades, glows, or lifts.
- **Layout:** 12-column grid, generous gutters, max width ~1200px. Information banding with horizontal rules. Section vertical rhythm ~6–8rem.

---

## Skill File Status — ALL OUTDATED

All three skill files contain outdated guidance from a previous design direction. The design brief supersedes them entirely for visual decisions.

### `local-praxis-design` SKILL.md — OUTDATED
- ❌ References terracotta, Instrument Serif, Satoshi, rounded corners, soft shadows, slow animations
- ❌ Everything in this file conflicts with the current direction
- ⚠️ Do not follow any visual guidance from this file. Use design-brief.md instead.

### `local-praxis-code` SKILL.md — PARTIALLY OUTDATED
- ❌ WRONG: "Hosting: Netlify" → Hosting is GitHub Pages
- ✅ KEEP: Quality standards, responsive approach, accessibility requirements

### `local-praxis-brand` SKILL.md — MOSTLY CURRENT
- ❌ WRONG: Email listed as Gmail → Correct email is jim@localpraxis.com
- ✅ KEEP: Voice, tone, copy guidelines. Use for any written content.
- ⚠️ Note: Brand voice says "no em dashes" — respect this in all copy.

---

## Agent Usage Rules

⚠️ `.claude/agents/` is **not present** in this repo — the agents referenced below (`design-reviewer.md`, `frontend-developer.md`, `copy-editor.md`, `ux-tester-agent.md`, `new-demo.md`) don't exist. Treat the table as aspirational until the files are created.

When making changes until then:
- Read `.claude/design-brief.md` before any visual or CSS change.
- Hold the result up against the five reference images in `/design/` (if present) or the brief's reference list (Piccolo Teatro, NPS Unigrid, Klim Söhne, Linear docs, rsms.me).
- For copy: follow the voice guidance in `.claude/design-brief.md` (direct, plainspoken, short sentences, no em-dashes).

---

## Code Standards

- Vanilla HTML/CSS/JS. No React, no Tailwind, no build tools.
- Single-file architecture: `index.html` contains all CSS in `<style>` and all JS in `<script>`.
- CSS custom properties for all colors, fonts, and reusable values.
- `border-radius: 0` globally.
- Transitions: `0.1s ease` only.
- No `box-shadow` anywhere.
- `requestAnimationFrame` for value animations.
- `IntersectionObserver` for scroll triggers.
- Scroll listeners: `{ passive: true }`.
- `prefers-reduced-motion` must be respected.
- Dark mode via `[data-theme="dark"]` — maintain for new styles.
- Semantic HTML, ARIA where needed, 44px touch targets on mobile.

### Font Imports

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Never re-introduce: Instrument Serif, Satoshi, Roboto Mono, Helvetica Neue, Impact, IBM Plex Sans.

---

## Task Execution Protocol

1. **Read `.claude/design-brief.md`** if the task involves anything visual.
2. **Read the relevant agent file(s)** per the routing table.
3. **Make the smallest targeted change** that accomplishes the task.
4. **Preserve all existing content and functionality.**
5. **Run the appropriate review agent(s)** before reporting completion.
6. **If ambiguous, default to the more structurally austere option.**
