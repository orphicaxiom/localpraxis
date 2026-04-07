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

### Current Aesthetic: Swiss Purism / Unimark International

The site references Vignelli's Piccolo Teatro posters, the American Airlines logotype, Heller packaging, and the National Park Service Unigrid system. Key principles:

- **Typography:** 3-tier system. Impact for hero monolith. Helvetica Neue for everything else. IBM Plex Mono for data/numbers. No serifs anywhere. No Instrument Serif. No Satoshi.
- **Color:** Black + Cream + Vignelli Red (#D92B1C). No blue. Red is semantic only (logo split, service indexing, cost figures). Never in UI chrome.
- **Logo:** LOCALPRAXIS — "LOCAL" in black, "PRAXIS" in red. No space. American Airlines split.
- **Geometry:** `border-radius: 0` everywhere. 2px solid #111111 borders. No shadows.
- **Interaction:** 0.1s snap transitions. Black button fills invert on hover. No fades, glows, or lifts.
- **Layout:** Horizontal anchoring (subtext + button side by side). Information banding with horizontal rules. Tight spacing (~3-4rem sections).

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

Agents live in `.claude/agents/`. Use them as specified:

| Task Type | BEFORE starting | AFTER completing |
|-----------|----------------|-----------------|
| Any CSS / styling / visual change | Read `design-brief.md` | Run `design-reviewer.md` to verify |
| Any HTML structure change | Read `design-brief.md` | Run `design-reviewer.md` to verify |
| Any frontend JS | Read `frontend-developer.md` | Run `ux-tester-agent.md` |
| Any copy / content | Read `copy-editor.md` + brand skill | Run `copy-editor.md` to review |
| New demo pages | Read `new-demo.md` | Run `design-reviewer.md` + `ux-tester-agent.md` |

**Never skip agent review on visual work or copy changes.**

⚠️ Agent files may also contain outdated references to the old design (Instrument Serif, terracotta, blue accent, rounded corners). When reviewing, evaluate against `design-brief.md`, not against outdated agent criteria.

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
<!-- Helvetica Neue is a system font, no import needed -->
<!-- Impact is a system font, no import needed -->
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@700&family=IBM+Plex+Sans:wght@400;500&display=swap" rel="stylesheet">
```

Remove old imports for Instrument Serif, Satoshi, and Roboto Mono.

---

## Task Execution Protocol

1. **Read `.claude/design-brief.md`** if the task involves anything visual.
2. **Read the relevant agent file(s)** per the routing table.
3. **Make the smallest targeted change** that accomplishes the task.
4. **Preserve all existing content and functionality.**
5. **Run the appropriate review agent(s)** before reporting completion.
6. **If ambiguous, default to the more structurally austere option.**
