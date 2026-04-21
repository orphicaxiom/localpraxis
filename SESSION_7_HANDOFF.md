# SESSION 7 HANDOFF — GUEST BOOKING FLOW + PORTAL DEMO CLOSED

**Status:** Portal demo is **feature-complete**. All three role views (Manager, Owner, Guest) are built, interactive, and deep-linkable. The guest booking flow goes search → property list → detail → review → confirmation with mock reservation ID. `resolveRate` helper wired — seasonal pricing (Spring Break, Summer Peak, July 4th, Thanksgiving, Christmas) and property-specific premium overrides (p2/p5/p7 June-August) both honored. portal.html stable at **4211 lines**, HTTP 200 across all routes, both inline scripts parse cleanly.

---

## 1. What was accomplished this session

### 1a. `resolveRate(property_id, check_in)` helper
Lives in the body IIFE. Signature returns `{ nightly_rate, min_stay, label, base_rate, premium_pct }`. Priority order:

1. **Property-specific override** (e.g., rp6 Mustang Towers 7B Peak Premium June-August at $495) → use override rate + period's min_stay + period's label. `premium_pct` computed as `(override - base) / base × 100`.
2. **Market-wide period** (e.g., rp1 Summer Peak May 15 - Sep 15) → use property base rate + period's min_stay + period's label. `premium_pct = 0`.
3. **Off-peak default** → base rate, min_stay 1, null label, premium_pct 0.

Exposed at `window.__portal.resolveRate` for testing. Verified across 6 edge cases:
- p1 Summer Peak entry → base $285, 7-night min, "Summer Peak"
- p2 June-August → override $495 (beats market Summer Peak)
- p2 May (pre-June) → market Summer Peak applies at $375 base
- p1 off-peak (Apr 22) → $285, 1-night min, null label
- p1 Spring Break → $285, 4-night min
- p5 July 4 → property override $575 (beats market July 4th Week)

Override-beats-market is the canonical policy. Min-stay not tightened by combining periods (property-specific wins entirely).

### 1b. `computeGuestPrice(property_id, check_in, check_out, channel_id)` wrapper
Thin wrapper that composes `resolveRate` + `computeFinancials`. Synthesizes a property with the resolved nightly rate (via `Object.assign`), runs financial computation, returns a guest-scoped view:
- `nights`, `nightly_rate`, `base_rate`, `premium_pct`, `rate_period`, `min_stay`
- `nightly_revenue`, `cleaning_fee`, `state_hot`, `city_hot`, `taxes`
- `guest_total` — the all-in number shown to guests

Default channel is `ch4` (Direct, 2.9% fee). The guest booking flow always uses direct — that's the pitch ("skip the platforms"). Channel fee still factored in because owners pay it even on direct; it just stays under the hood for guest-facing views.

### 1c. Guest view — skeleton + branding (7a)
- **Sidebar pane** rebuilt for guest: "Coastal Stays" sidebar h1 + "Direct Booking" eyebrow + `.sidebar-pitch` panel ("Skip the platforms. Book direct, save 14-20%." in italic yellow EB Garamond + 4-item checkmark list) + footer (bookings@ email).
- **Hero**: "PORT ARANSAS · TEXAS GULF COAST" eyebrow, "Find your beach stay." h1 in EB Garamond 700 at 2.6rem, italic serif tagline "Book direct with local owners. No middleman, no surprises — just the property and the price."
- **Search form**: 4-column grid (check-in / check-out / guests / submit). `<input type="date">` preloaded with 2026-05-15 → 2026-05-22, 9-option guests select defaulting to 4. Mustard submit button with hard-edge ink shadow (`.guest-search-btn`). Mobile stacks to single column.
- Default search lands mid-Summer-Peak, 7-night stay — exercises the seasonal premium story out of the box.

### 1d. Property list rendering (7b)
`renderGuestResults()`:
- Reads form values, validates dates (checkOut > checkIn), filters properties by `sleeps >= guests`.
- Runs `computeGuestPrice` per matching property.
- Sorts by `guest_total` ascending, **demoting min-stay-fail properties to the bottom** (user still sees them, but prioritizes bookable matches).
- Renders header (`{N} properties available · {nights} nights · {guests} guests · {ci → co}`) + `.property-list` of `.property-card` articles.

Each property card: 3-column grid (`200px 1fr 200px`):
- **Photo placeholder** — `var(--accent)` blue with property name in italic yellow serif (same `.property-card-photo` / `.guest-detail-hero` convention). Responsive: stacks above content on mobile.
- **Body**: name + address (street + "Port Aransas") + mono specs (N BR · N BA · Sleeps N) + first-3 amenities joined with `·`.
- **Price block** (right-aligned): either "Total · N nights / $X,XXX.XX / {rate period or 'All-in pricing · no fees'}" + mustard Reserve button, OR (if min-stay fails) "X-night minimum / {period label} / $X / night / disabled 'Adjust dates' button."

Form inputs wired for both `submit` and live `change` re-render — no submit click required for date/guest changes.

### 1e. Multi-step flow (7c): detail → review → confirmed
New state machine with `GUEST_STEPS = ['list', 'detail', 'review', 'confirmed']` and a `guestState` object (`step`, `propertyId`, `contact`, `reservationId`). `setGuestStep(name)` toggles `[data-guest-step]` containers via `hidden`, hides the search form on `confirmed`, scrolls to top.

**Detail step** — rendered by `renderGuestDetail(propertyId)`:
- Back-to-results button (mono small-caps with hover to accent)
- Large `.guest-detail-hero` placeholder (220px tall, accent blue + italic yellow serif centered)
- Header: EB Garamond 700 property name, mono address, mono specs
- Amenities section: 2-column `.guest-amenity-list` with accent-blue checkmarks
- "Your stay" detail rows (check-in, check-out, nights, channel)
- `.price-summary` card (cream bg, ink border) with full breakdown: `$rate × N nights`, cleaning, state HOT 6%, city HOT 9%, total (bolded). Rate-period badge at bottom if applicable ("Summer Peak · 7-night minimum")
- Big mustard CTA "Reserve this stay →" with 3px hard-edge shadow and lift-on-hover. Min-stay-fail state: red warning paragraph above a disabled "Adjust dates to continue" button.

**Review step** — rendered by `renderGuestReview()`:
- Back-to-property button
- "REVIEW & CONFIRM" eyebrow + "Almost there." EB Garamond headline + property address
- Price summary card (same breakdown as detail, with guests row added)
- Guest contact form: full-name / email / phone inputs, all required
- Cancellation policy + demo disclaimer paragraph ("Free cancellation up to 7 days before check-in. No payment is processed in this demo…")
- Mustard "Confirm reservation →" CTA

**Confirmed step** — rendered by `renderGuestConfirmed()`:
- Green checkmark circle (`--status-green` fill, 56×56px, white checkmark glyph)
- "Reservation confirmed" headline (EB Garamond 700 1.8rem)
- Mock reservation ID in mono: `BK-XXXXX` where XXXXX is `(hash(propertyId + checkIn + checkOut) % 90000 + 10000)`. Deterministic — same inputs produce same ID across refreshes.
- Reservation summary (property / check-in / check-out / nights / guests / total paid)
- Prose paragraph with user-entered email: "A confirmation email has been sent to **{email}**. You'll get keypad codes 24 hours before check-in."
- "Book another stay" CTA → resets state, returns to list.

**Click delegation** on `.view-pane[data-view="guest"]`: handles property-card clicks (→ detail), Reserve button (→ review), Confirm button (→ confirmed with form-value capture), back buttons, and Restart. Keyboard activation (Enter/Space) for property cards. Separate from manager + owner click listeners — no cross-contamination.

---

## 2. Decisions worth preserving

### 2a. Quick-reserve path from property card
Clicking the **Reserve button inside** a property card on the list page jumps directly to the review step (detail is rendered invisibly first, then review rendered immediately). Clicking **anywhere else** on the card opens the detail page first. Two legitimate intents — "I know I want this, skip the details" vs "let me see more." Both work; detail is never skipped data-wise, only visually.

### 2b. Single source of truth for dates is the top search form
Detail step doesn't duplicate date inputs. If the user wants different dates while viewing detail, they navigate back to results and adjust the search. Avoids two-form-state-sync complexity. Trade-off accepted: one extra click for date changes.

### 2c. Mock reservation ID is deterministic
Simple string-hash of `propertyId + checkIn + checkOut`, modulo 90000, offset by 10000 → 5-digit BK-XXXXX. Refresh with same inputs → same ID. In a real product this would be a server-generated UUID or sequence. For demo, determinism helps when the user hits back and re-confirms — no visual ID churn.

### 2d. No URL persistence for guest multi-step state
Manager view has `?panel=` + `?filter=`, owner view has `?panel=`, guest view's step machine lives in JS only. The four-step flow has too many transient combinations (step + propertyId + contact form state) to model cleanly in URL params for one session. Accepting: URL changes to guest view route to `list` step on every load. Future polish: persist `step` + `pid` at minimum.

### 2e. Hero placeholders use property name in italic yellow on accent blue
No actual photos. Same treatment as `.property-card-photo` (small) and `.guest-detail-hero` (large). Matches the favicon + sidebar h1 color palette. Keeps the demo self-contained (no external image assets).

### 2f. Sidebar content is genuinely view-specific
Three distinct sidebar treatments, all in the same `.sidebar` chrome (saturated blue, 2px ink right border):
- **Manager** → placeholder text (deferred — sub-views are session 8+ work)
- **Owner** → 5 nav links (all inert) + Sarah's contact info footer
- **Guest** → "Skip the platforms" italic yellow headline + 4-item checkmark list + bookings@ email

### 2g. `computeFinancials` reused via property-synthesis
Rather than adding a new guest-scoped pricing function to data.js (which is read-only this session), `computeGuestPrice` synthesizes a property object with the resolved nightly rate via `Object.assign({}, prop, { nightly_rate: rate.nightly_rate })` and feeds it to the existing `computeFinancials`. Zero data.js changes, full computational reuse. If `resolveRate` policy ever gets more complex (e.g., tiered discounts, last-minute deals), this indirection is the clean seam.

### 2h. Form validation is alert-based, not inline
The Confirm button does non-empty checks on name/email/phone and pops a browser `alert()` if any field is blank. Deliberately low-fidelity — real product would use inline error states. For demo, alert is honest ("form validation lives, but this isn't a real booking system").

### 2i. Free-cancellation + demo disclaimer inline on review
The review step explicitly says "No payment is processed in this demo — clicking confirm shows a mock confirmation page." Honest framing prevents confusion. Real product would remove the demo half but keep the cancellation policy line verbatim.

---

## 3. Files touched this session

| File | Change |
|---|---|
| `demos/portal.html` | `resolveRate` + `computeGuestPrice` helpers (~70 lines JS). Guest view CSS: hero, search form, sidebar pitch (~130 lines). Guest sidebar pane content (~20 lines markup). Guest view-pane header + search + 4 step containers (~60 lines markup). Property list CSS (`.property-list`, `.property-card*`) + render function (~200 lines total). Multi-step state machine + detail/review/confirmed render functions + click delegation (~280 lines JS). Detail/review/confirmed supporting CSS (~170 lines). **4211 lines final** (from 3146 at session 6 close — +1065 lines). |
| `CLAUDE.md` | Untouched. |
| `demos/data.js` | Untouched (read-only). DEMO_TODAY remains "2026-04-19" — the demo is time-frozen; all dates/prices/statements reference that fixed point. |
| `demos/rental.html` | Untouched (canonical reference). |
| `SESSION_7_HANDOFF.md` | This file. New. |

---

## 4. Internal consistency map (guest view)

| Guest view check | Value | Cross-reference |
|---|---|---|
| Default search: May 15 → May 22, 4 guests | 7 nights | exactly the Summer Peak min_stay — no adjust-dates required |
| Properties sleeping 4+ | 20 of 24 | only p4, p12, p16, p23 are sleeps<4 (all sleep 2-3); filtered out |
| Price ordering | ascending by guest_total | with min-stay failures demoted to bottom |
| Off-peak price for p1 | $210 × 7 + $120 cleaning + 15% tax | matches `computeFinancials(fakeRes, prop_with_base, ch4)` |
| Summer Peak override for p2 on June 15 | $495 × N nights | matches resolveRate for property-specific period |
| Mock reservation ID | `BK-` + 5 digits | deterministic hash; same property + dates = same ID |

---

## 5. The portal demo, at a glance

**Three role views, all interactive:**

| View | Entry point | Sections |
|---|---|---|
| **Manager** | `?view=manager` | Ops Strip (5 tiles, clickable filters) · Today's Operations timeline (10 events, clickable to reservation/maintenance/cleaning panels) · Properties Grid (24 rows, clickable to property + alert dot + channel pill sub-panels) · Channel Sync Status panel |
| **Owner** | `?view=owner` (Sarah Whitaker o1) | Portfolio (2×2 tile grid, clickable to property panels) · Recent statements (3 rows, clickable to statement panels with full financial breakdown) · Upcoming bookings (10 rows, clickable to reservation panels) · Open maintenance (1 card, clickable to maintenance panel) |
| **Guest** | `?view=guest` | Hero + search form · Property list (5 matches at default search) · Multi-step detail → review → confirmed flow with `resolveRate`-aware pricing |

**Reusable infrastructure:**
- Detail panel component (slide-in right, URL-persistent, ESC/backdrop close, click delegation)
- 6 entity templates in panels: reservation, property, maintenance, cleaning, channel, statement
- Filter chip + mustard pill convention
- `.status-pill` family (7 variants), `.channel-pill` family (4 states), `.alert-dot`, `.today-flag`
- Cross-entity navigation inside panels via `.panel-link`

---

## 6. Open polish items (not a locked session 8 scope)

Listed roughly in order of user-visible impact. Each is standalone — pick in any order.

1. **Deploy verification.** Push current state and confirm localpraxis.com/demos/portal.html serves correctly with data.js at the relative path. Nothing in the code should break on GitHub Pages, but worth eyeballing the live render.
2. **Owner sidebar sub-views.** Statements / Bookings / Maintenance / Documents links in Sarah's sidebar are inert. Wire each to a filtered/expanded sub-view of the existing data.
3. **Calendar view.** Referenced in SESSION_4_HANDOFF as a future consumer of the panel component. Timeline-style calendar with drag-to-create mock reservations (no persistence).
4. **Form field inline validation.** Guest contact form currently uses `alert()` on blank. Swap to inline error messages under each field.
5. **Dark mode toggle in UI.** `[data-theme="dark"]` works via dev-tools but no toggle is wired. Add a small moon/sun control in role-bar or sidebar footer.
6. **Rename `.mgr-header` to `.page-header`.** Cosmetic — class is used in all three views now, name is misleading. Low-urgency.
7. **URL persistence for guest steps.** Add `?gstep=` and `?gpid=` so users can share a specific-property-detail URL.
8. **Actual photos.** Replace `.property-card-photo` / `.guest-detail-hero` ascii-on-accent placeholders with real images if/when stock photography is sourced. Data model already has `photo_url` on each property.
9. **Statement detail: contributing reservations list.** Currently shows summary totals + adjustments + payout. Could also list each reservation that contributed to that period's gross. Feels natural, just takes the time.

---

## 7. Cumulative false-alarm log

- **Session 4 mid-run:** AppleDouble `._portal.html` resource fork on the "Jim's Extra" volume produced phantom `wc -l` and `grep` results pointing to a legacy file. Working file was never lost.
- **Session 5 push:** `git pull --rebase` failed with phantom local changes on portal.html and feed.xml due to the same xattr/AppleDouble issue. `git pull --no-rebase` (merge) sidestepped it.
- **Session 6 mid-run:** Edit tool reported "File has been modified since read" on a successfully-pasted block. Re-reading showed no actual changes. Workaround: re-Read then re-Edit.
- **Session 7:** No new false-alarms. The AppleDouble / xattr behavior on this volume stayed quiet.

**Mitigation for future sessions:** if any file-read tool returns unexpected results, cross-check against `ls -la` (look for `._*` siblings) before trusting the output. Prefer `git pull --no-rebase` on this volume. Run `dot_clean .` before git operations if needed.

---

## 8. Paste-ready prompt (for any future session picking up polish items)

```
You are resuming the Local Praxis vacation rental portal demo. Sessions
1-7 are complete — the demo is feature-complete. Any further work is
polish (see SESSION_7_HANDOFF.md section 6 for the open items list).

## What you're inheriting (DO NOT redo this)

- demos/data.js — 1131 lines, 14 collections. DEMO_TODAY = "2026-04-19"
  (time-frozen). Stable, do not modify.
- demos/portal.html — 4211 lines. All three views built, all interactive,
  all deep-linkable. Detail panel component reusable. 6 entity templates.
  resolveRate + computeGuestPrice helpers for seasonal pricing.
- CLAUDE.md — two-system design framing. portal.html uses product system.

## Source-of-truth reference

demos/rental.html. All product-system patterns used in portal.html derive
from it. If a new component is needed, check rental.html first.

## Markup + JS preservation rule (still active)

- All existing markup is load-bearing.
- View-switching IIFE, panel module, click delegation handlers, filter
  logic, resolveRate, multi-step guest state machine — all stay
  untouched. Add new logic alongside, don't modify in place unless
  explicitly scoping the modification.

## Picking a polish item

Choose from SESSION_7_HANDOFF.md section 6. Each item is standalone.
High-impact picks:
- Deploy verification (cheapest, highest signal)
- Owner sidebar sub-views (builds out Sarah's portal feeling)
- Dark mode toggle (small CSS + JS addition, big visible wow)

## Execution rules (unchanged)

- Output code only between checkpoints.
- Do not modify data.js or rental.html.
- Honor [data-theme="dark"] for every new rule.
- Honor prefers-reduced-motion (universal override is already in place).
- Flag bugs or ambiguity before coding around them.
- No new files unless the polish item requires it.

Confirm SESSION_7_HANDOFF.md is read, pick a polish item, and propose
the approach before writing code.
```
