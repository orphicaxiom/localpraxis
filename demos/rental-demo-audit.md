# Rental Demo Audit — Island Wheels

**Auditor perspective:** Golf cart rental shop owner, Port Aransas beach town, opening tomorrow.  
**File:** `rental.html` (~4,190 lines, single-file SPA)  
**Date:** April 11, 2026

---

## Dashboard

- **[HARDCODED]** "Fees Saved — $2,840 vs. third-party platforms" is a static number baked into `renderDashboard()` (line ~2749). There's no calculation behind it and no way to configure or hide this card. An operator who doesn't use third-party platforms will find this meaningless.
- **[HARDCODED]** `TODAY` is frozen to `2026-04-05` (line 2399). The entire app — dashboard stats, check-in/out queue, overdue flags, calendar "today" highlight — is pinned to that date. A real operator opening this tomorrow sees stale data.
- **[HARDCODED]** `weekRevenue` array (lines 2465–2473) is static seed data with no connection to actual reservation totals. The revenue chart will never update even as new reservations are created.
- **[HARDCODED]** `activityLog` (lines 2475–2490) is a static array. Creating new reservations, checking carts in/out, or cancelling reservations does not add entries. The "Today's Activity" timeline is frozen.
- **[DATA MODEL]** No concept of "today's actual revenue." Revenue on the dashboard is just a hardcoded number, not the sum of today's checked-in reservation totals.
- **[DATA MODEL]** The "Fleet at a Glance" tiles on the dashboard link to the Fleet view generically (`switchView('fleet')`) — they don't open the clicked cart's detail panel, so the tiles are less useful than they look.
- **[DEAD END]** Dashboard stat cards have `data-count` attributes suggesting count-up animations, but `animateCountUp()` (line 2616) just sets the value immediately — the animation was removed or never finished.
- **[WORKFLOW]** No way to configure which stats appear on the dashboard. An operator might want to see "Reservations this week" or "Upcoming pickups" instead of "Fees Saved."
- **[CRUD]** Cannot add or edit activity log entries. If an operator needs to note "IW-05 battery delivered" or "customer called about early return," there's nowhere to do it.

---

## Fleet

- **[CRUD]** Cannot add a new cart to the fleet. There is no "Add Cart" button anywhere. If the operator buys a 17th cart tomorrow, there's no way to register it.
- **[CRUD]** Cannot delete or retire a cart. If IW-05 is totaled and scrapped, it stays in the fleet forever.
- **[CRUD]** Cannot edit a cart's properties — name, passenger count, condition, mileage, GPS status, or notes — from the UI. The panel is read-only. The only mutations are "Mark Available" and "Tag Out for Maintenance."
- **[CRUD]** Cannot add a new vehicle type (e.g., a 2-passenger "beach buggy" or a 10-passenger "party cart"). Cart types are implicit from the `passengerCount` values in the seed data (4, 6, 8).
- **[HARDCODED]** Fleet subtitle says "16 carts across the fleet" (line 2244) — this is hardcoded HTML, not derived from `store.fleet.length`. Adding a cart to the store wouldn't update it.
- **[HARDCODED]** Image paths for cart cards are hardcoded to `../img/4cart.jpeg`, `../img/6cart.jpeg`, `../img/8cart.jpeg` (line 2497). No way to upload or change cart photos.
- **[DATA MODEL]** No purchase date, VIN, license plate, insurance, or registration info per cart. An operator needs this for compliance and tracking.
- **[DATA MODEL]** No maintenance history. Tagging a cart for maintenance creates no record — when it's marked available again, there's no log of what was done, when, or at what cost.
- **[DATA MODEL]** No damage tracking. If a cart comes back with a dent, there's nowhere to record the damage, associate it with a reservation, or track the repair status.
- **[DATA MODEL]** Mileage is a static number that never changes when carts go out or come back.
- **[WORKFLOW]** No scheduled maintenance. An operator can't say "IW-05 needs an oil change next Tuesday" — the only options are "available now" or "in maintenance now."
- **[WORKFLOW]** No way to set a cart's rates independently. `savePrice()` (line 3649) updates ALL carts of the same passenger count at once. If the operator wants IW-01 at a premium because it's brand new, that's impossible.
- **[WORKFLOW]** No battery charge tracking. For electric carts, knowing charge level determines whether you can rent it out for a full day.

---

## Calendar

- **[DEAD END]** Clicking an empty gantt cell calls `openNewReservation()` with the date pre-filled, which is good — but the calendar doesn't show which carts are available on that date before you click. You have to start the reservation wizard to find out.
- **[HARDCODED]** The heatmap is hardcoded to April 2026 only (line 3054: `var month = 3; // April`). There's no month navigation — you can't view March or May demand.
- **[WORKFLOW]** No way to block out dates. If the operator wants to close the shop for a holiday or block Spring Break at surge pricing, there's no mechanism for blackout dates or date-specific rate overrides.
- **[WORKFLOW]** No drag-to-create or drag-to-extend reservations on the gantt chart. The gantt is display-only (aside from clicking empty cells to start a new reservation).
- **[WORKFLOW]** No visual indicator of maintenance periods on the calendar. Carts in maintenance show no bar — they just look empty/available.
- **[DATA MODEL]** Calendar utilization row (`Util.`) counts reservations against a hardcoded denominator of 16 (line 3014). If a cart is in maintenance it still counts as available capacity, inflating apparent availability.

---

## Reservations

- **[CRUD]** Cannot edit an existing reservation. There's no "Edit" button in the reservation panel. If a customer calls to change their return date from Saturday to Sunday, or switch from a 4-passenger to a 6-passenger cart, there's no path. The only mutations are Check Out, Check In, and Cancel.
- **[CRUD]** Cannot delete a reservation. Cancelled reservations stay in the list forever with no archive or purge mechanism.
- **[CRUD]** Cannot reassign a cart. If IW-03 breaks down and you need to swap a customer to IW-06, you'd have to cancel and re-create the reservation.
- **[DEAD END]** The "Print Agreement," "Email Confirmation," and "Send Receipt" buttons in the reservation panel all trigger `showDemoModal()` — they show a placeholder message and do nothing.
- **[WORKFLOW]** No partial check-in flow. When checking in a return, there's no prompt for damage inspection, odometer reading, fuel/charge level, or cleaning status. It just flips the status to "completed" instantly.
- **[WORKFLOW]** No late fee calculation. When a cart is overdue, the overdue time is displayed but there's no mechanism to charge the customer extra. The total remains the originally quoted amount.
- **[WORKFLOW]** No payment collection flow. Reservations with `depositStatus: 'pending'` have no way to be marked as paid outside of the automatic flip during checkout.
- **[WORKFLOW]** No refund flow. Cancelling a reservation sets `depositStatus: 'refunded'` automatically — no partial refund, no refund reason, no operator choice.
- **[WORKFLOW]** No way to add notes or internal comments to a reservation (e.g., "customer requested early delivery" or "paid cash at pickup").
- **[WORKFLOW]** New reservation modal has no promo code field. Promo codes can only be applied through the (non-functional) guest booking flow. An operator taking a phone reservation with a promo code can't enter it.
- **[WORKFLOW]** No way to search reservations by date range, only by customer name or cart name.
- **[DATA MODEL]** No concept of reservation source tracking beyond the initial `source` field. No UTM tracking, no referral tracking.
- **[DATA MODEL]** Customer data is embedded directly in each reservation object — there's no standalone customer entity. The same customer can book multiple times and appear as separate unlinked records each time.
- **[DATA MODEL]** `newRes.id` is generated as `store.reservations.length + 1` (line 3489), which breaks if reservations are ever deleted — you'd get duplicate IDs.

---

## Check-in / Out

- **[HARDCODED]** "Now" is hardcoded to 2 PM (`var now = 14;` at line 3568) for overdue duration calculation. On a real day, this wouldn't track actual time.
- **[WORKFLOW]** No damage inspection step during check-in. Cart comes back → one click → done. No photo upload, no condition notes, no odometer reading, no charge level check.
- **[WORKFLOW]** No waiver signing workflow. The status shows "Waiver signed" or "Waiver pending" but there's no way to send a waiver, have it signed, or mark it as signed — it flips automatically during checkout.
- **[WORKFLOW]** No deposit collection. Same as waivers — deposit status flips automatically, no actual payment capture.
- **[WORKFLOW]** Only shows today's pickups and returns. No way to see tomorrow's schedule or plan ahead for a busy weekend.
- **[WORKFLOW]** No delivery dispatch view. Reservations with delivery addresses show up identically to shop pickups — there's no route planning, driver assignment, or delivery time tracking.
- **[DEAD END]** Check-in/out items are not clickable to open the reservation detail panel. You can only click the "Check Out" or "Check In" button — no way to review reservation details from this view without navigating to Reservations.

---

## Pricing

- **[CRUD]** Cannot add a new pricing tier (e.g., "3-Day" or "Monthly"). The rate structure is fixed to Hourly / Daily / 2-Day / Weekly. If the operator wants a "Weekend Special" rate or an "Hourly minimum 2 hours" rate, there's nowhere to create it.
- **[CRUD]** Cannot add new fee types. The fees section is hardcoded to Delivery Fee, Tax Rate, and Damage Deposit. An operator who charges for insurance, underage driver surcharge, or after-hours pickup can't add those.
- **[HARDCODED]** Operating hours are in `store.settings.operatingHours` (line 2452) — `{open:'07:00', close:'20:00'}` — but there's no UI to view or edit them. They aren't displayed on the Pricing page or anywhere else in the admin.
- **[HARDCODED]** Deposit percentage (`depositPct: 50`) is in settings but not editable from the Pricing page — only delivery fee, tax rate, and damage deposit are shown.
- **[HARDCODED]** The "Last updated: April 5, 2026" footer (line 3636) is a static string, not a tracked timestamp.
- **[WORKFLOW]** No seasonal or dynamic pricing. Can't set higher rates for Spring Break, July 4th weekend, or peak season. One rate per cart type, period.
- **[WORKFLOW]** No price history. Changing a rate overwrites the previous value with no record of what it was.
- **[WORKFLOW]** Price changes are applied to all carts of a type simultaneously (line 3651) — can't set per-cart pricing. If one 4-passenger cart is newer/nicer, it can't be priced higher.
- **[DATA MODEL]** No concept of rate schedules tied to date ranges.
- **[DATA MODEL]** No minimum rental duration enforcement. An operator can't require a 2-hour minimum for hourly rentals.

---

## Promotions

- **[CRUD]** Can create new promotions (this works well). Can toggle active/inactive. **Cannot edit** an existing promotion. If the operator needs to extend an end date, change the discount amount, or increase max uses, there's no edit flow — you'd have to create a new one.
- **[CRUD]** Cannot delete a promotion. Old/expired promotions accumulate with no archive mechanism.
- **[WORKFLOW]** No promo code validation for duplicates. The operator can create two promotions with the same code — `calculateTotal()` uses `find()` which returns the first match, so the second one would be silently ignored.
- **[WORKFLOW]** No way to associate a promo with minimum rental duration (e.g., "10% off rentals 3+ days").
- **[WORKFLOW]** No way to restrict a promo to specific dates within the rental period (e.g., "only valid for pickups Mon–Thu").
- **[WORKFLOW]** No reporting on promotion performance — which promos drove the most revenue, what's the average discount per reservation.
- **[DATA MODEL]** No customer-specific promos (e.g., loyalty discount for repeat customers, referral codes).
- **[DATA MODEL]** Promo `timesUsed` is never incremented when a reservation uses a promo code. The counts in seed data are static.

---

## Booking Widget

- **[DEAD END]** The "Book Now" button in the widget preview does nothing. It's a static `<button>` with no onclick handler (line 3847).
- **[DEAD END]** The embed code section shows a fake script tag (`islandwheels.localpraxis.com/widget.js`) that doesn't exist. The "Copy Code" button works (copies to clipboard) but the code itself is non-functional.
- **[DEAD END]** Cart type dropdown and date inputs in the widget preview are non-functional — they don't update the estimated total or connect to any logic.
- **[HARDCODED]** Estimated total in the widget preview is a static "$81" (line 3843) that never recalculates.
- **[HARDCODED]** Delivery fee in the widget is hardcoded as "+$35" in the radio label (line 3839) rather than reading from `store.settings.deliveryFee`.
- **[WORKFLOW]** No way to customize the widget's appearance, colors, fonts, or which fields to show. The `primaryColor` in the embed code suggests customization but none exists.
- **[WORKFLOW]** No way to set which cart types appear in the widget or restrict availability.

---

## Customer-Facing Booking Flow (Guest View)

- **[CUSTOMER UX]** No availability check. The guest picks dates and a cart type, but there's no feedback on whether that type is actually available for those dates. They could book a cart that's already reserved.
- **[CUSTOMER UX]** The "Complete Reservation" button (`guestBookConfirm()`, line 4086) doesn't actually create a reservation in the store. It just shows a success animation. No data is saved. If the operator checks Reservations after a guest "books," nothing is there.
- **[CUSTOMER UX]** No promo code field in the guest booking form. The guest has no way to enter ISLAND10, SPRING15, or any other active promotion.
- **[CUSTOMER UX]** No email or phone validation. The form accepts empty fields — `guestBookConfirm()` doesn't check any inputs before showing the success screen.
- **[CUSTOMER UX]** No confirmation number or email. The success screen says "You will receive a confirmation email shortly" but no email is sent and no confirmation number is generated.
- **[CUSTOMER UX]** Price calculation in guest detail (`updateGuestPrice()`, line 4066) uses simple `days * daily` math, ignoring the tiered pricing (2-day, weekly rates) that the admin side uses via `calculateTotal()`. A 7-day rental shows $525 for a 4-passenger cart on the guest side but should be $420 (weekly rate).
- **[CUSTOMER UX]** No cancellation path. A guest who booked has no way to cancel, modify, or even look up their reservation.
- **[CUSTOMER UX]** Reviews are hardcoded (lines 3959–3963) — same three reviews appear for every cart type ("Sarah M.", "Mike T.", "Jennifer L."). No way to manage, add, or remove reviews.
- **[CUSTOMER UX]** No payment integration. The booking flow collects contact info and says "Complete Reservation" but takes no payment, no deposit, no card on file.
- **[CUSTOMER UX]** Cart type features are hardcoded in `renderGuestDetail()` (lines 3950–3953) separately from the fleet data. If an operator changes a feature, they'd have to find and edit it in two places.
- **[CUSTOMER UX]** Policy text (rental policies, cancellation, delivery info) is hardcoded in the accordion bodies (lines 4002–4011). An operator can't edit these.
- **[CUSTOMER UX]** The booking form is below the fold — a guest must scroll past specs, features, three policy accordions, and three reviews before they see the reservation form.
- **[HARDCODED]** Business name "Island Wheels" and "Port Aransas, TX" are hardcoded throughout the HTML and JS, not configurable.
- **[HARDCODED]** The hero text "Cruise the Island in Style" and subheading are hardcoded (line 3919).
- **[HARDCODED]** Cart type labels ("4-Passenger Standard", "6-Passenger Deluxe", "8-Passenger Premium") are hardcoded in at least three separate places: the guest list view (line 3912), the guest detail view (line 3950), and the widget preview (lines 3820–3822).
- **[DATA MODEL]** No customer account system. Repeat customers start from scratch every time. No booking history, no saved preferences, no loyalty tracking.

---

## Cross-Cutting Issues

- **[DATA MODEL]** All data lives in a JavaScript `store` object in memory. Refreshing the page resets everything to the seed data. No persistence layer, no database, no localStorage save (except dark mode preference).
- **[DATA MODEL]** No user authentication or role system. Anyone with the URL has full admin access. No operator login, no employee accounts, no permission levels.
- **[DATA MODEL]** No customer database. Customer info is embedded in reservations. No way to look up a customer, see their rental history, or contact them outside of a specific reservation.
- **[DATA MODEL]** No revenue or financial reporting beyond the static weekly bar chart. No monthly totals, no YTD, no profit/loss, no tax collected report, no deposit liability tracking.
- **[DATA MODEL]** No audit trail. Status changes (check-out, check-in, cancellation, price changes) leave no log of who did what and when.
- **[HARDCODED]** Business identity ("Island Wheels", "Port Aransas, TX", tagline, contact info) is scattered through the HTML with no settings page. An operator can't change their business name, phone number, or address without editing source code.
- **[HARDCODED]** No way to set or display business contact info (phone, address, email) anywhere in the admin or customer-facing views.
- **[WORKFLOW]** No notification system. No alerts for overdue carts, new bookings, upcoming returns, or low availability.
- **[WORKFLOW]** No export/import. Can't export reservations to CSV, can't print a daily manifest, can't export financial data for accounting.
- **[WORKFLOW]** No multi-day view for operations planning. Can't see "what does Saturday look like" from the check-in/out view.
- **[WORKFLOW]** No integration points — no payment processor, no email service, no SMS, no accounting software, no channel manager for listing on third-party sites.
