# SESSION 3 HANDOFF — MANAGER VIEW (PARTIAL) + DESIGN SYSTEM PIVOT

**Status:** session 3 closed mid-build. Two of four manager-dashboard sections shipped in markup, but their CSS is in the wrong design system and must be reskinned next session. The session's most consequential output is the formalized two-system framing in `CLAUDE.md`.

---

## 1. What was accomplished this session

### 1a. Manager dashboard scope reordering

Original session-2 handoff sequenced session 3 as the **owner view**. The user pivoted at the top of this session to build the **manager view** first (highest-value surface for the primary CCMS prospect). New ordering, locked:

| Session | View |
|---|---|
| **3 (this)** | Manager dashboard |
| 4 | Owner dashboard (Sarah Whitaker, o1) |
| 5 | Guest booking flow (includes the `resolveRate` helper for `RATE_PERIODS`) |
| 6 | Owner + manager sub-views, cross-page linking, polish |

Session 3 was scoped to four sections, in order: Ops Strip, Today's Operations timeline, Properties Grid, Channel Sync Status.

### 1b. Section 1 — Ops Strip (markup ✓, CSS to be reskinned)

Five horizontal metric tiles, "COASTAL STAYS HQ" eyebrow header, "Operations" h1, dated "SUN APR 19 / 2026". Computed values (verified against `data.js` for `DEMO_TODAY = 2026-04-19`):

| Tile | Value | Derivation |
|---|---|---|
| Total Properties | **24** | `DATA.properties.length` |
| Active Bookings | **3** | reservations where `check_in <= DEMO_TODAY < check_out`, status ≠ cancelled. r18, r35, r53 starting today (3 PM check-in). r48 excluded — checking out today, mid-departure. **Industry convention is checkout-exclusive for "occupied tonight" counts.** |
| Check-ins Today | **3** | r18→p3 (Samuel Adeyemi · Sea Breeze Cottage), r35→p7 (Julia Ferreira · Driftwood House), r53→p13 (Monica Bell · Marlin's Rest) |
| Cleanings Pending | **1** | ct1 only (post-checkout turnover for r48 at p11, status `in_progress`). The three pre-arrival cleans (ct2, ct3, ct4) are already `complete` per seed data |
| Open Maintenance | **4** | mt1 (p1 AC compressor, in_progress), mt3 (p7 pool light, open), mt4 (p10 roof leak, in_progress), mt6 (p18 disposal, open) |

Markup currently rendered with Swiss-brutalist CSS: paper/ink palette, IBM Plex Mono labels, Archivo Black numerals, `border-radius: 0`, 1.5px borders, no shadows. Five tiles use a `gap: var(--border-width)` over `background: var(--ink)` trick to draw the dividers — clean approach but the visual language is wrong for demos.

### 1c. Section 2 — Today's Operations timeline (markup ✓, CSS to be reskinned)

Vertical timeline with 10 events on `2026-04-19`, sorted ascending by time:

| Time | Type | Detail | State |
|---|---|---|---|
| 9:00 AM | Cleaning | Sea Breeze Cottage · Bay Area Cleaning | — |
| 10:00 AM | Cleaning | Driftwood House · Island Clean Co. | — |
| 11:00 AM | Check-out | Harold Patel · Island Pines | — |
| 11:00 AM | Cleaning | Marlin's Rest · Bay Area Cleaning | — |
| 12:00 PM | Cleaning | Island Pines · Island Clean Co. · turnover for r48 | in-progress |
| 2:00 PM | Onsite | Sandcastle 412 · Coastal Maintenance · AC compressor | in-progress |
| 2:30 PM | Onsite | Tide Pool House · Coastal Maintenance · roof leak repair | in-progress |
| 3:00 PM | Check-in | Samuel Adeyemi · Sea Breeze Cottage | — |
| 3:00 PM | Check-in | Julia Ferreira · Driftwood House | — |
| 3:00 PM | Check-in | Monica Bell · Marlin's Rest | — |

**Decisions baked into the markup that should survive the reskin:**

- **Cleaning order ≠ id order.** Spec said "assign times by order (9:00, 10:00, 11:00…)". Strict id-order would have put `ct1` (post-checkout for r48) at 9:00 AM, before the 11:00 AM check-out it's cleaning up after. Used realistic ordering instead: pre-arrival cleans first (ct2, ct3, ct4), then ct1 after 11:00 AM check-out.
- **`ct4` displayed at scheduled start time, not the "Completed 1:05 PM" note.** Same approach for ct2 / ct3. Start-time semantics, not finish-time.
- **Two ONSITE events** (mt1, mt4 — both in_progress). Staggered 2:00 PM / 2:30 PM so they don't collide.
- **No "TOMORROW" backfill** — 10 events is well above the 3-event threshold.

Visual treatment in current build: cyan accent on in-progress tags + markers (Swiss-brutalist `--cyan: #4A90B8`). Mobile collapses time to a stacked label above the event row. **All of this gets reskinned to mustard / `--yellow` next session per the rental.html "Ochoa pickup scheduled" / "Pennington overdue" pattern.**

### 1d. Architectural conflict identified

When asked to extract design tokens from `demos/rental.html`, the divergence became unmistakable: rental.html runs a **completely different design system** from the one CLAUDE.md mandates — EB Garamond + Inter + Roboto Mono, warm-white + saturated blue + mustard palette, hard-edge offset shadows on CTAs, hairline borders, small radii allowed. The Swiss-brutalist brief was authoritative for the marketing site only; demos had quietly evolved their own language.

### 1e. CLAUDE.md updated to formalize the two-system split

Replaced the single-aesthetic mandate with explicit **MARKETING SYSTEM** vs **PRODUCT SYSTEM** sections, plus a routing table and per-system overrides for the code-standards rules that previously read as global (border-radius, box-shadow, transition timing, border weight). Marketing system spec is unchanged from the prior brief. Product system spec was extracted directly from rental.html `:root` and component patterns. CLAUDE.md now declares:

- **Marketing** applies to: `index.html`, `about.html`, future `/blog/*`, social/print, public READMEs.
- **Product** applies to: all `demos/*`, client-facing product UI, internal tools.
- **rental.html IS the product spec** until a formal `demos/DESIGN.md` lands.
- "Never mix systems within a single component" is now rule 6 of the Task Execution Protocol.

### 1f. Full product-system token reference (for paste into next session)

Extracted from `demos/rental.html:29-52` and `:54-63` (dark mode):

```css
:root {
  --warm-white: #F2ECE4;
  --cream:      #EAE3D8;
  --ink:        #2C2A28;
  --ink-mid:    #4A4745;
  --ink-light:  #7A7572;
  --accent:        #256193;
  --accent-hover:  #1D4E76;
  --accent-subtle: color-mix(in srgb, #256193 10%, transparent);
  --yellow:        #F2CE72;
  --yellow-hover:  #E5C060;
  --rule:        #2C2A28;
  --rule-light:  #C4BBB0;
  --status-green:    #0A9C78;
  --status-amber:    #F2CE72;
  --status-red:      #C85A17;
  --status-charcoal: #4A4745;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --sidebar-w: 220px;
  --panel-w: 420px;
  --font-display: 'EB Garamond', Georgia, serif;
  --font-body:    'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:    'Roboto Mono', 'Courier New', monospace;
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

Status colors do **not** change in dark mode — only surfaces and ink ramps shift.

Font imports (per `demos/rental.html:22-26`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
```

Body base: `font-size: 15px`, `line-height: 1.5`, antialiased.

---

## 2. What session 4 picks up

In order:

1. **Replace portal.html CSS foundation.** Strip the entire current `:root`, reset, role-bar, sidebar, layout, mobile-breakpoint, and reduced-motion rule blocks. Rebuild on the product-system tokens above. Keep the head pre-paint script and body view-switching script unchanged.
2. **Reskin Section 1 (Ops Strip).** Markup stays. New CSS treats the strip as rental.html's metric strip pattern (Active Rentals / Available / Today's Revenue / Fees Saved). Same typographic hierarchy (EB Garamond display numerals, Inter labels), hairline rules, warm-white surface.
3. **Reskin Section 2 (Today's Operations timeline).** Markup stays. The cyan in-progress treatment becomes the **mustard / `--yellow` highlight treatment** per rental.html's "Ochoa pickup scheduled" / "Pennington overdue" patterns — the in-progress tag pill gets `background: var(--yellow); color: var(--ink); border: 1px solid var(--ink)`, the timeline marker swaps to mustard or terracotta as appropriate.
4. **Build Section 3 — Properties Grid (24 rows).** Per session-3 spec section 3: columns `PROPERTY | OWNER | OCCUPANCY (this week) | CHANNELS | NEXT BOOKING | ALERT`. Use rental.html's table component pattern. Red/terracotta dot (`--status-red`) for the alert column when a property has an open maintenance ticket.
5. **Build Section 4 — Channel Sync Status panel.** Small fixed-width (~400px) panel: LAST SYNC ("14 min ago"), CHANNELS HEALTHY (count of `sync_status === 'active'` or `'synced'` over total), CONFLICTS (count `'error'` — should be 1), PENDING (count `'pending'` — should be 1). Plus a `VIEW DETAILS →` link to `href="#"` (real sub-view lands in session 6).

---

## 3. Critical reuse notes — do not regress

**Markup that MUST be preserved verbatim** (only the CSS rules targeting these classes change):

- `<header class="mgr-header">` and its children (`.mgr-eyebrow`, `.mgr-date`, `.mgr-date-day`, `.mgr-date-year`)
- `<section class="ops-strip">` and its `.ops-tile`, `.ops-numeral`, `.ops-label` children. All five tiles, all values.
- `<ol class="timeline">` and its `.timeline-event`, `.timeline-time`, `.timeline-tag`, `.timeline-detail` children. All ten events, all times, the `data-state="in-progress"` attribute on the three in-progress events.
- `<section class="section-header">` (currently shared by section 2; section 3 + 4 will reuse it).

**Shell that MUST be preserved verbatim:**

- The `<!DOCTYPE>` + `<html lang="en" data-view="owner">` opening
- All `<head>` metadata (title, description, canonical, OG, Twitter, SVG favicon)
- Font preconnect links (font URLs themselves change — the `preconnect` lines stay)
- `<nav class="role-bar">` with three `.role-btn` buttons + `.menu-toggle`
- `<noscript>` fallback
- `<div class="layout">` → `<aside class="sidebar">` + `<main class="main">` structure
- All three `.sidebar-pane[data-view]` and `.view-pane[data-view]` containers
- `<script src="data.js">` and the body view-switching IIFE that follows it
- The head pre-paint script setting `html[data-view]` from `?view=`

**JS that MUST be preserved verbatim:**

- Head pre-paint script (`ALLOWED = { owner: 1, manager: 1, guest: 1 }`)
- Body IIFE: `applyView`, `setView`, click handlers on `.role-btn`, `.menu-toggle` aria-expanded toggle, `matchMedia` resize listener, console.info diagnostics

**CSS that MUST be REPLACED:**

- The entire current `:root` block (four-color palette, two-font stack, `--border` / `--border-width`, `--s1`–`--s8` spacing, `--sidebar-width`, `--role-bar-height`, `--max-content`)
- The current `[data-theme="dark"]` block (paper/ink swap)
- Reset including `border-radius: 0` global
- `.role-bar`, `.role-bar-label`, `.role-segments`, `.role-btn` with cyan-fill active state
- `.menu-toggle`
- `.layout`, `.sidebar`, `.main`, `.view-pane`, `.placeholder`
- `.mgr-header`, `.mgr-eyebrow`, `.mgr-date`, `.mgr-date-year` (rules — class names stay)
- `.ops-strip`, `.ops-tile`, `.ops-numeral`, `.ops-label` (rules — class names stay)
- `.section-header`, `.section-meta` (rules — class names stay)
- `.timeline`, `.timeline-event`, `.timeline-time`, `.timeline-tag`, `.timeline-detail` (rules — class names stay)
- `.timeline-event[data-state="in-progress"]` cyan rules → mustard rules
- `.timeline-event[data-state="tomorrow"]` opacity rule (still useful, may need adjustment)
- The 768px mobile @media block (most rules in it need re-derivation against the new system)
- The `prefers-reduced-motion` block stays as-is (system-agnostic)

**Spacing scale `--s1`–`--s8`** is system-agnostic and useful — can be retained as-is.

---

## 4. First-message prompt for session 4 — paste-ready

```
You are resuming the Local Praxis vacation rental portal demo. Sessions 1, 2,
and 3 are complete. Session 3 ended mid-manager-dashboard after a design system
pivot. SESSION_3_HANDOFF.md has the full context — read it before doing
anything else.

## What you're inheriting (DO NOT redo this)

- demos/data.js — 1131 lines. 14 collections. Q1 financials reconcile penny-
  exact. DEMO_TODAY = "2026-04-19". Stable, do not modify.
- demos/portal.html — full HTML5 shell + role switcher bar + sidebar + main +
  URL persistence + mobile breakpoint + noscript + view-switching JS.
  Manager view contains: header (COASTAL STAYS HQ / Operations / SUN APR 19 ·
  2026), Section 1 Ops Strip (5 tiles: 24 / 3 / 3 / 1 / 4), and Section 2
  Today's Operations timeline (10 events with three flagged in-progress).
- CLAUDE.md — formalized two-system framing. Marketing system (Swiss-
  brutalist, Archivo Black + IBM Plex Mono) for index.html / about.html /
  brand surfaces. PRODUCT system (EB Garamond + Inter + Roboto Mono, warm-
  white + accent blue + mustard, editorial-warm SaaS) for everything in
  demos/. portal.html lives in demos/ and therefore uses the product system.

## Design source of truth

demos/rental.html is the canonical product-system reference implementation.
Read its `:root` block (lines ~29-52) and the components most relevant to the
manager dashboard before touching CSS:

- `.sidebar`, `.nav-item`, `.nav-item.active`, `.nav-item:hover` — sidebar
  treatment (saturated blue, mustard active state, italic serif hover)
- `.btn`, `.btn-primary`, `.btn-primary:hover/:active` — CTA treatment
  (mustard with 2px hard-edge ink shadow, italic uppercase text)
- `.status-dot.confirmed`, `.status-dot.overdue`, `.status-dot.completed` —
  pill colors that map cleanly to timeline state semantics
- `.fleet-band-pill.avail/.rented/.maint` — alternative pill treatment if
  needed
- The `.demo-banner` and `.demo-about` strips (cream surface, mono labels)
  for any thin-strip metadata patterns

## Session 4 task list (in order)

1. Replace portal.html CSS foundation — strip and rebuild on product tokens.
   - Swap font imports: Archivo Black + IBM Plex Mono OUT, EB Garamond + Inter
     + Roboto Mono IN. Preconnect lines stay.
   - Replace `:root` block with the product-system token set documented in
     SESSION_3_HANDOFF.md section 1f. Replace `[data-theme="dark"]` with the
     product-system dark overrides.
   - Strip global `border-radius: 0` from the reset.
   - Rewrite .role-bar / .role-btn / .menu-toggle / .sidebar / .layout / .main
     in the product system. Sidebar gets the saturated `--accent` background
     with the mustard active-state pattern. Role buttons follow rental.html's
     button conventions.
   - Mobile @media block needs re-derivation against the new tokens but
     should preserve the same behavior (sidebar slides in via aria-expanded
     :has() selector).
   - Keep prefers-reduced-motion block as-is.
   - Keep --s1..--s8 spacing scale as-is.

2. Reskin Section 1 (Ops Strip) — markup stays untouched. Rewrite the CSS
   targeting .ops-strip / .ops-tile / .ops-numeral / .ops-label. Look at
   how rental.html treats its dashboard metric strip; match that pattern.
   EB Garamond for the numerals, Inter for the labels, hairline `--rule-
   light` dividers, warm-white surface.

3. Reskin Section 2 (Today's Operations timeline) — markup stays untouched.
   Rewrite CSS targeting .timeline / .timeline-event / .timeline-time /
   .timeline-tag / .timeline-detail. The in-progress treatment (currently
   cyan) becomes mustard `--yellow` per rental.html's "Ochoa pickup
   scheduled" / "Pennington overdue" pill patterns. The vertical line
   becomes 1px `--rule-light`. Markers can stay solid squares or shift to
   small mustard fills for in-progress.

4. CHECKPOINT here. Do not start Section 3 until I've approved the
   reskinned Sections 1 and 2.

5. Build Section 3 — Properties Grid (24 rows). Columns: PROPERTY | OWNER |
   OCCUPANCY (this week) | CHANNELS | NEXT BOOKING | ALERT. Use rental.html
   table conventions: hairline `--rule-light` row dividers, Inter body, mono
   technical labels in the header row. CHANNELS column uses pill badges
   (status-dot pattern) for AIRBNB / VRBO / BOOKING with the seeded sync
   statuses. Direct channel implicit. ALERT column shows a `--status-red`
   solid dot when the property has any open or in_progress maintenance
   ticket.

6. Build Section 4 — Channel Sync Status panel (~400px fixed width). Small
   panel showing LAST SYNC (use a static "14 min ago"), CHANNELS HEALTHY
   (count of channel_listings with sync_status 'synced' over total — the
   data uses 'synced' not 'active', confirm before computing), CONFLICTS
   (count 'error' — 1 per cl40), PENDING (count 'pending' — 1 per cl29).
   Plus a "VIEW DETAILS →" link to `href="#"`.

## Execution rules (unchanged)

- Output code only. Brief checkpoints between sections.
- Do not modify demos/data.js.
- Do not modify the portal.html JS or HTML shell. Only the <style> block
  and the font import links.
- Do not rewrite the manager-dashboard markup (header, ops-strip, timeline).
  Class names and DOM structure are load-bearing.
- Respect the product system per CLAUDE.md. If you reach for a marketing-
  system token (Archivo Black, paper #D8DBD0, --red, etc.), stop.
- Honor [data-theme="dark"] for every new rule.
- Honor prefers-reduced-motion (already handled by the existing block).
- Flag bugs or ambiguity before coding around them.

## Constraints

- No new files. Modify demos/portal.html only.
- Single-file: all CSS stays inline in <style>, all JS inline in <script>.

Confirm you've read SESSION_3_HANDOFF.md, acknowledge the markup-preservation
rule for Sections 1 and 2, and start with task 1 (CSS foundation rebuild).
```

---

## 5. Files touched this session

| File | Change |
|---|---|
| `demos/portal.html` | Added manager view: header + Section 1 (Ops Strip markup + Swiss-brutalist CSS) + Section 2 (timeline markup + Swiss-brutalist CSS). All to be reskinned next session. |
| `CLAUDE.md` | Replaced single-aesthetic Swiss-brutalist mandate with two-system framing (Marketing vs Product). Embedded product-system token reference. Added per-system overrides table to Code Standards. Added "never mix systems" rule. |
| `SESSION_3_HANDOFF.md` | This file. New. |

`demos/data.js` not modified. Original `HANDOFF.md` not modified — this session's handoff is in `SESSION_3_HANDOFF.md` per the user's instruction.
