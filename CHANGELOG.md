# Changelog

All notable changes to `@exorgroup/apex-ui` and `@exorgroup/apex-form`.
Semantic versioning; the two packages release in lockstep until 1.0.

## [0.1.1] — 2026-11-08

A patch on 0.1.0 alone, cut from a release branch: the unreleased work on `main` is not in it.

### Fixed — apex-ui
- An anchored panel that mounts AFTER its overlay opened is now placed. A server-backed
  `ApexInput` with `:loading` showed nothing on its first search — its list mounted once the
  answer came, hidden, with nothing left to place it — and results on the second. Same
  composable under `ApexSelect`, `ApexMultiselect`, `ApexTags`, `ApexDatePicker`,
  `ApexColumnFilter`. Found in Apex Till (TL3/012); `tests/anchored-late-panel.spec.ts`.

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
