# Changelog

All notable changes to `@exorgroup/apex-ui` and `@exorgroup/apex-form`.
Semantic versioning; the two packages release in lockstep until 1.0.

## [Unreleased]

## [0.4.0] — 2026-11-13

TBX TL6's kit work: the secure PIN pad the till signs in, approves and unlocks with.

### Added — apex-ui
- `ApexKeyPad` `secure` — a PIN pad that gives nothing away (TBX TL6/001, Till P-D53 / D54): the digits are
  shuffled each time it appears and after every entry (whatever `randomise` / `reshuffle` say), masked; a
  physical keyboard is ignored; a hovered, pressed or focused key looks exactly like a resting one, and a tap
  never moves the focus onto the key; a screen reader hears "PIN key" for every digit and "N digits entered",
  never the digits. (`tests/keypad.spec.ts`.)

## [0.3.0] — 2026-11-09

TBX TL5's kit work: the till's keypad and keyboard, and a stacked button that keeps its height.

### Added — apex-ui
- `ApexKeyPad` — a till's keypad and a PIN pad in one control (TBX TL5/001). `v-model` holds the entry
  as a string. Keys switch on one by one: `operators` (+ − × ÷, or a list), `enter`, `del`, `dot`,
  `clear`, `double-zero`; `function-keys` adds the screen's own, each emitting `function(id, result)`.
  A sum is worked out in standard order (× ÷ first) by its own parser, never `eval`; a result needing
  more places than `decimals`, longer than `max-length`, or dividing by zero shows "Can't work that out"
  and emits nothing — the next key clears it. `randomise` shuffles the digits (secure random) on mount
  and — unless `reshuffle` is off — after each entry; `mask`, `max-length` + `auto-submit` for PINs; `layout` calculator / phone;
  a physical keyboard's keys work while it has focus; keys never below 44px. Without operators and
  dot it enters a code and keeps leading zeros. `keypadEvaluate`, `keypadPress` and `shuffledDigits`
  are exported. (`tests/keypad.spec.ts`.)
- `ApexKeyboard` — an on-screen keyboard for a touch screen with none of its own (TBX TL5/002). `v-model`
  is the text typed; letters in lower case, `shift` adds a Shift key (the next letter in capitals, a
  second tap locks); `extra-letters` adds a row beyond A–Z (Maltese ċ ġ ħ ż); `enter`, `del`, `clear`,
  `space`, `hide`, `digits` switch keys on and off; `max-length`. Pressing a key never takes the focus,
  so the field it types into keeps its caret; a physical keyboard types while it has focus; keys never
  below 44px. Laid out like a desktop keyboard on one key unit (TL5 D35): character keys one unit, ⌫ 3,
  Enter and Shift 2.25, Clear and Hide 2.5, Space 8, staggered letter rows on a 13-unit board centred in
  its space; the unit follows the width up to `--apex-keyboard-key-max` (72px). (`tests/keyboard.spec.ts`.)

### Fixed — apex-ui
- `ApexButton`'s `height` now holds for a button with its icon above or below the label (`icon-pos` top / bottom),
  which sized itself to its content (`block-size: auto`) whatever `height` said. A stacked button with no `height`
  still sizes to its content (TBX TL5/010, `data-fixed-h`; `tests/button-size.spec.ts`).

## [0.2.0] — 2026-11-08

The work TBX had used from the local checkout since 0.1.0, released at last, plus 0.1.1's fix.

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

- Also, each with its spec in `tests/`: `ApexForm` section slots, rail layout, rail badge at the end,
  nav label, aside / sidebar badge; `ApexColumnFilter` any-of and its shape; footer values on
  `ApexDataTable` and `ApexTreeTable`; filter-row modes; `ApexDatePicker` ISO model; `ApexEditor`
  loading content is not an edit; `ApexInput` keeps the placeholder when floating with no label;
  `ApexOrderList` editable rows; `ApexPaginator` all rows; `ApexTextarea` meter; chart weekly bars.
- The anchored-overlay fix of 0.1.1 (below).

### Fixed — apex-ui
- `ApexDialog` with `enter-class` / `leave-class`: the classes animated the MASK, so the dim
  page slid in and out with the dialog. They now go on the panel alone, as ApexForm's modal
  (AF2-331); the mask stays still, keeps mounted while the panel leaves and loses its colour the
  moment closing starts (`[data-closing="true"]`). The presets (scale / slide / fade) are
  unchanged. (`tests/overlay-transition.spec.ts`; TBX CB, 2026-10-15.)

## [0.1.1] — 2026-11-08

A patch on 0.1.0 alone, cut from `release/0.1.x`; the work below in 0.2.0 was not in it.

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
