# Domain Model — Island Wheels Rental System

The canonical entity-relationship model that should exist underneath the rental demo. This is the real system architecture — the UI is just a view layer on top of it.

This document also serves as a pattern for every Local Praxis demo. The mistake in the current demos is building screens first and backfilling data. This inverts it: **define the domain, then render it.**

---

## Architectural Principles (All LP Demos)

### 1. Entities are real. Screens are projections.

Every noun the operator would say out loud — "that cart," "the Whitaker reservation," "our Spring Break promo" — is an entity with its own lifecycle. It gets created, it gets read, it gets updated, it gets archived. If the UI shows data that the operator can't touch, the ontology is broken.

### 2. Relationships are explicit, not embedded.

A Reservation references a Customer by ID. It doesn't contain a copy of the customer's name and phone number. When the customer corrects their email, it corrects everywhere. When you look up a customer, you see all their reservations. This is basic normalization and the current demos violate it everywhere.

### 3. Every mutation is an event.

When a cart goes from "available" to "rented," that's not a status flip — it's a **CheckOutEvent** with a timestamp, an actor (which employee did it), and a reservation reference. The current state is derived from the event history. This gives you an audit trail for free and makes undo/dispute resolution possible.

### 4. Settings are entities, not constants.

Business name, tax rate, operating hours, policy text — these are rows in a Settings table, not hardcoded strings. Every value the operator might want to change lives in the data layer, never in the template.

### 5. Time is real.

`new Date()` — not `const TODAY = '2026-04-05'`. Overdue calculations, "today's schedule," and revenue windows all derive from actual clock time. For demo purposes, you can offer a "time travel" control that shifts the reference date, but the system's relationship to time must be dynamic.

---

## Entity Definitions

### Shop

The business itself. Singleton in a single-tenant deployment; one row per tenant in multi-tenant.

```
Shop
├── id                    : uuid
├── name                  : string       — "Island Wheels"
├── tagline               : string       — "Port Aransas, TX"
├── phone                 : string
├── email                 : string
├── address               : text
├── website               : string
├── logoUrl               : string
├── timezone              : string       — "America/Chicago"
├── currency              : string       — "USD"
├── operatingHours        : json         — { mon: {open:"07:00", close:"20:00"}, ... }
├── seasonalHoursOverrides: json[]       — [{startDate, endDate, hours}]
├── closedDates           : date[]       — holidays, weather closures
├── taxRate               : decimal      — 0.0825
├── depositPercent        : integer      — 50
├── deliveryFee           : decimal      — 35.00
├── deliveryRadius        : string       — "Port Aransas island"
├── damageDeposit         : decimal      — 200.00
├── lateFeePerHour        : decimal      — 15.00
├── cancellationPolicy    : text         — full text, operator-editable
├── rentalPolicy          : text
├── deliveryPolicy        : text
├── waiverTemplate        : text         — the legal text of the waiver
├── minimumRentalAge      : integer      — 21
├── minimumRentalHours    : integer      — 2
├── createdAt             : timestamp
├── updatedAt             : timestamp
```

**Why this matters:** Right now "Island Wheels," "Port Aransas, TX," the $35 delivery fee, the 8.25% tax rate, and every line of policy text are scattered across the HTML and JS in at least a dozen places. One entity. One source of truth. The UI reads from it.

---

### VehicleType

The *category* of vehicle. Currently implicit from `passengerCount`. Needs to be its own entity so operators can add new types, name them, set features per type, and attach marketing copy.

```
VehicleType
├── id                : uuid
├── shopId            : uuid → Shop
├── name              : string       — "4-Passenger Standard"
├── slug              : string       — "4-pass-standard"
├── passengerCount    : integer      — 4
├── description       : text         — marketing description for guest view
├── features          : string[]     — ["Weather canopy", "GPS tracking", ...]
├── maxSpeed          : string       — "15 mph"
├── range             : string       — "25 miles"
├── imageUrl          : string       — cart photo for cards
├── posterUrl         : string       — hero image for detail view
├── sortOrder         : integer      — controls display ordering
├── isActive          : boolean      — hide from booking without deleting
├── createdAt         : timestamp
├── updatedAt         : timestamp
```

**Relationship:** One VehicleType → many Vehicles. One VehicleType → many PricingRules.

**What this fixes:** Cart type features are currently hardcoded in three separate places (guest list, guest detail, widget). The "add a new cart type" gap. The inability to reorder or hide types.

---

### Vehicle

An individual physical cart in the fleet.

```
Vehicle
├── id                : uuid
├── shopId            : uuid → Shop
├── vehicleTypeId     : uuid → VehicleType
├── unitNumber        : string       — "IW-01" (operator-assigned, unique per shop)
├── vin               : string       — nullable, for registration
├── licensePlate      : string       — nullable
├── year              : integer
├── make              : string       — "Club Car"
├── model             : string       — "Onward 4"
├── color             : string
├── status            : enum         — available | rented | reserved | maintenance | retired
├── condition         : enum         — excellent | good | fair | poor
├── odometerMiles     : decimal      — updated at each check-in
├── batteryLevel      : integer      — nullable, 0-100
├── gpsDeviceId       : string       — nullable
├── gpsStatus         : enum         — active | offline | no_device
├── purchaseDate      : date
├── purchasePrice     : decimal
├── insuranceExpiry   : date
├── registrationExpiry: date
├── notes             : text         — free-form operator notes
├── imageOverrideUrl  : string       — nullable; if set, overrides VehicleType image
├── isActive          : boolean      — soft delete
├── createdAt         : timestamp
├── updatedAt         : timestamp
```

**Why `status` is derived, not stored (advanced):** In the ideal architecture, Vehicle.status is computed from the current state of its reservations and maintenance records. A Vehicle is "rented" because an active CheckOutEvent exists with no corresponding CheckInEvent. It's "maintenance" because an open MaintenanceRecord exists. It's "reserved" because a confirmed Reservation starts within the pickup window. The stored `status` field is a denormalized cache for query performance, recomputed on every state change. The current demo treats status as the source of truth, which is why toggling it doesn't create any history.

**What this fixes:** Can't add/edit/delete carts. No VIN/plate/insurance. No per-cart image. No retirement/soft-delete. Mileage never updates. No battery tracking.

---

### Customer

A person who rents carts. Exists independently of any reservation.

```
Customer
├── id                : uuid
├── shopId            : uuid → Shop
├── firstName         : string
├── lastName          : string
├── email             : string       — unique per shop
├── phone             : string
├── driversLicense    : string       — nullable, for waiver
├── dateOfBirth       : date         — nullable, for age verification
├── address           : text         — nullable
├── source            : enum         — online | phone | walk_up | referral
├── referralSource    : string       — nullable, free text or UTM
├── notes             : text         — "always asks for delivery," "VIP," etc.
├── tags              : string[]     — ["repeat", "local", "VIP"]
├── totalRentals      : integer      — denormalized count
├── totalSpend        : decimal      — denormalized sum
├── firstRentalDate   : date
├── lastRentalDate    : date
├── createdAt         : timestamp
├── updatedAt         : timestamp
```

**Relationship:** One Customer → many Reservations.

**What this fixes:** Currently customer data is embedded inside each reservation. Same person books three times = three unlinked name/phone/email entries. No customer lookup, no repeat customer recognition, no rental history per person, no loyalty tracking.

---

### PricingRule

Rate configuration tied to a VehicleType and optionally a date range. This replaces the flat `rates` object on each cart.

```
PricingRule
├── id                : uuid
├── shopId            : uuid → Shop
├── vehicleTypeId     : uuid → VehicleType
├── name              : string       — "Standard Rates" or "Spring Break 2026"
├── durationType      : enum         — hourly | daily | two_day | three_day | weekly | monthly | custom
├── durationValue     : integer      — nullable; for custom: number of days
├── price             : decimal
├── effectiveStart    : date         — nullable = always effective
├── effectiveEnd      : date         — nullable = no expiry
├── dayOfWeekRestriction : integer[] — nullable; [5,6] = Fri/Sat only
├── priority          : integer      — higher priority rules override lower
├── isActive          : boolean
├── createdAt         : timestamp
├── updatedAt         : timestamp
```

**How pricing resolution works:** When calculating a rental quote, the system finds all active PricingRules for the VehicleType whose effective dates overlap the rental period. Higher-priority rules override lower ones. This gives you seasonal pricing, weekend surcharges, and custom tiers — all without code changes.

**What this fixes:** One flat rate per cart type forever. No seasonal pricing. No weekend rates. Can't add new duration tiers (3-day, monthly). Can't do date-specific rate overrides for holidays. Price changes have no history.

---

### Promotion

Mostly exists already, but needs a few additions.

```
Promotion
├── id                : uuid
├── shopId            : uuid → Shop
├── name              : string
├── code              : string       — unique per shop, uppercase
├── discountType      : enum         — percent | flat
├── amount            : decimal
├── vehicleTypeIds    : uuid[]       — which types it applies to; empty = all
├── minimumDays       : integer      — nullable; e.g., "only for 3+ day rentals"
├── minimumSpend      : decimal      — nullable
├── validStart        : date
├── validEnd          : date
├── dayOfWeekRestriction : integer[] — nullable; pickup must be on these days
├── maxUses           : integer      — nullable = unlimited
├── maxUsesPerCustomer: integer      — nullable = unlimited
├── timesUsed         : integer      — incremented on each reservation that uses it
├── isActive          : boolean
├── createdAt         : timestamp
├── updatedAt         : timestamp
```

**What this fixes:** Can't edit promos. No minimum duration or spend requirements. No per-customer usage limits. `timesUsed` never increments. Duplicate codes aren't caught.

---

### Reservation

The core transaction entity. Connects a Customer to a Vehicle over a time period.

```
Reservation
├── id                : uuid
├── shopId            : uuid → Shop
├── confirmationCode  : string       — human-readable, e.g., "IW-2026-0042"
├── customerId        : uuid → Customer
├── vehicleId         : uuid → Vehicle        — nullable until assigned
├── vehicleTypeId     : uuid → VehicleType    — always set; vehicle can be swapped
├── status            : enum         — pending | confirmed | checked_out | checked_in | completed | cancelled | no_show
├── source            : enum         — online | phone | walk_up | admin | widget
│
├── pickupDate        : date
├── pickupTime        : time
├── returnDate        : date
├── returnTime        : time
├── actualPickupAt    : timestamp    — set on checkout
├── actualReturnAt    : timestamp    — set on checkin
│
├── isDelivery        : boolean
├── deliveryAddress   : text         — nullable
├── deliveryNotes     : text         — "gate code 4521," "call on arrival"
│
├── promotionId       : uuid → Promotion     — nullable
├── discountAmount    : decimal      — snapshot at time of booking
│
├── subtotal          : decimal
├── deliveryFee       : decimal
├── taxAmount         : decimal
├── lateFees          : decimal      — added at check-in if overdue
├── damageCharges     : decimal      — added if damage found
├── totalAmount       : decimal
│
├── depositRequired   : decimal
├── depositStatus     : enum         — pending | paid | partially_paid | refunded | forfeited
├── paymentStatus     : enum         — pending | partial | paid | refunded
├── paymentMethod     : enum         — card | cash | invoice | comp
│
├── waiverStatus      : enum         — pending | sent | signed | waived
├── waiverSignedAt    : timestamp
│
├── internalNotes     : text         — operator-only notes
├── customerNotes     : text         — special requests from the customer
│
├── cancelledAt       : timestamp
├── cancellationReason: text
├── cancelledBy       : enum         — customer | operator | system
│
├── createdAt         : timestamp
├── updatedAt         : timestamp
├── createdBy         : uuid → User  — which staff member created it
```

**Key design decisions:**

- `vehicleTypeId` is always set; `vehicleId` can be null. This lets a customer book a "6-passenger" without locking a specific cart until closer to pickup. The operator assigns the specific cart at checkout or beforehand.
- `discountAmount` is snapshotted at booking time. If the promo changes later, existing reservations aren't affected.
- `lateFees` and `damageCharges` are separate line items added during check-in, not baked into the base total.
- `confirmationCode` is a human-readable string the customer can reference by phone or email, not an auto-increment integer.

**What this fixes:** Can't edit reservations. Can't swap carts. Can't add notes. No confirmation code. No late fees. No damage charges. No actual pickup/return timestamps. No cancellation reason. No payment tracking beyond a single status. No way to apply promo codes from admin side. Customer data embedded instead of referenced.

---

### Transaction

Financial events against a reservation. Separating this from the Reservation lets you handle split payments, partial refunds, deposits, and damage charges cleanly.

```
Transaction
├── id                : uuid
├── shopId            : uuid → Shop
├── reservationId     : uuid → Reservation
├── customerId        : uuid → Customer
├── type              : enum         — deposit | payment | refund | late_fee | damage_charge | adjustment
├── amount            : decimal      — positive = money in, negative = money out
├── method            : enum         — card | cash | check | comp | system
├── referenceNumber   : string       — nullable; card last-4, check number, etc.
├── note              : text         — "partial refund — customer returned 2 hours early"
├── processedBy       : uuid → User
├── processedAt       : timestamp
├── createdAt         : timestamp
```

**What this fixes:** No financial trail at all. Cancellation auto-refunds with no record. No partial payments. No way to charge a late fee or damage fee. No deposit collection step. No revenue reporting data source.

---

### MaintenanceRecord

Tracks work done on vehicles.

```
MaintenanceRecord
├── id                : uuid
├── shopId            : uuid → Shop
├── vehicleId         : uuid → Vehicle
├── type              : enum         — scheduled | unscheduled | damage_repair | inspection
├── status            : enum         — scheduled | in_progress | completed | cancelled
├── description       : text         — "Battery replacement"
├── scheduledDate     : date         — when it should happen
├── startedAt         : timestamp    — when work began
├── completedAt       : timestamp
├── cost              : decimal      — parts + labor
├── vendor            : string       — nullable; "Port A Golf Cart Service"
├── odometerAtService : decimal
├── notes             : text
├── createdBy         : uuid → User
├── createdAt         : timestamp
├── updatedAt         : timestamp
```

**What this fixes:** "Tag Out for Maintenance" creates no record. No maintenance history. No scheduled maintenance. No cost tracking. No way to know when IW-05's battery was last replaced.

---

### DamageReport

Linked to a specific vehicle and optionally to the reservation during which damage occurred.

```
DamageReport
├── id                : uuid
├── shopId            : uuid → Shop
├── vehicleId         : uuid → Vehicle
├── reservationId     : uuid → Reservation   — nullable (damage found outside rental)
├── reportedAt        : timestamp
├── reportedBy        : uuid → User
├── description       : text
├── severity          : enum         — cosmetic | functional | safety | totaled
├── photoUrls         : string[]
├── repairStatus      : enum         — reported | assessing | repairing | repaired | write_off
├── repairCost        : decimal      — nullable until assessed
├── customerCharged   : decimal      — how much the renter was billed
├── maintenanceRecordId : uuid → MaintenanceRecord  — linked repair job
├── notes             : text
├── createdAt         : timestamp
├── updatedAt         : timestamp
```

**What this fixes:** Cart comes back damaged → nowhere to record it, link it to the renter, track repair, or bill the customer.

---

### Waiver

The legal agreement a customer signs before pickup.

```
Waiver
├── id                : uuid
├── shopId            : uuid → Shop
├── reservationId     : uuid → Reservation
├── customerId        : uuid → Customer
├── templateVersion   : string       — which version of the waiver text
├── sentAt            : timestamp    — when the waiver link was emailed
├── signedAt          : timestamp
├── signatureData     : text         — base64 sig image or e-sign token
├── ipAddress         : string       — for legal compliance
├── driversLicense    : string       — recorded at signing
├── createdAt         : timestamp
```

**What this fixes:** Waiver status currently flips automatically with no actual signing flow, no document, no legal trail.

---

### CheckEvent

Every check-out and check-in is an event, not a status toggle. This is the audit trail.

```
CheckEvent
├── id                : uuid
├── shopId            : uuid → Shop
├── reservationId     : uuid → Reservation
├── vehicleId         : uuid → Vehicle
├── type              : enum         — check_out | check_in
├── performedBy       : uuid → User
├── performedAt       : timestamp
│
│   — Check-out fields
├── odometerOut       : decimal
├── batteryLevelOut   : integer
├── conditionOut      : enum         — excellent | good | fair | poor
├── conditionNotesOut : text
├── photoUrlsOut      : string[]     — pre-rental condition photos
│
│   — Check-in fields (null on check-out events)
├── odometerIn        : decimal
├── batteryLevelIn    : integer
├── conditionIn       : enum
├── conditionNotesIn  : text
├── photoUrlsIn       : string[]     — post-rental condition photos
├── damageFound       : boolean
├── cleaningNeeded    : boolean
├── chargeNeeded      : boolean      — battery needs charging before next rental
│
├── createdAt         : timestamp
```

**What this fixes:** Check-in/out is a single button click with no inspection. No odometer delta, no condition comparison, no damage catch, no photo evidence, no record of who performed the action.

---

### User

Staff members who operate the system.

```
User
├── id                : uuid
├── shopId            : uuid → Shop
├── email             : string
├── name              : string
├── role              : enum         — owner | manager | staff
├── pin               : string       — for quick POS-style auth
├── isActive          : boolean
├── lastLoginAt       : timestamp
├── createdAt         : timestamp
├── updatedAt         : timestamp
```

**What this fixes:** No auth, no audit trail ("who cancelled this reservation?"), no role-based access.

---

### AuditEntry

Immutable log of every mutation in the system.

```
AuditEntry
├── id                : uuid
├── shopId            : uuid → Shop
├── entityType        : string       — "Reservation", "Vehicle", "PricingRule", etc.
├── entityId          : uuid
├── action            : enum         — create | update | delete | status_change
├── fieldChanged      : string       — nullable; "status", "returnDate", etc.
├── oldValue          : text         — JSON of previous value
├── newValue          : text         — JSON of new value
├── performedBy       : uuid → User  — nullable (system actions)
├── performedAt       : timestamp
├── ipAddress         : string
├── note              : text         — nullable; "customer called to extend"
```

**What this fixes:** No audit trail anywhere. Price changes, cancellations, status flips — nothing is logged.

---

### Review

Customer reviews, managed by the operator.

```
Review
├── id                : uuid
├── shopId            : uuid → Shop
├── vehicleTypeId     : uuid → VehicleType   — nullable (general review)
├── customerId        : uuid → Customer      — nullable (imported reviews)
├── reservationId     : uuid → Reservation   — nullable
├── rating            : integer      — 1-5
├── text              : text
├── authorName        : string       — display name
├── source            : enum         — internal | google | yelp | imported
├── isPublished       : boolean      — operator approves before showing
├── createdAt         : timestamp
├── updatedAt         : timestamp
```

**What this fixes:** Three hardcoded reviews shown for every cart type. No way to manage, add, remove, or associate reviews with types.

---

## Relationship Map

```
Shop
 ├── has many → VehicleType
 │                ├── has many → Vehicle
 │                ├── has many → PricingRule
 │                └── has many → Review
 ├── has many → Customer
 │                └── has many → Reservation
 │                                 ├── has one  → Vehicle (assigned)
 │                                 ├── has one  → VehicleType (requested)
 │                                 ├── has one  → Promotion (applied)
 │                                 ├── has many → Transaction
 │                                 ├── has many → CheckEvent
 │                                 ├── has one  → Waiver
 │                                 ├── has many → DamageReport
 │                                 └── has many → AuditEntry
 ├── has many → Promotion
 ├── has many → User
 └── has many → AuditEntry
```

---

## What the Current Demo's `store` Should Become

Here's the mapping from the current flat `store` object to the new entity model:

| Current `store` field | Becomes |
|---|---|
| `store.fleet[].rates` | PricingRule entities linked to VehicleType |
| `store.fleet[].currentRenter` | Derived from active Reservation → Customer.lastName |
| `store.fleet[].currentResId` | Derived from active Reservation where status = checked_out |
| `store.fleet[].returnTime` | Derived from active Reservation.returnTime |
| `store.reservations[].customer` | Customer entity (referenced by customerId) |
| `store.settings.taxRate` | Shop.taxRate |
| `store.settings.deliveryFee` | Shop.deliveryFee |
| `store.settings.depositPct` | Shop.depositPercent |
| `store.settings.damageDeposit` | Shop.damageDeposit |
| `store.settings.operatingHours` | Shop.operatingHours |
| `store.weekRevenue` | Derived: `SELECT date, SUM(amount) FROM Transaction WHERE type IN ('payment','deposit') GROUP BY date` |
| `store.activityLog` | Derived: recent CheckEvents + Reservations with status changes |
| `store.promotions[].timesUsed` | `SELECT COUNT(*) FROM Reservation WHERE promotionId = ?` |

**Revenue, activity logs, and utilization are always derived, never stored as seed data.**

---

## Pattern for All LP Demos

This same structural decomposition applies to every demo:

1. **Identify every noun** the operator says. Those are your entities.
2. **Define the lifecycle** of each entity. What states can it be in? What transitions are valid?
3. **Make relationships explicit.** If entity A references entity B, that's a foreign key, not an embedded copy.
4. **Every mutation is an event** with a timestamp and an actor.
5. **Every "setting" is a row** in a settings entity, not a constant in JS.
6. **Every derived value is computed**, not stored. Revenue = sum of transactions. Utilization = count of active reservations / count of active vehicles. Overdue = now > reservation.returnTime AND status = checked_out.
7. **Build CRUD for every entity** before building any view. If the view shows data, the operator can create, read, update, and archive that data.
8. **Time is `new Date()`.** Always.

---

## Beyond the Data Model: Systems the Schema Enables But Doesn't Define

The entities above are the foundation. These are the **systems** that sit on top of them — not entities themselves, but capabilities the data model must support.

### Notification System

Not an entity — a service layer. Triggers on state transitions:

- Reservation created → email confirmation with confirmationCode to customer
- 24 hours before pickup → SMS/email reminder to customer
- Check-out completed → receipt email
- Cart overdue → alert to operator (dashboard badge, push notification, SMS)
- Maintenance scheduled → reminder to operator the day before
- Waiver unsigned 12 hours before pickup → nudge email to customer
- Low availability (< 2 carts of a type free tomorrow) → operator alert

**What this needs from the schema:** Every entity has timestamps and status enums. The notification system watches for transitions (Reservation.status changed to 'confirmed', CheckEvent.type = 'check_out' created, etc.) and fires the appropriate message.

### Payment Processing Layer

Not modeled as an entity because the payment processor is external (Stripe, Square, etc.), but the Transaction entity is designed to record every financial event that comes back from it:

- Guest books online → payment processor charges deposit → Transaction(type: deposit) created
- Operator collects balance at pickup → Transaction(type: payment) created
- Cart returned with damage → Transaction(type: damage_charge) created
- Cancellation within policy → Transaction(type: refund, amount: -deposit) created

The schema handles the bookkeeping. The payment processor handles the money movement.

### Booking Widget / Embed System

The widget is a stripped-down, embeddable UI that reads from the same entity model:

- Reads VehicleType (active ones, with images and features)
- Reads PricingRule (to calculate quotes)
- Reads Reservation (to compute availability by date)
- Reads Shop (for business name, hours, policies, delivery fee)
- Reads Promotion (to validate promo codes)
- Writes Reservation (status: pending) and Customer on submit

Widget configuration (colors, which fields to show, which types to display) belongs in a `WidgetConfig` JSON field on the Shop entity.

### Customer Account System

Optional but valuable for repeat business:

- Customer can look up reservations by email + confirmationCode
- Customer can cancel within policy window
- Customer can rebook a previous rental type
- No full "account" needed — email + confirmation code is sufficient for a beach rental shop

### Delivery Dispatch

Built on existing entities:

- Filter Reservations where `isDelivery = true` AND `pickupDate = today`
- Group by time window
- Show delivery address, customer phone, deliveryNotes
- Assign driver (User with role = staff)
- Track delivery status as a CheckEvent with additional fields

### Export / Reporting

Derived from Transaction, Reservation, and CheckEvent:

- Daily manifest: all pickups and returns for a given date
- Revenue report: sum Transactions by date range, grouped by type
- Tax collected: sum Transaction where type = payment, multiply by taxRate
- Utilization: for each date, count Reservations with overlapping date ranges / count active Vehicles
- Customer report: Customers sorted by totalSpend or totalRentals
- Fleet report: Vehicles with maintenance cost, damage history, rental count

All of these are read queries against the existing schema. No new entities needed — just views.

### Blackout Dates and Seasonal Operations

Already handled by Shop.closedDates and Shop.seasonalHoursOverrides. The booking system checks these before allowing a reservation:

- If pickupDate is in closedDates → reject
- If pickupDate falls in a seasonalHoursOverride → use those hours instead of default
- PricingRule.effectiveStart/effectiveEnd handles seasonal pricing

### Scheduled Maintenance

Already handled by MaintenanceRecord.scheduledDate and status = 'scheduled'. The system:

- Shows upcoming maintenance on the calendar view
- Blocks the vehicle from being assigned to reservations that overlap the scheduled date
- Sends operator reminder the day before
