# HANDOFF — Vacation Rental Portal Demo

**Session 1 (data layer) complete.** Session 2 begins with portal.html scaffolding.

---

## 1. Session summary

- Starting line count: **619**
- Final line count: **1131**
- File: `demos/data.js`

Sections added this session (in order):

1. `RATE_PERIODS` (8 entries) — seasonal pricing windows + property-specific premiums
2. `MAINTENANCE_TICKETS` (6) — mix of severity and status, two on Sarah's portfolio
3. **Bug fix in `computeFinancials`** — channel fee now charged on `taxable_subtotal` instead of `guest_total` (matches Airbnb/VRBO/Booking.com policy)
4. **Q1 reservation expansion** — added 12 new guests (g41–g52) and 37 new completed reservations (r78–r114) to reach a credible 71 Q1 completed bookings
5. `CLEANING_TASKS` (10) — today's turnover + pre-arrival cleans, plus rest of week
6. `ADJUSTMENTS` (8) — manual statement line items across 4 categories
7. `STATEMENTS` (48) — 16 owners × 3 months (Jan/Feb/Mar 2026), with penny-exact verification block
8. `PAYOUTS` (48) — one per statement, paid for Jan+Feb with ACH refs, processing for Mar
9. `DOCUMENTS` (10) — 5 owner-scoped + 5 property-scoped
10. Export block — `const DATA = {...}` with 14 collections + CommonJS guard

---

## 2. Decisions made outside the original plan

### channel_fee bug fix (flagged and approved before writing STATEMENTS)

Original `computeFinancials` charged channel fees on `guest_total` (tax-inclusive). Real-world channel policy (Airbnb 3%, VRBO 8%, Booking.com 15%) charges on the booking subtotal, excluding taxes. Changed line 34 from `guest_total * channel.fee_pct` to `taxable_subtotal * channel.fee_pct` and updated the docstring above the function. Verified `taxable_subtotal` in scope; downstream `rental_revenue` algebra simplifies cleanly to `nightly_revenue - channel_fee`.

### Q1 reservation volume expansion (flagged and approved before writing STATEMENTS)

The seeded 77 reservations produced Q1 totals (Sarah ~$9K, manager ~$33K) below the spec's aspirational sanity targets. A "struggling PM company" isn't the pitch for this demo. Appended 37 reservations (r78–r114) and 12 guests (g41–g52) to bring Q1 completed count to 71, weighted by nightly rate with Sarah's portfolio intentionally over-weighted. No existing data was modified — all new IDs.

### Channel listing reconciliation

Three new reservations initially used a channel the property doesn't list in `CHANNEL_LISTINGS`. Fixed during the expansion:
- `r87` p4 Gulf View 201: ch2 → ch4 (no VRBO listing)
- `r98` p14 Lighthouse Landing: ch3 → ch2 (no Booking.com listing)
- `r107` p21 Shell Seeker: ch2 → ch4 (no VRBO listing)

### Adjustment placements (after Q1 expansion)

Two adjustments were placed where the owner had activity at drafting time:
- `a6` dishwasher pass-through: `stmt_o8_2026-02` (o8 had no Jan activity originally; after expansion o8 has both, but the dishwasher date 2026-02-17 fits Feb better anyway)
- `a8` r64 early-checkout refund: `stmt_o10_2026-01` (ties directly to r64 which checked out Jan 19)

### Sarah Q1 tuning

To land Sarah in the $22–26K net_to_owner band, `r80` was written at 7 nights (vs 6 in early draft) and two extra bookings (`r113` p2 6n, `r114` p1 5n) were added. Final Sarah Q1: $23,250.30.

### Rounding convention for 3rd-decimal .5 cases

One reservation (`r109`) hit the ambiguous `.5` rounding case: `mgmt_fee = 439.335`. Used standard rounding (.5 up) → `mgmt_fee = 439.34`, then computed `owner_payout = rental_revenue - rounded_mgmt_fee = 2001.41` so statement arithmetic reconciles to the penny.

### Zero-activity statements

Every owner × month gets a statement record even when there was no activity. Zero-amount paid statements get `status: "paid"` but with all ACH fields (`ach_ref`, `scheduled_date`, `sent_date`) set to `null` — no transfer was initiated. Portal can filter visually.

### Date-shift to avoid same-day turnover collisions

Two new reservations shifted by one day to avoid checkout/check-in overlap with an existing booking:
- `r92` p7: Mar 7–14 → **Mar 6–13** (r34 check_in is Mar 14)
- `r104` p19: Mar 14–20 → **Mar 8–14** (r66 check_in is Mar 18, but original overlap was Mar 18–20)

---

## 3. Verification state

**All math ties out penny-exact.**

| Check | Value | Status |
|---|---|---|
| Σ reservation owner_payout across 71 Q1 completed | $79,366.26 | — |
| Σ adjustments_total across 8 adjustments | −$885.00 | — |
| Σ statement net_to_owner across 48 | **$78,481.26** | = owner_payout + adjustments ✓ |
| Σ payout amount across 48 | **$78,481.26** | = statement net ✓ |
| Sarah (o1) Q1 statement net (Jan+Feb+Mar) | **$23,250.30** | in $22–26K target ✓ |
| Manager view Q1 Σ owner_payout | **$79,366.26** | annualizes to ~$400K–$500K range ✓ |

Per-statement reconciliation: every statement's `gross_revenue − channel_fees − cleaning_passthrough − mgmt_fee + adjustments_total = net_to_owner` without rounding drift. Every paid payout's `amount` equals the corresponding statement's `net_to_owner`. Every processing payout's `amount` equals its statement's `net_to_owner`.

---

## 4. Known gaps / follow-ups

- **`taxes_pct: 0.15` on every property is currently unused.** `computeFinancials` hard-codes the 6%/9% Port Aransas HOT split. Left intentionally for future multi-market support — do not refactor.
- **`RATE_PERIODS` is not wired into `computeFinancials`.** Seasonal rate overrides are inert data — no booking currently uses them. If the booking flow in session 4 needs to honor premium pricing, add a `resolveRate(property, date)` helper at that time.
- **`CHANNEL_LISTINGS` missing Booking.com coverage** on ~14 properties (p1, p3, p4, p6, p8, p11, p12, p14, p16, p17, p18, p20, p21, p23). Only affects the manager channel-sync panel display; doesn't break any reservation.
- **`MAINTENANCE_TICKETS` costs are not auto-linked to `ADJUSTMENTS`.** Only `mt5` (hot tub $340) has a matching repair pass-through adjustment (`a1`). Other resolved tickets (`mt2` disposal) happened after 2026-03-31 and would hit April statements out of Q1 scope.
- **`CLEANING_TASKS` have no cost field.** Cleaning revenue is captured as pass-through on the reservation itself. If the manager view needs vendor payables, that's a separate roll-up — not in current scope.
- **Reservation owner_payout is computed at runtime, not stored.** Portal must call `computeFinancials(res, prop, ch)` for each reservation it displays. Statements already have the aggregated values so the dashboards don't need to recompute.
- **Zero-amount "paid" payouts** may render oddly in a generic payouts table. Suggest displaying "No payout — $0 statement" for these instead of a status pill.

---

## 5. First message for session 2

Paste the block below to start tomorrow's session:

---

```
You are resuming the Local Praxis vacation rental portal demo. Session 1 (data layer)
is complete. This session begins portal.html scaffolding.

## Repo and stack

- Path: /Volumes/Jim's Extra/Projects/localpraxis (symlinked at ~/projects/localpraxis)
- Stack: vanilla HTML/CSS/JS. No frameworks, no build tools, no dependencies.
  Single-file architecture per the repo CLAUDE.md.
- Hosting: GitHub Pages. Domain: localpraxis.com.
- File to work in: demos/portal.html (currently stubbed, needs replacement).
- Data source: demos/data.js (1131 lines, DO NOT MODIFY in this session).

## Design system — Swiss-brutalist

Read .claude/design-brief.md before any visual work. Key rules:

- Typography: Archivo Black (900) for display, IBM Plex Mono (400/500/600) for
  body, labels, nav, buttons. No serifs. No other families.
- Colors (CSS custom properties):
  --paper: #D8DBD0
  --ink:   #0A0A0A
  --red:   #C8342E   (CTAs only)
  --cyan:  #4A90B8   (active/in-progress states only)
- Geometry: border-radius: 0 everywhere. 1.5px solid var(--ink) borders. No
  box-shadow, no drop-shadow, no gradients.
- Interaction: 0.1s ease transitions on background-color and color only.
  Buttons invert fill on hover. No fades, glows, or lifts.
- Layout: 12-column grid, max-width ~1200px, generous gutters. Information
  banding with horizontal rules. Section rhythm 6-8rem.

## portal.html structure

- Top role switcher bar (full-width, ink border-bottom): three segmented buttons
  — OWNER / MANAGER / GUEST — with the active view cyan-filled.
- Sidebar (left, ~240px wide, ink border-right): role-specific nav. Populated
  per view in later sessions.
- Main content area (fills remaining width): role-specific dashboards. Empty
  shell in this session.

## URL persistence

- ?view=owner   → Owner dashboard
- ?view=manager → Manager dashboard
- ?view=guest   → Guest booking flow
- Default when no param: ?view=owner (with Sarah Whitaker o1 as the subject)
- Switching roles updates the URL via history.replaceState (no reload)

## Demo time

DEMO_TODAY = "2026-04-19" — hardcoded constant exported from data.js.
Use it for every "today" calculation. NEVER call new Date() for the demo clock.
The daysBetween() helper and computeFinancials() helper are also exported.

## Current state (after session 1)

demos/data.js exports a single `const DATA = {...}` with 14 collections:
channels, vendors, owners, guests, channel_listings, properties (24),
reservations (114 total; 71 Q1 completed), maintenance_tickets, rate_periods,
cleaning_tasks, adjustments, statements (48), payouts (48), documents.

All financials reconcile penny-exact. Sarah Whitaker (o1) is the owner-view
subject; her Q1 net_to_owner is $23,250.30 across 3 statements.

## First task for this session

HTML shell + CSS foundation + role switcher bar ONLY. No views yet.

1. Replace demos/portal.html with a clean HTML5 shell
2. Inline <style> block with CSS custom properties, reset, typography imports,
   grid scaffolding, and role-switcher-bar styling
3. Inline <script type="module"> or <script src="data.js"> that reads the
   ?view= URL param, renders the role switcher bar with the active state,
   and wires click handlers that update history.replaceState + re-render
4. Sidebar and main-content containers are present but empty (placeholder
   text like "OWNER DASHBOARD" is fine)
5. Handle prefers-reduced-motion
6. Verify it loads with ?view=owner, ?view=manager, ?view=guest

Do NOT start building role-specific dashboards in this session. Scaffolding only.

## Plan file

Full view specs for all three roles live at:
.claude/ultrathink-okay-so-hidden-whale.md

Read it before planning the session 3+ views. For this session (scaffolding
only), design-brief.md is the more relevant reference.

## Execution rules

- Output code only. No narration of thought process between steps.
- Checkpoint after each numbered section above: `CHECKPOINT [section].
  Lines added: X. Next: [section].` Then stop and wait for "continue".
- Do not modify demos/data.js.
- Respect the CLAUDE.md rule: no box-shadow, border-radius: 0, 1.5px borders,
  0.1s transitions, dark mode via [data-theme="dark"], 44px touch targets.
- If you spot a bug or ambiguity, flag it before coding around it.
- No new files other than modifications to demos/portal.html.

Confirm you've read this and understand the scaffolding-only scope, then start
with the HTML shell.
```

---

**End of session 1 handoff.** Session 1 data layer is done. Session 2 picks up at portal.html.

---

# SESSION 2 CLOSE — PORTAL SCAFFOLDING

**Session 2 (portal scaffolding) complete.** Session 3 begins with the Owner view dashboard.

---

## 1. Session 2 summary

- Starting line count: **2173** (legacy stub with outdated design system: Instrument Serif, Satoshi, cream/slate palette, rounded corners)
- Final line count: **439**
- File: `demos/portal.html` (full rewrite)

Sections completed this session (in order):

1. **HTML5 shell** — clean `<!DOCTYPE>` + `<html lang="en" data-view="owner">`, head metadata (title, description, canonical, OG, Twitter, SVG favicon recolored to ink/paper), font preconnects + Google Fonts link for Archivo Black + IBM Plex Mono, empty body skeleton (role-bar nav, layout grid with sidebar + main, three `[data-view]` panes each in sidebar and main)
2. **CSS foundation** — full `<style>` block at ~275 lines:
   - Tokens: four palette colors, two font stacks, `--border`/`--border-width`, `--s1`–`--s8` spacing scale, sidebar/role-bar/max-content dimensions
   - Dark mode scaffold via `[data-theme="dark"]` swapping only `--paper` and `--ink`
   - Reset: `box-sizing: border-box`, `border-radius: 0` globally, margin/padding reset, `[hidden] { display: none !important; }`
   - Typography: IBM Plex Mono 500 body (line-height 1.4), Archivo Black 900 headings (line-height 1.1), eyebrow label convention
   - Role-bar: sticky top, 56px, 1.5px ink border-bottom, flex row with PORTAL label left + segmented buttons right + menu-toggle far right
   - Role-btn: 44px min-height, negative margin-left to collapse shared borders, invert-fill on hover (bg→ink, color→paper), `aria-current="page"` → cyan fill
   - Layout: `display: grid` with `grid-template-columns: 240px 1fr`. Sidebar sticky-top on desktop
   - 768px mobile breakpoint: sidebar becomes `position: fixed` with `transform: translateX(-100%)`, menu-toggle inline-flex (44px target), role-bar stays horizontal with flexed buttons. `body:has(.menu-toggle[aria-expanded="true"]) .sidebar` slides it in (snap, no transform transition — per brief's "bg-color and color only")
   - `prefers-reduced-motion: reduce` universal `!important` override on transition/animation
   - Transitions: `0.1s ease` on `background-color`/`color` only, nowhere else
3. **Role switcher + JS** — two script blocks:
   - Head pre-paint script: reads `?view=` via URLSearchParams, resolves against `{owner, manager, guest}`, defaults to owner, sets `html[data-view]` before body parses (no flash-of-wrong-view)
   - Body script (after `<script src="data.js">`): `applyView()` sets `html[data-view]` + `aria-current` on matching `.role-btn` + `hidden` on inactive `.view-pane, .sidebar-pane` + closes mobile menu. `setView()` wraps applyView + `history.replaceState`. Click handlers wired to role-btns and menu-toggle (aria-expanded flip). `matchMedia('(min-width: 769px)')` listener auto-closes mobile menu on resize to desktop. Console.info reports `DATA` collection counts and initial view on load
4. **Placeholder content** — literal strings per guardrail 1. Sidebar has three `.sidebar-pane[data-view]` divs with "{OWNER|MANAGER|GUEST} NAV — scaffolding only". Main has three `.view-pane[data-view]` sections with "{OWNER DASHBOARD|MANAGER DASHBOARD|GUEST BOOKING FLOW} — scaffolding only". No render functions
5. **Reduced-motion audit** — reviewed all transitions and transforms added in steps 2–4. All transitions limited to `bg-color, color 0.1s ease`. Mobile sidebar uses `transform` without a transition declaration, so it snaps instantly regardless of reduced-motion preference. The universal `!important` override in the reduced-motion @media block is future-proof against new transitions. Zero file changes in this step
6. **Verification** — passed all checks:
   - Both inline scripts parse OK via `new Function()` smoke test
   - URL param resolution tested against 7 cases (empty, 3 valid, invalid value, uppercase mismatch, wrong key) — all route to the correct view
   - Local `python3 -m http.server` serve: `?view=owner`, `?view=manager`, `?view=guest` all return HTTP 200; `data.js` at relative path returns HTTP 200

---

## 2. Decisions made outside the session 2 spec

### PORTAL label in role-bar (decoration not in spec)

The HANDOFF's session-2 prompt described the role-bar as "three segmented buttons." I added a small `<div class="role-bar-label">PORTAL</div>` on the far left as an informational eyebrow so the bar has a left-anchor. Hidden on mobile (`display: none` in the 768px query) so the segmented buttons get full width there. Easy to remove if session 3 redesign judges it decorative.

### `:has()` instead of sibling combinator for mobile sidebar state

The step 2 spec suggested `.menu-toggle[aria-expanded="true"] ~ .layout .sidebar { transform: translateX(0); }`. That selector wouldn't work with the current DOM — `.menu-toggle` is nested inside `.role-bar`, not a sibling of `.layout`. Swapped to `body:has(.menu-toggle[aria-expanded="true"]) .sidebar` which is order-independent and modern-browser compatible (Safari 15.4+, Chrome 105+, Firefox 121+). No JS class toggle needed — aria-expanded is sufficient state.

### Sidebar slide is instant snap, not animated

The step 2 note said the sidebar "slides in" on mobile, but the design brief says "transitions: `0.1s ease` on background-color and color only. No fades, glows, or lifts." Chose the brief: no `transition: transform` declared, so the sidebar snaps on/off. Already within 0.1s perceptual budget. If session 3+ wants a 0.1s transform for the sidebar specifically, it's one line to add — flag before adding since it contradicts the brief.

### Sidebar gets per-view placeholder text, not literally empty

The HANDOFF's session-2 prompt said "Sidebar and main-content containers are present but empty (placeholder text like 'OWNER DASHBOARD' is fine)." I chose the placeholder-text option over "literally empty" so the visual weight of the layout reads correctly at checkpoint. Three `.sidebar-pane[data-view]` blocks with "{ROLE} NAV — scaffolding only". Swaps in sync with main via the same `.view-pane, .sidebar-pane` query in `applyView()`.

### Console.info diagnostic on load

Added `console.info('[portal] data.js loaded. DEMO_TODAY=…; collections: channels(N), …')` and `console.info('[portal] initial view: …')` on every load. Dev-only noise; easy to gate behind a DEBUG flag later. Useful during session 3+ for confirming data.js resolves at the relative path and the initial view matches the URL.

### Head-script reconciliation ordering

Head script runs synchronously in `<head>` before body parses. It ONLY sets `html[data-view]` — no DOM touching. Body script then reads `html[data-view]` and does the actual DOM work. This avoids the classic flash-of-wrong-view even on slow networks. JS in head is usually a code-smell; the exception here is justified by the requirement to set `<html>` attributes before paint.

---

## 3. Verification state (session 2)

| Check | Result |
|---|---|
| Inline script syntax (both blocks) | parse OK (`new Function` smoke test) |
| URL param resolution | 7/7 cases route correctly |
| HTTP 200 across `?view=owner\|manager\|guest` | 3/3 |
| HTTP 200 for `data.js` at relative path | pass |
| Motion audit (transitions + transforms) | all compliant with brief |
| Reduced-motion override | universal `!important` on `*, *::before, *::after` |
| 44px minimum touch targets | `.role-btn` + `.menu-toggle` both enforced |
| `border-radius: 0` globally | reset covers `*, *::before, *::after` |
| No `box-shadow` anywhere | grep-clean |
| Dark mode scaffold | `[data-theme="dark"]` swaps paper/ink only |

---

## 4. Session 4 prerequisite — RATE_PERIODS wiring

**RATE_PERIODS is not wired into `computeFinancials` or any rate-resolution path.** The collection exists in data.js with 8 entries covering Spring Break, summer peak, shoulder seasons, and a Christmas/New Year window, but every reservation in RESERVATIONS uses `property.nightly_rate` as a flat base and ignores seasonal overrides.

**Required before the Guest booking flow in session 4:** add a helper

```js
function resolveRate(property_id, check_in) {
  // Find the RATE_PERIODS entry (if any) whose window contains check_in
  // and whose property_id matches (or applies to all properties).
  // Fall back to PROPERTIES.find(p => p.id === property_id).nightly_rate.
}
```

…and route it through `computeFinancials` before nightly_revenue is computed. Without this helper:

- Guest booking quotes will show flat base rates even for Spring Break and summer peak dates.
- The pricing story (seasonal premium, why management pays for itself) breaks.
- Owner-view "this month's revenue" projections will under-report for upcoming peak bookings.

Scope of the helper: ~15 lines of pure logic. Session 4 owns both the helper and the booking flow that exercises it. Session 3 (owner view) does not need the helper — it reads reservation.owner_payout values that are already computed per the booking's original rate decision, and statements have aggregated values already.

---

## 5. First message for session 3

Paste the block below to start session 3:

---

```
You are resuming the Local Praxis vacation rental portal demo. Sessions 1 and 2
are complete. This session builds the Owner view dashboard.

## Current state (stable, do not modify)

- demos/data.js — 1131 lines. 14 collections. All Q1 financials reconcile
  penny-exact. Sarah Whitaker (o1) Q1 net_to_owner = $23,250.30 across 3
  statements. DEMO_TODAY = "2026-04-19".
- demos/portal.html — 439 lines. HTML5 shell + CSS foundation + role switcher
  + URL persistence + mobile breakpoint + noscript fallback. Dashboards are
  literal placeholder strings. No render functions yet.

## Render architecture — decide FIRST

demos/CLAUDE.md promotes a "domain-model-first" pattern with full CRUD render
functions per entity. Session 2's guardrail 1 explicitly forbade render
functions and kept dashboards as static placeholder strings. That tension
must be resolved before writing view code. Two viable paths:

(A) Declarative static HTML with CSS driving visibility via [data-view].
    No render layer. Session 3+ writes dashboards as literal markup keyed by
    the owner_id / property_id from data.js at build/author time. Pro: zero
    indirection, matches scaffolding style, fast. Con: can't react to
    state changes (e.g., if a user filter is added later it needs JS).

(B) Thin render functions per view. Each view exports render(state) →
    innerHTML. applyView() calls the active view's render. Pro: flexible
    for filters, sorts, detail drill-downs later. Con: introduces a render
    layer the guardrail explicitly kept out of session 2, and the existing
    JS does no string-concat rendering.

Flag which path you're taking before coding. If (B), keep render functions
pure (input state → output string) and idempotent. Global mutable state
lives in data.js only — views read, never write, in session 3.

## Session 3 scope — Owner view ONLY

Sarah Whitaker (o1), 4 properties (p1 Sandcastle 412, p2 Mustang Towers 7B,
p7 Driftwood House, p23 Captain's Quarter). Build the landing page for
?view=owner only. Do not build sub-views this session.

Landing page should include:

1. Metric strip (top): four numeric tiles — YTD net payouts, active
   bookings next 30 days, outstanding statement (current month), open
   maintenance tickets affecting Sarah's properties
2. Property cards: 4 cards, one per owned property. Each card shows property
   name + address, occupancy this month, revenue this month, upcoming
   reservation date
3. This-month bookings list: reservations on Sarah's properties with
   check_in in 2026-04-01..2026-04-30, sorted by check_in. Show guest name,
   property, dates, channel, owner_payout
4. Statement preview: most recent paid statement summary (Mar 2026) with a
   link to full statements sub-view (link goes nowhere this session)

Sub-views (My Properties, Statements, Calendar, Bookings, Maintenance,
Documents) are NOT in session 3 scope. Those land in session 5+ after
manager (session 4a? or renumber) and guest (session 4b? or session 4) are
scaffolded. Confirm sequencing with the user at the top of session 3.

## Execution rules (unchanged)

- Output code only. No narration of thought process between steps.
- Checkpoint after each logical section. Wait for "continue" approval.
- Do not modify demos/data.js.
- Respect design-brief.md: no box-shadow, border-radius: 0, 1.5px borders,
  0.1s transitions on bg-color/color only, 44px touch targets, no em-dashes
  in customer-facing copy, red for CTAs only, cyan for active states only.
- Respect CLAUDE.md dark-mode requirement: every new rule must honor
  [data-theme="dark"] via the paper/ink tokens.
- If you spot a bug or ambiguity, flag it before coding around it.
- No new files other than modifications to demos/portal.html.

## Plan file

HANDOFF.md section 4 flags a session 4 prerequisite (resolveRate helper for
RATE_PERIODS). Not session 3's problem, but do not forget.

The .claude/ultrathink-okay-so-hidden-whale.md file referenced in session 1's
handoff does not exist in the repo. Session 3 proceeds from the session 3
scope described above plus design-brief.md. If you need more spec, ask.

Confirm you've read this and understand the scaffolding-to-view scope change,
state which render path (A or B) you're taking, then start with the metric
strip.
```

---

**End of session 2 handoff.** portal.html scaffolding is stable at 439 lines. Session 3 picks up at owner-view dashboards.
