# @exorgroup/apex-ui

Vue 3 form controls for APEX Pando, packaged for Laravel. Hand-written CSS on the APEX
token set — no Tailwind, no utility classes in your markup.

## Install

```bash
composer require exorgroup/apex-ui
php artisan apex-ui:install
npm install @exorgroup/apex-ui
```

`resources/js/app.js`:

```js
import { createApp } from 'vue';
import ApexUI from '@exorgroup/apex-ui';
import '@exorgroup/apex-ui/style.css';

createApp(App).use(ApexUI, { size: 'md', labelPlacement: 'top' }).mount('#app');
```

Layout `<head>`:

```blade
@apexUiTheme  {{-- applies light/dark before first paint --}}
@apexUi       {{-- Material Symbols font (+ prebuilt bundle in 'published' mode) --}}
```

No build step? `php artisan apex-ui:install --published` copies the UMD bundle to
`public/vendor/apex-ui` and `APEX_UI_MODE=published` makes `@apexUi` emit it.

### Optional: animate.css

Every overlay — a form's modal, an alert, a dialog, a drawer, a popover, a confirm
popup, a toast — takes `enterClass`, `leaveClass`, `enterDuration` and `leaveDuration`.
Those are plain class names: **this package bundles no animation library and never
references one**, which is what keeps it free of runtime CSS dependencies.

To use [animate.css](https://animate.style), install and import it yourself:

```bash
npm i animate.css
```

```js
import 'animate.css';

createApp(App).use(ApexUI, {
  overlayTransition: {
    enterClass: 'animate__animated animate__fadeInDown',
    leaveClass: 'animate__animated animate__fadeOutUp',
    enterDuration: '350ms',
  },
}).mount('#app');
```

It needs **both** its base class and the animation. Without it, the built-in
`scale` / `slide` / `fade` presets are used, so nothing breaks if you skip this.

## Components

`ApexField` `ApexInput` `ApexTextarea` `ApexNumber` `ApexStepper` `ApexSelect`
`ApexMultiselect` `ApexSwitch` `ApexSegmented` `ApexRadioGroup` `ApexButton`
`ApexErrorSummary` `ApexIcon`

Every control takes the same field props and renders an `ApexField` internally:

| prop | type | default |
|---|---|---|
| `label` `labelIcon` `help` `placeholder` | string | — |
| `labelPlacement` | `top \| before \| after \| under \| floating \| inline \| hidden` | `top` |
| `labelWidth` | CSS length (for `before`) | `160px` |
| `size` | `sm \| md \| lg` | `md` |
| `tone` | `default \| danger \| warning \| success` | `default` |
| `error` | `string \| string[] \| null` | — |
| `warning` `success` | string | — |
| `rules` | `ApexRule[]` — conditional formatting | — |
| `context` | extra values `rules` may reference | — |
| `required` `disabled` `readonly` | boolean | `false` |
| `statusIcon` | show the tone icon inside the control | `true` |

Message precedence: `error` → `warning` → `success` → matching `rules` → `help`.

### Conditional formatting

`rules` reacts to the value itself. It is formatting, not validation — it never blocks a
submit.

```vue
<ApexNumber v-model="qty" label="Quantity"
  :rules="[
    { when: { eq: 3 },  tone: 'danger',  message: 'Three is not a valid quantity' },
    { when: { gte: 50 }, tone: 'warning', message: 'Large order — needs approval' },
  ]" />
```

Conditions use the apex-form grammar. `field` defaults to `value`, so `{ eq: 3 }` reads
this control's value; name any other key to read from `context`:

```vue
<ApexInput v-model="code" :context="{ plan }"
  :rules="[{ when: { all: [{ empty: true }, { field: 'plan', eq: 'enterprise' }] },
             tone: 'warning', message: 'Enterprise plans usually carry a code' }]" />
```

### Validation adapters

The controls own no validation. Wire one:

```js
import { zodAdapter, precognitionAdapter } from '@exorgroup/apex-ui';

app.use(ApexUI, { adapter: zodAdapter(UserSchema) });
// or
const form = useForm('post', '/users', { name: '' });
app.use(ApexUI, { adapter: precognitionAdapter(form) });
```

Or skip adapters entirely and bind `:error="errors.name"` yourself.

### Icons

Material Symbols Outlined at weight 300 (Light), rendered as ligature spans. Icon weight
follows surrounding text unless you pass `:weight`. Swap sets with `iconResolver`:

```js
app.use(ApexUI, { iconResolver: (n) => MY_MAP[n] ?? n });
```

### Dark mode

Both `prefers-color-scheme` and a `.dark` / `[data-theme="dark"]` class; the class wins.
`@apexUiTheme` handles persistence.

### RTL and i18n

All spacing uses logical properties, so `dir="rtl"` works without overrides. Built-in
strings resolve through `vue-i18n` if installed (keys under `apexui.*`), then plugin
`messages`, then English.

### Accessibility

Labels are always associated; `aria-describedby` points at the message; `aria-invalid`
tracks the danger tone; every interactive element has a visible focus ring. Segmented
controls use roving tabindex, the multiselect is a `combobox` with arrow-key navigation.

## Development

```bash
npm run dev        # watch build
npm run build      # dist + .d.ts
npm run test       # Vitest + Vue Test Utils
```
