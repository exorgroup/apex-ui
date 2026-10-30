# apex-ui — agent reference

How `@exorgroup/apex-ui` behaves where it is easy to get wrong. Read every hard lesson's
title before using the kit, and the full topic for the components the task touches.

Every lesson was paid for in a host app. Shape (from Exor's framework, `lessons.md`):
`kind` is `hard` (breaking it is a defect, usually silent) or `judgment`; a hard lesson's
`check` names the test or command that proves it, blank when no gate exists yet; `origin`
links the record where it was learned — TBX's phase ledgers, pinned at commit `4922025`.

Lessons true of any project live in the framework's `lessons.md`; lessons about one
product live in that product's appendix. Only what holds BECAUSE of this kit is here.


## Setup and delivery

### Nothing imports a control — `ApexUI` registers the library under the `Apex` prefix at boot
kind: hard
check:
origin: [Phase E](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-e-tasks.md)
Components and directives (`v-apex-tooltip`) alike — the plugin registers both under the same prefix.

### Developing against a linked apex-ui: `optimizeDeps.exclude` it, and restart the dev server after a rebuild
kind: hard
check: `curl -s <dev-server>/node_modules/@exorgroup/apex-ui/dist/apex-ui.js | grep -c <token>`
origin: [Phase G](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-g-tasks.md)
Vite pre-bundles linked packages and its watcher ignores `node_modules` — "my CSS fix appeared and my JS fix did not".


## ApexForm

### ApexForm forwards a FIXED list of field keys; anything else goes in `props`
kind: hard
check:
origin: [workflow §2](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/screen-migration-workflow.md)
`placeholder min max step rows maxlength unit currency precision multiple accept stars showTime filter clearable mask inline columns dataKey`. Any other key at the field root is dropped before the unknown-prop warning can fire.

### Kit controls take `help`, not `hint` — only image, checkbox, radio and file-upload have `hint`
kind: hard
check:
origin: [Phase CB](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-cb-tasks.md)
A `hint=` on ApexNumber / Input / Select / Tags is silently dropped.

### Always give a select or multiselect a `placeholder`
kind: hard
check:
origin: [AF2-374](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-g-tasks.md)
It draws "Select…" regardless, but reports itself FILLED only with a placeholder — without one the float label sits inside the box with "Select…" printed through it.

### A `#field-{key}` slot replaces the control: bind `:error`, `@blur` and `update(v)`, and wrap it in `ApexField` for the label
kind: hard
check:
origin: [AF2-365](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-e-tasks.md)
Skip `error` and no message shows; skip `blur` and it is never server-validated; assign `form.x` directly and the stale error, dirty flag and local rules all go wrong. `:label-for="false" filled` on the ApexField.

### No `ApexField` label when the word is already on screen
kind: judgment
origin: [M/036](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-m-tasks.md)
A heading slot, or a section whose only field is the slot — the section title is the label.

### A field is as wide as its cell — narrow it with `span12`, not CSS
kind: judgment
origin: [AF2-393](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-o-tasks.md)
`span12` and `start` need `columns` that divide 12; a labelled control needs about two twelfths or its float label clips.

### `--apex-form-w` sets a form's width; never reach into `.apex-form__panel`
kind: hard
check:
origin: [M/012](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-m-tasks.md)
The variable is read, never declared, so any ancestor can set it.

### On a two-mode page, put `readonly` on the fields, not the form
kind: judgment
origin: [J/008](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-j-tasks.md)
Otherwise pressing Edit reflows the page from paragraphs to controls.

### A mode change ends the form session; a Cancel that stays in edit mode calls `reset()`
kind: hard
check:
origin: [J/013](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-j-tasks.md)
ApexForm clears local errors, touched and dirty when editability flips; server errors survive on purpose.

### A modal's `#head-end` needs `.apex-form__titles { flex: 1 1 auto }`
kind: hard
check:
origin: [Phase AV](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-av-tasks.md)
Without it the status and × sit beside the title, not at the far end. Kit candidate: make it the default.

### The form side panel's width variable is `--apex-form-formaside-w`, and the panel caps at 880px
kind: hard
check:
origin: [Phase AV](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-av-tasks.md)
Not `--apex-form-aside-w`; the aside is `flex: 0 0`.


## Tables and filters

### `row-ripple` is a prop, not a variable
kind: judgment
origin: [Phase R](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-r-tasks.md)
A shared class cannot carry it; each table that wants the ripple sets the prop.

### `filter-display` decides the filter model's SHAPE — unwrap both `row` and `menu`
kind: hard
check: `tests/column-filter-shape.spec.ts` (apex-ui)
origin: [workflow §2](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/screen-migration-workflow.md)
`menu` reports `{ operator, constraints: [...] }` with no top-level `value`; reading `.value` sends nothing and the rows do not change.

### `maxConstraints` defaults to 3 — set `:max-constraints="1"` where the server takes one value
kind: hard
check:
origin: [workflow §2](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/screen-migration-workflow.md)
Otherwise "Add rule" is offered and every rule but the first is dropped.

### Seed the filter model in the `constraints` shape
kind: hard
check:
origin: [workflow §2](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/screen-migration-workflow.md)
The "filtered" badge counts `constraints` only, so an applied filter seeded as a bare value shows no sign of it.

### `ApexDataTable` columns align `start` / `end` — `'right'` is centred
kind: hard
check: `tests/Feature/EventSalesPageContractTest.php` (TBX — refuses `'right'` and `'left'`)
origin: [Phase AP](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-ap-tasks.md)
`cellStyle` reads anything but `start` and `end` as `center`. Every figure on a screen was centred from its port onward.

### An expansion inside a wide scrolling table spans every column — pin it inside `.apex-dt__viewport`
kind: hard
check:
origin: [Phase AP](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-ap-tasks.md)
`position: sticky; left: 0`, sized to the viewport's visible width from a `ResizeObserver` handed down as a custom property — CSS alone cannot know it.


## Actions and reports

### `useRecordActions` resolves in `onFinish`, never `onSuccess`
kind: hard
check:
origin: [Phase E](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-e-tasks.md)
The promise holds the progress stage open; resolved in `onSuccess`, the gears turn for ever on a failed request — `run()` has no timeout.

### `run()` actions resolve `{ ok, title, message }`, always; `REPORT` is an options object, never rendered
kind: hard
check:
origin: [Phase Q](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-q-tasks.md)
Resolving nothing gives a green tick over an empty dialog. Spread `REPORT` into `result`, with a title for the refusal.


## Tokens and styling

### A variable the library DECLARES on its root cannot be set from an ancestor
kind: hard
check:
origin: [AF2-315](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-r-tasks.md)
Only variables it merely READS with a fallback inherit. Setting a declared one on a wrapper does nothing, silently — put the rule on the element.

### `--accent-info` is consumed but never defined
kind: hard
check:
origin: [Phase Z](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-z-tasks.md)
Message, Badge, Chip and Avatar fall through to `--accent-primary`, so `info` and `primary` look the same until the host defines it.


## Components

### Apex controls emit the VALUE where PrimeVue emitted an event
kind: hard
check:
origin: [Phase O](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-o-tasks.md)
`@change="reload"` → `@update:modelValue="reload()"` — with the parentheses (general lesson "handlers with parentheses").

### `ApexImageField` is a form field; `ApexImageCrop` is a toolbar action
kind: judgment
origin: [Phase M](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-m-tasks.md)
Field: preview box, `v-model` + `v-model:removed`. Crop: where the field's box would be wrong.

### An invalid prop VALUE falls back to the default look, with no error
kind: hard
check:
origin: [Phase AJ](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-aj-tasks.md)
`severity: 'warning'` (the kit's is `warn`), `variant="outline"` (`outlined`), `dot: true` on a badge that has a value. Check the prop's type in the kit source.

### `ApexAvatar` builds initials from the first and last word — pass `initials`
kind: hard
check:
origin: [Phase AN](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-an-tasks.md)
"Dev promoter (Percentage)" became "D(". Derived text from the kit is a guess about your data.

### `ApexSwitch` does not carry `aria-label` onto its button
kind: judgment
origin: [workflow §16](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/screen-migration-workflow.md)
A probe finds it by its row. Kit candidate.

### `ApexCheckbox` draws its label even with `label-placement="hidden"`; `ApexInput` emits no keydown
kind: hard
check:
origin: [Phase AY](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-ay-tasks.md)
Pass a screen-reader-only slot for the label; catch Enter / Esc on a wrapper (native events bubble). Kit candidates both.

### `ApexCalendar`'s default chip styles reach into your slot markup
kind: hard
check:
origin: [Phase BE](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/phase-be-tasks.md)
`.apex-calendar__block[data-compact] b { display: none }` hid a name written in `<b>`. Use elements the kit does not style; look at a SHORT block.

## Tests and the gallery

### The gallery runs the mirror (`web/*.js` in apex-ui-docs), not the SFC
kind: hard
check:
origin: [handover §11 @4922025](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/handover.md)
When gallery behaviour and the component disagree, read the mirror first — a whole debugging session went the wrong way.

### happy-dom has no geometry — split a test so the part that needs none still runs
kind: hard
check:
origin: [handover §11 @4922025](https://github.com/exorgroup/apex-tbx/blob/4922025e94dd836083cadb557ac0a9926cce9bc7/.claude/apexframework/handover.md)
No `elementsFromPoint`, zero `getBoundingClientRect`, no usable rAF. Cover a drag's pickup for real even when its drop must be stubbed.
