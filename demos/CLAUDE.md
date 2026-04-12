# Local Praxis Demos

## Architecture Rule

Every demo in this directory must follow the domain-model-first pattern defined in the `local-praxis-architecture` skill. Read that skill before building, modifying, or fixing any demo.

The short version: define entities and relationships before writing UI. Every entity gets full CRUD. Settings are data, not constants. Time is `new Date()`. Derived values are computed, not stored. State persists via localStorage.

## Skill Loading Order

When working on any demo:

1. `local-praxis-architecture` — domain model and data layer (do this FIRST)
2. `local-praxis-design` — visual language, colors, typography, animation
3. `local-praxis-code` — tech preferences, quality standards, deployment
4. `local-praxis-brand` — voice and identity (for any customer-facing copy)

## Demo Index

- `rental.html` — Golf cart rental fleet manager (Island Wheels, Port Aransas)
- `portal.html` — Client portal
- `inventory.html` — Inventory management
- `booking.html` — Booking system

## Reference Schemas

The rental system has a complete entity-relationship model in the architecture skill's `references/rental-schema.md`. Use it as the structural template when rebuilding rental.html or as a pattern for the other demos.
