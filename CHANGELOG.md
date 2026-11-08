# Changelog

All notable changes to `@exorgroup/apex-ui` and `@exorgroup/apex-form`.
Semantic versioning; the two packages release in lockstep until 1.0.

## [Unreleased]

### Added — apex-ui
- `ApexForm`: the `head-end` slot receives `update(key, value)`. A header control that
  stands for a field (a Draft / Published switch beside a page title) edits it through the
  field's own path — the form is marked dirty, `field-change` fires, a stale server error
  on it is cleared. Writing the model directly saved the value while the footer went on
  saying nothing was unsaved. A key the schema does not draw still sets and dirties.
  (`tests/form-head-end-update.spec.ts`; TBX AG/013.)

- `ApexField` (every control): `info` — an ⓘ after the label that opens a short explanation of what a
  setting MEANS (Moodle's help icon); click or Enter opens, Escape or a click elsewhere closes. A real
  button inside the label with an accessible name; forwarded through `APEX_FIELD_KEYS`.
  (`tests/field-info.spec.ts`; TBX CB/025.)

### Fixed — apex-ui
- `ApexDialog` with `enter-class` / `leave-class`: the classes animated the MASK, so the dim
  page slid in and out with the dialog. They now go on the panel alone, as ApexForm's modal
  (AF2-331); the mask stays still, keeps mounted while the panel leaves and loses its colour the
  moment closing starts (`[data-closing="true"]`). The presets (scale / slide / fade) are
  unchanged. (`tests/overlay-transition.spec.ts`; TBX CB, 2026-10-15.)

## [0.1.0] — 2026-08-28

First slice. Not yet stable; the API may change before 0.2.

### Added — apex-ui
- Plugin entry `app.use(ApexUI, options)` with configurable component prefix, default
  size, default label placement, fallback strings, icon resolver, validation adapter.
- Controls: `ApexField`, `ApexInput`, `ApexTextarea`, `ApexNumber`, `ApexStepper`,
  `ApexSelect`, `ApexMultiselect`, `ApexSwitch`, `ApexSegmented`, `ApexRadioGroup`,
  `ApexButton`, `ApexErrorSummary`, `ApexIcon`.
- Seven label placements, three sizes, four tones, six icon slots.
- `rules` conditional formatting on the apex-form condition grammar.
- Validation adapters for Zod and Laravel Precognition.
- Dark mode by media query and by class; RTL-safe logical properties throughout.
- Laravel: service provider, publishable config, `@apexUi` / `@apexUiTheme` Blade
  directives, `apex-ui:install` command.
- Vitest + Vue Test Utils setup with condition, transform, tone and a11y tests.

### Added — apex-form
- Package scaffolding and the tightened, typed schema contract (discriminated unions per
  field type). Engine port from `pando-form.js` is in progress.

### Breaking, versus pando-form.js
- Field types are now a discriminated union: unknown `type` values fail typecheck rather
  than falling back to text.
- `visibleIf` / `hiddenIf` / `disabledIf` keep their grammar; the long `{ op, value }`
  form stays supported.
