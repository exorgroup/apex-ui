<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  AFFIX_CASES, AUTOCOMPLETE_SNIPPET, CITIES, COMMON_CONTROLS, ENTRIES, FORMATTING_RULE,
  ICON_SLOT_CASES, KEY_FILTER_CASES, LABEL_PLACEMENTS, PLAYGROUND_DEFAULTS,
  PAGES, PG_COLORS, QUANTITY_RULES, ROLE_OPTIONS, SHARED_FIELD_PROPS, SIZES, STATE_CASES,
  DIAL_ITEMS, ICON_RESOLVER_SNIPPET, ICON_SETS, SEVERITIES, SPLIT_MODEL, SUMMARY_ERRORS,
  TOKEN_SWATCHES, TONE_CASES, ZONE_OPTIONS,
} from './registry';
import type { DocEntry, DocPage } from './registry';

const current = ref('input');
const theme = ref<'light' | 'dark'>('dark');
const size = ref<'sm' | 'md' | 'lg'>('md');
const dir = ref<'ltr' | 'rtl'>('ltr');
const search = ref('');
const copied = ref(false);

/** v-model per control, so switching away and back keeps what you typed. */
const model = reactive<Record<string, unknown>>({});

/**
 * Live prop overrides from the playground rail, per control. Kept apart from
 * `base` so "reset" is just clearing this, and so the other sections on the page
 * keep rendering the baseline rather than following the rail.
 */
const overrides = reactive<Record<string, Record<string, unknown>>>({});

/* Falls back to the first control so the control-page computeds stay defined while a
   Foundations page is open; the control markup is v-if'd out either way. */
const entry = computed<DocEntry>(() => ENTRIES.find((e) => e.id === current.value) ?? ENTRIES[0]);

/** The Foundations page currently open, or undefined on a control page. */
const page = computed<DocPage | undefined>(() => PAGES.find((p) => p.id === current.value));
const isDoc = computed(() => !!page.value);

const groups = computed(() => {
  const q = search.value.trim().toLowerCase();
  const all = [...PAGES, ...ENTRIES];
  const matched = q ? all.filter((e) => e.name.toLowerCase().includes(q)) : all;
  const out: Array<{ name: string; items: Array<DocEntry | DocPage> }> = [];

  matched.forEach((e) => {
    let g = out.find((x) => x.name === e.group);
    if (!g) { g = { name: e.group, items: [] }; out.push(g); }
    g.items.push(e);
  });

  return out;
});

/**
 * A control's own props, minus anything the common group already covers — the
 * entries list `label`, `required` and friends, and showing them twice would let
 * the two copies disagree.
 */
const ownControls = computed(
  () => entry.value.controls.filter((c) => !COMMON_CONTROLS.some((x) => x.key === c.key)),
);

/**
 * The shared field props, or nothing for a control with no field shell.
 *
 * ApexIcon is not a field: it has no label, tone or message line, so offering
 * those editors would be offering props it ignores. The gallery keeps `size`
 * for noField entries that honour it, but skips even that when the entry
 * declares its own — which ApexIcon does, as a pixel number rather than a
 * t-shirt size.
 */
const commonControls = computed(() => {
  if (!entry.value.noField) return COMMON_CONTROLS;
  const own = entry.value.controls;
  return COMMON_CONTROLS.filter((c) => c.key === 'size' && !own.some((x) => x.key === c.key));
});

const startingProps = (e: DocEntry) => (e.noField
  ? { ...(e.base ?? {}) }
  : { ...PLAYGROUND_DEFAULTS, ...(e.base ?? {}) });

/** The rail: what this control adds, then the field props everything shares. */
const railGroups = computed(() => [
  { title: null as string | null, items: ownControls.value },
  ...(commonControls.value.length
    ? [{ title: 'Label & state' as string | null, items: commonControls.value }]
    : []),
]);

watch(current, (id) => {
  const e = ENTRIES.find((x) => x.id === id);
  if (!e) { copied.value = false; return; }
  if (!(id in model)) model[id] = JSON.parse(JSON.stringify(e.model ?? null));
  if (!(id in overrides)) overrides[id] = startingProps(e);
  copied.value = false;
}, { immediate: true });

/* The top bar's Size drives the section grids; keep the rail's copy in step so the
   two never show different answers for the same control. */
watch(size, (v) => {
  // ApexIcon's size is a pixel number of its own; writing 'md' into it would
  // hand the component a value it cannot use.
  if (entry.value.noField) return;
  if (overrides[current.value]) overrides[current.value].size = v;
});

watch(theme, (v) => {
  document.documentElement.classList.toggle('dark', v === 'dark');
  document.documentElement.classList.toggle('light', v === 'light');
}, { immediate: true });

watch(dir, (v) => document.documentElement.setAttribute('dir', v), { immediate: true });

/** What the live demo is bound to: the playground's current state, nothing else. */
const live = computed(() => ({ ...overrides[current.value] }));

/** Baseline for the section grids — the rail must not move them around. */
const baseline = (extra: Record<string, unknown> = {}) => ({
  ...(entry.value.base ?? {}), size: size.value, ...extra,
});

function reset() {
  overrides[current.value] = startingProps(entry.value);
  model[current.value] = JSON.parse(JSON.stringify(entry.value.model ?? null));
}

/** The usage snippet, generated from whatever the playground currently shows. */
const usage = computed(() => {
  const bind = overrides[current.value] ?? {};
  const lines = Object.entries(bind)
    .filter(([, v]) => v !== '' && v !== null && v !== undefined && v !== false)
    // A snippet that spells out the defaults is noise you would delete by hand.
    .filter(([k, v]) => PLAYGROUND_DEFAULTS[k] !== v)
    .map(([k, v]) => {
      if (v === true) return `  ${k}`;
      if (typeof v === 'number') return `  :${k}="${v}"`;
      if (Array.isArray(v)) return `  :${k}="${JSON.stringify(v)}"`;
      return `  ${k}="${String(v).replace(/"/g, '&quot;')}"`;
    });

  return `<${entry.value.name} v-model="value"\n${lines.join('\n')}\n/>`;
});

/**
 * Conditional formatting demo, one value per control so switching away and back
 * keeps what you typed.
 *
 * The gallery binds this one-way, which pins it to the matched state. Binding it
 * two-way costs nothing at rest — it still opens showing the warning — and it
 * demonstrates the part that matters: rules re-evaluate on every change, so
 * typing clears the warning and clearing the field brings it back.
 */
const fmt = reactive<Record<string, unknown>>({});

/** What "empty" means for this control — the rule under test is `{ empty: true }`. */
const emptyFor = (model: unknown) => {
  if (Array.isArray(model)) return [];
  // A numeric control's empty is null, not ''. Seeding a string here fails its
  // modelValue type check on ApexStepper, ApexKnob and ApexSlider.
  if (typeof model === 'number') return null;
  return '';
};

watch(current, (id) => {
  const e = ENTRIES.find((x) => x.id === id);
  if (e && !(id in fmt)) fmt[id] = emptyFor(e.model);
}, { immediate: true });

/** Conditional formatting page: type 3, then 50 or more, to move through both rules. */
const rulesQty = ref(3);

/** Sentence-case a severity or position name for a demo label. */
const cap = (v: string) => v.charAt(0).toUpperCase() + v.slice(1);

/** The split button and speed dial both report which item was chosen. */
const actionLog = ref('');
function onMenuClick(payload: { item?: { label?: string } }) {
  actionLog.value = payload?.item?.label ?? '';
}
function onDialClick(payload: { item?: { label?: string } }) {
  actionLog.value = payload?.item?.label ?? '';
}

/** Name of the icon just copied, so the cell can confirm it. */
const copiedIcon = ref('');
let copiedIconTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Copy a glyph name. An unfocused document, a denied permission or a
 * non-secure context all reject, so the confirmation is driven by the click
 * rather than by the promise — the name is on screen either way.
 */
function copyIcon(name: string) {
  navigator.clipboard?.writeText(name).catch(() => {});
  copiedIcon.value = name;
  clearTimeout(copiedIconTimer);
  copiedIconTimer = setTimeout(() => {
    if (copiedIcon.value === name) copiedIcon.value = '';
  }, 1400);
}

/* --- ApexSlider demos --------------------------------------------- */

/** One ref behind both the slider and the number — the point of the section. */
const pairedValue = ref(45);
const rangeValue = ref([8, 18]);
const rangeValue2 = ref([9, 17]);
const vert1 = ref(60);
const vert2 = ref(40);
const vert3 = ref(75);

/* --- ApexInput-only sections ------------------------------------- */

/** Autocomplete demo state — both cells share one value, as the gallery has it. */
const acValue = ref('');
const acHits = ref<unknown[]>([]);
const acBusy = ref(false);
let acTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Stands in for a server call: the control debounces the keystrokes, this
 * resolves the query. The delay is deliberate — without it the loading state
 * never has time to show and the demo misrepresents what a real fetch looks like.
 */
function acSearch(e: { query?: string }) {
  acBusy.value = true;
  const q = (e.query || '').toLowerCase();

  clearTimeout(acTimer);
  acTimer = setTimeout(() => {
    acHits.value = CITIES.filter((c) => c.label.toLowerCase().includes(q));
    acBusy.value = false;
  }, 240);
}

/** Key-filter demos are two-way bound, so a rejected keystroke visibly does nothing. */
const kf = reactive<Record<string, string>>(
  Object.fromEntries(KEY_FILTER_CASES.map((c) => [c.key, c.seed])),
);

async function copyUsage() {
  try {
    await navigator.clipboard.writeText(usage.value);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    copied.value = false;
  }
}
</script>

<template>
  <div class="docs">
    <aside class="side">
      <div class="brand"><b>APEX UI</b><span>v0.1.0</span></div>

      <div class="side-search">
        <input v-model="search" type="search" placeholder="Search controls" aria-label="Search controls" />
      </div>

      <nav>
        <div v-for="g in groups" :key="g.name" class="navgroup">
          <h4>{{ g.name }}</h4>
          <button
            v-for="e in g.items"
            :key="e.id"
            class="navitem"
            :aria-current="current === e.id ? 'true' : 'false'"
            @click="current = e.id"
          >
            {{ e.name }}
          </button>
        </div>
        <p v-if="groups.length === 0" class="navempty">No control matches that.</p>
      </nav>

      <!-- Said out loud rather than left to be discovered: this harness covers the
           five controls under review, not the whole library. -->
      <p class="side-note">Five of 84 controls, plus the Foundations pages. The rest arrive as each is reviewed.</p>
    </aside>

    <main>
      <div class="topbar">
        <span class="topbar__label">Theme</span>
        <div class="seg">
          <button :aria-pressed="theme === 'light'" @click="theme = 'light'">Light</button>
          <button :aria-pressed="theme === 'dark'" @click="theme = 'dark'">Dark</button>
        </div>

        <span class="topbar__label">Size</span>
        <div class="seg">
          <button v-for="s in SIZES" :key="s" :aria-pressed="size === s" @click="size = s">{{ s }}</button>
        </div>

        <span class="topbar__label">Direction</span>
        <div class="seg">
          <button :aria-pressed="dir === 'ltr'" @click="dir = 'ltr'">LTR</button>
          <button :aria-pressed="dir === 'rtl'" @click="dir = 'rtl'">RTL</button>
        </div>
      </div>

      <!-- Foundations: prose, with a live demo where one earns its place. -->
      <div v-if="isDoc" class="page">
        <h1>{{ page!.name }}</h1>

        <!-- Static, authored copy from the library's own docs — never user input. -->
        <div class="doc-body" v-html="page!.body"></div>

        <div v-if="page!.id === 'theming'" class="swatches">
          <div v-for="v in TOKEN_SWATCHES" :key="v" class="sw">
            <i :style="{ background: `var(${v})` }"></i><span>{{ v }}</span>
          </div>
        </div>

        <template v-if="page!.id === 'formatting'">
          <h2>Live</h2>
          <div class="cell cell--solo">
            <ApexNumber
              v-model="rulesQty"
              label="Quantity"
              :min="0"
              :max="200"
              help="Try 3, then 50 or more."
              :rules="QUANTITY_RULES"
            />
          </div>
        </template>

        <template v-if="page!.id === 'validation'">
          <h2>Summary + inline</h2>
          <div class="cell val-stack">
            <ApexErrorSummary :errors="SUMMARY_ERRORS" />
            <ApexInput
              model-value="ada@"
              label="Email address"
              type="email"
              leading-icon="mail"
              error="Enter a valid email address."
            />
            <ApexMultiselect
              :model-value="[]"
              label="Roles"
              :options="ROLE_OPTIONS"
              placeholder="Assign roles"
              error="Assign at least one role."
            />
            <ApexInput
              model-value="lobby-north"
              label="Slug"
              prefix="pando.app/"
              success="Checked and available."
            />
            <ApexInput
              model-value="2600"
              label="Rotation seconds"
              mono
              warning="Longer than the recommended maximum, but allowed."
            />
          </div>
        </template>
      </div>

      <div v-else class="page">
        <h1>{{ entry.name }}</h1>
        <p class="blurb">{{ entry.blurb }}</p>

        <!-- Demo on the left, live prop editors on the right. -->
        <div class="stage">
          <div class="stage__demo">
            <div class="stage__inner">
              <!-- A control without a field shell needs its own stage treatment: no
                   v-model, and in some cases slot content or room to fan out. -->
              <component v-if="entry.demo === 'icon'" :is="entry.name" v-bind="live" />

              <ApexButton v-else-if="entry.demo === 'button'" v-bind="live">
                {{ live.label || 'Save changes' }}
              </ApexButton>

              <component
                v-else-if="entry.demo === 'split'"
                :is="entry.name"
                v-bind="live"
                @item-click="onMenuClick"
              />

              <!-- The dial fans items around the trigger, so the stage has to be tall
                   enough for them to land inside it. -->
              <div v-else-if="entry.demo === 'dial'" class="dial-stage">
                <component :is="entry.name" v-bind="live" @item-click="onDialClick" />
              </div>

              <ApexButtonGroup v-else-if="entry.demo === 'group'" v-bind="live">
                <ApexButton severity="secondary" variant="outlined" icon="format_align_left" icon-only label="Align left" />
                <ApexButton severity="secondary" variant="outlined" icon="format_align_center" icon-only label="Align centre" />
                <ApexButton severity="secondary" variant="outlined" icon="format_align_right" icon-only label="Align right" />
              </ApexButtonGroup>

              <component v-else :is="entry.name" v-model="model[entry.id]" v-bind="live" />
            </div>

            <p v-if="entry.demo === 'split' || entry.demo === 'dial'" class="note stage__log">
              Last action: <code>{{ actionLog || 'none yet' }}</code>
            </p>
          </div>

          <div class="stage__rail">
            <div class="rail-head">
              <h3>Playground</h3>
              <button class="rail-reset" @click="reset">Reset</button>
            </div>

            <template v-for="g in railGroups" :key="g.title ?? 'own'">
            <h4 v-if="g.title" class="rail-sep">{{ g.title }}</h4>

            <div v-for="c in g.items" :key="c.key" class="rail-row">
              <template v-if="c.type === 'bool'">
                <label class="rail-check">
                  <input
                    type="checkbox"
                    :checked="!!overrides[entry.id][c.key]"
                    @change="overrides[entry.id][c.key] = ($event.target as HTMLInputElement).checked"
                  />
                  <span>{{ c.key }}</span>
                </label>
              </template>

              <template v-else>
                <label class="rail-label">{{ c.key }}</label>

                <select
                  v-if="c.type === 'select'"
                  :value="overrides[entry.id][c.key] ?? ''"
                  @change="overrides[entry.id][c.key] = ($event.target as HTMLSelectElement).value || undefined"
                >
                  <option v-for="o in c.options" :key="o" :value="o">{{ o || '—' }}</option>
                </select>

                <div v-else-if="c.type === 'color'" class="pg-colors">
                  <button
                    v-for="sw in PG_COLORS"
                    :key="sw"
                    type="button"
                    class="pg-sw"
                    :style="{ background: sw }"
                    :aria-label="sw"
                    :data-on="overrides[entry.id][c.key] === sw"
                    @click="overrides[entry.id][c.key] = sw"
                  ></button>
                  <button
                    type="button"
                    class="pg-sw pg-sw--none"
                    aria-label="Default"
                    :data-on="!overrides[entry.id][c.key]"
                    @click="overrides[entry.id][c.key] = undefined"
                  >—</button>
                </div>

                <input
                  v-else
                  :type="c.type === 'number' ? 'number' : 'text'"
                  :value="overrides[entry.id][c.key] ?? ''"
                  @input="overrides[entry.id][c.key] = c.type === 'number'
                    ? Number(($event.target as HTMLInputElement).value) || undefined
                    : ($event.target as HTMLInputElement).value"
                />
              </template>
            </div>
            </template>
          </div>
        </div>

        <h2>Usage</h2>
        <div class="usage">
          <button class="usage__copy" @click="copyUsage">{{ copied ? 'Copied' : 'Copy' }}</button>
          <pre><code>{{ usage }}</code></pre>
        </div>

        <h2>Props</h2>
        <table class="doc-table">
          <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Notes</th></tr></thead>
          <tbody>
            <tr v-for="r in entry.props" :key="r[0]">
              <td class="mono">{{ r[0] }}</td>
              <td class="mono t">{{ r[1] }}</td>
              <td class="mono">{{ r[2] }}</td>
              <td>{{ r[3] }}</td>
            </tr>
          </tbody>
        </table>

        <p v-if="!entry.noField" class="note">
          Plus every shared field prop —
          <template v-for="(p, i) in SHARED_FIELD_PROPS" :key="p"><code>{{ p }}</code><span
            v-if="i < SHARED_FIELD_PROPS.length - 1">, </span></template>.
        </p>

        <h2>Events</h2>
        <table class="doc-table">
          <thead><tr><th>Event</th><th>Payload</th></tr></thead>
          <tbody>
            <tr v-for="r in entry.events" :key="r[0]">
              <td class="mono">{{ r[0] }}</td><td class="mono t">{{ r[1] }}</td>
            </tr>
          </tbody>
        </table>

        <template v-if="entry.slots">
          <h2>Slots</h2>
          <table class="doc-table">
            <thead><tr><th>Slot</th><th>Use</th></tr></thead>
            <tbody>
              <tr v-for="r in entry.slots" :key="r[0]">
                <td class="mono">{{ r[0] }}</td><td class="mono t">{{ r[1] }}</td>
              </tr>
            </tbody>
          </table>
        </template>

        <template v-if="!entry.noField">
        <h2>Label placement</h2>
        <div class="grid">
          <div v-for="p in LABEL_PLACEMENTS" :key="p" class="cell">
            <span class="cell__tag">labelPlacement="{{ p }}"</span>
            <component
              :is="entry.name"
              :model-value="entry.model"
              v-bind="baseline()"
              :label-placement="p"
              label-width="110px"
            />
          </div>
        </div>

        <h2>Tone, messages and required</h2>
        <div class="grid">
          <div v-for="c in TONE_CASES" :key="c.label" class="cell">
            <span class="cell__tag">{{ c.label }}</span>
            <component
              :is="entry.name"
              :model-value="c.empty ? (Array.isArray(entry.model) ? [] : null) : entry.model"
              v-bind="baseline(c.bind)"
            />
          </div>
        </div>

        <h2>Conditional formatting</h2>
        <div class="cell cell--solo">
          <span class="cell__tag">:rules="[{ when: { empty: true }, tone: 'warning', message: … }]"</span>
          <component
            :is="entry.name"
            v-model="fmt[entry.id]"
            v-bind="baseline()"
            :rules="FORMATTING_RULE"
          />
        </div>

        <h2>Sizes</h2>
        <div class="grid">
          <div v-for="s in SIZES" :key="s" class="cell">
            <span class="cell__tag">size="{{ s }}"</span>
            <component :is="entry.name" :model-value="entry.model" v-bind="baseline()" :size="s" />
          </div>
        </div>

        <h2>States</h2>
        <div class="grid">
          <div v-for="c in STATE_CASES" :key="c.label" class="cell">
            <span class="cell__tag">{{ c.label }}</span>
            <component :is="entry.name" :model-value="entry.model" v-bind="baseline(c.bind)" />
          </div>
        </div>
        </template>

        <!-- ApexIcon: no field shell, so its sections are all about the glyph. -->
        <template v-if="entry.id === 'icon'">
          <h2>Sizes</h2>
          <div class="card iconstrip">
            <ApexIcon v-for="n in [16, 18, 20, 24, 32, 44, 64]" :key="n" name="campaign" :size="n" />
          </div>

          <h2>Weight and fill</h2>
          <p class="note">
            Weight follows the surrounding text unless you pin it. <code>fill</code> switches to
            the solid glyph — the same axis the rating control uses for its outline and filled
            variants.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">weight 200 → 700, outlined</span>
              <div class="iconstrip">
                <ApexIcon v-for="w in [200, 300, 400, 500, 600, 700]" :key="w" name="star" :size="30" :weight="w" />
              </div>
            </div>
            <div class="cell">
              <span class="cell__tag">same weights, fill</span>
              <div class="iconstrip">
                <ApexIcon v-for="w in [200, 300, 400, 500, 600, 700]" :key="w" name="star" :size="30" :weight="w" fill />
              </div>
            </div>
          </div>

          <h2>Colour and spin</h2>
          <p class="note">
            An icon paints in <code>currentColor</code>, so it inherits from whatever contains
            it — no colour prop needed.
          </p>
          <div class="card iconstrip">
            <ApexIcon name="check_circle" :size="30" fill style="color: var(--accent-success)" />
            <ApexIcon name="warning" :size="30" fill style="color: var(--accent-warning)" />
            <ApexIcon name="error" :size="30" fill style="color: var(--accent-danger)" />
            <ApexIcon name="info" :size="30" fill style="color: var(--accent-primary)" />
            <ApexIcon name="progress_activity" :size="30" spin style="color: var(--accent-primary)" />
            <span class="note">spin, for progress_activity</span>
          </div>

          <h2>In context</h2>
          <p class="note">
            Every control takes icon names rather than icon markup, and renders them through
            this component.
          </p>
          <div class="grid grid--2">
            <div class="cell val-stack">
              <ApexInput model-value="north entrance" label="Search" label-icon="search" leading-icon="search" clearable />
              <ApexSelect model-value="split" label="Zone layout" leading-icon="grid_view" :options="ZONE_OPTIONS" />
            </div>
            <div class="cell iconstrip">
              <ApexButton icon="check">Save</ApexButton>
              <ApexButton severity="secondary" variant="outlined" icon="download">Export</ApexButton>
              <ApexButton severity="danger" variant="text" icon="delete" icon-only label="Delete" />
              <ApexButton icon="refresh" loading>Syncing</ApexButton>
            </div>
          </div>

          <h2>Accessibility</h2>
          <p class="note">
            Without a <code>label</code> an icon is <code>aria-hidden</code>, which is correct for
            decoration beside text. Give it a <code>label</code> when the icon carries the meaning
            on its own — it then renders as <code>role="img"</code>.
          </p>
          <div class="card iconstrip">
            <span class="icon-inline">
              <ApexIcon name="schedule" :size="18" /> Decorative — hidden from assistive tech
            </span>
            <ApexIcon name="lock" :size="22" label="Locked" />
          </div>

          <h2>Swapping the icon set</h2>
          <p class="note">
            One plugin option remaps every name in the library, so a different icon set is a
            single change rather than a rewrite of every control.
          </p>
          <div class="usage"><pre><code>{{ ICON_RESOLVER_SNIPPET }}</code></pre></div>

          <h2>Reference</h2>
          <p class="note">A working set, by role. Click any glyph to copy its name.</p>
          <div v-for="set in ICON_SETS" :key="set.label" class="iconset">
            <span class="cell__tag">{{ set.label }}</span>
            <div class="icongrid">
              <button
                v-for="n in set.names"
                :key="n"
                type="button"
                class="iconcell"
                :data-copied="copiedIcon === n"
                :title="n"
                @click="copyIcon(n)"
              >
                <ApexIcon :name="n" :size="24" />
                <em>{{ copiedIcon === n ? 'copied' : n }}</em>
              </button>
            </div>
          </div>
        </template>

        <!-- ApexSlider: pairing, range mode and the vertical orientation. -->
        <template v-if="entry.id === 'slider'">
          <h2>Paired with ApexNumber</h2>
          <p class="note">Both bind the same ref — no glue code.</p>
          <div class="cell cell--solo">
            <span class="cell__tag">v-model="lead" on both</span>
            <div class="pair-row">
              <ApexSlider v-model="pairedValue" label="Lead time" :min="0" :max="120" :step="5" show-tooltip />
              <ApexNumber v-model="pairedValue" label="Minutes" unit="min" :min="0" :max="120" />
            </div>
          </div>

          <h2>Range</h2>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">range</span>
              <ApexSlider v-model="rangeValue" label="Operating hours" :min="0" :max="24" show-tooltip range />
            </div>
            <div class="cell">
              <span class="cell__tag">range + minStepsBetweenHandles="4"</span>
              <ApexSlider
                v-model="rangeValue2"
                label="Booking window"
                :min="0"
                :max="24"
                :min-steps-between-handles="4"
                show-tooltip
                range
              />
            </div>
          </div>

          <h2>Vertical</h2>
          <div class="card vert-row">
            <ApexSlider v-model="vert1" label="Bass" orientation="vertical" show-tooltip />
            <ApexSlider v-model="vert2" label="Mid" orientation="vertical" show-tooltip color="#137C4A" />
            <ApexSlider v-model="vert3" label="Treble" orientation="vertical" show-tooltip color="#C24A06" />
          </div>
        </template>


        <!-- ApexButton: the full vocabulary, one section per axis. -->
        <template v-if="entry.id === 'button'">
          <h2>Severity \u00d7 variant</h2>
          <div class="card stack">
            <div v-for="v in ['solid', 'outlined', 'text', 'link']" :key="v" class="sev-row">
              <span class="cell__tag sev-row__tag">{{ v }}</span>
              <ApexButton v-for="sv in SEVERITIES" :key="sv" :severity="sv" :variant="v" size="sm">
                {{ cap(sv) }}
              </ApexButton>
            </div>
          </div>

          <h2>Raised</h2>
          <p class="note">Elevation shadow, and text and outlined buttons lift onto a surface.</p>
          <div class="card iconstrip">
            <ApexButton raised icon="check">Raised solid</ApexButton>
            <ApexButton raised variant="outlined" severity="secondary" icon="edit">Raised outlined</ApexButton>
            <ApexButton raised variant="text" severity="help" icon="star">Raised text</ApexButton>
            <ApexButton raised severity="success" icon="publish">Publish</ApexButton>
          </div>

          <h2>Rounded and icon-only</h2>
          <div class="card iconstrip">
            <ApexButton rounded icon="add">Rounded</ApexButton>
            <ApexButton rounded variant="outlined" severity="secondary">Pill outlined</ApexButton>
            <ApexButton icon-only icon="settings" label="Settings" severity="secondary" variant="outlined" />
            <ApexButton icon-only rounded icon="add" label="Add display" />
            <ApexButton icon-only rounded raised icon="favorite" label="Favourite" severity="danger" />
            <ApexButton icon-only rounded variant="text" icon="more_vert" label="More actions" severity="secondary" />
            <ApexButton icon-only rounded icon="delete" label="Delete" severity="danger" variant="outlined" size="sm" />
            <ApexButton icon-only rounded icon="download" label="Download" severity="contrast" size="lg" />
          </div>

          <h2>Icon position</h2>
          <div class="card iconstrip">
            <ApexButton
              v-for="pos in ['left', 'right', 'top', 'bottom']"
              :key="pos"
              :icon-pos="pos"
              icon="cloud_upload"
              severity="secondary"
              variant="outlined"
            >{{ cap(pos) }}</ApexButton>
          </div>

          <h2>Badge</h2>
          <div class="card iconstrip">
            <ApexButton icon="notifications" badge="4">Alerts</ApexButton>
            <ApexButton icon="inbox" badge="12" badge-severity="danger" variant="outlined" severity="secondary">Inbox</ApexButton>
            <ApexButton icon-only rounded icon="shopping_cart" label="Basket" badge="3" badge-severity="success" />
            <ApexButton icon-only icon="mail" label="Messages" badge="99+" badge-severity="warning" severity="secondary" variant="outlined" />
          </div>

          <h2>Link</h2>
          <div class="card iconstrip">
            <ApexButton variant="link">View documentation</ApexButton>
            <ApexButton variant="link" severity="secondary" trailing-icon="open_in_new">Release notes</ApexButton>
            <ApexButton variant="link" severity="danger">Delete this account</ApexButton>
            <ApexButton href="#" variant="link" icon="arrow_back">Back to displays</ApexButton>
          </div>

          <h2>Sizes and states</h2>
          <div class="card iconstrip">
            <ApexButton size="sm" icon="add">Small</ApexButton>
            <ApexButton size="md" icon="add">Medium</ApexButton>
            <ApexButton size="lg" icon="add">Large</ApexButton>
            <ApexButton loading>Saving</ApexButton>
            <ApexButton disabled icon="lock">Disabled</ApexButton>
            <ApexButton variant="outlined" severity="secondary" trailing-icon="arrow_forward">Continue</ApexButton>
          </div>
        </template>

        <!-- ApexSplitButton -->
        <template v-if="entry.id === 'splitbutton'">
          <h2>Severity</h2>
          <div class="card iconstrip">
            <ApexSplitButton
              v-for="sv in SEVERITIES"
              :key="sv"
              :severity="sv"
              :label="cap(sv)"
              :model="SPLIT_MODEL.slice(1, 4)"
              size="sm"
            />
          </div>

          <h2>Variants</h2>
          <div class="card stack stack--start">
            <div class="iconstrip">
              <ApexSplitButton label="Solid" icon="check" :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Outlined" icon="check" variant="outlined" severity="secondary" :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Text" icon="check" variant="text" :model="SPLIT_MODEL.slice(1, 4)" />
            </div>
            <div class="iconstrip">
              <ApexSplitButton label="Raised" icon="check" raised :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Raised text" icon="check" variant="text" raised :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Raised outlined" icon="check" variant="outlined" severity="secondary" raised :model="SPLIT_MODEL.slice(1, 4)" />
            </div>
            <div class="iconstrip">
              <ApexSplitButton label="Rounded" icon="check" rounded :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Rounded outlined" icon="check" rounded variant="outlined" severity="secondary" :model="SPLIT_MODEL.slice(1, 4)" />
              <ApexSplitButton label="Rounded raised" icon="check" rounded raised severity="success" :model="SPLIT_MODEL.slice(1, 4)" />
            </div>
          </div>

          <h2>Menu content</h2>
          <p class="note">
            Icons, right-aligned hints, section headers, separator rules, disabled rows and
            nested submenus &mdash; hover <em>Export</em> to go two levels deep.
          </p>
          <div class="card">
            <ApexSplitButton label="Save" icon="check" :model="SPLIT_MODEL" @item-click="onMenuClick" />
          </div>

          <h2>Sizes and states</h2>
          <div class="card iconstrip">
            <ApexSplitButton size="sm" label="Small" icon="add" :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton size="md" label="Medium" icon="add" :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton size="lg" label="Large" icon="add" :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton label="Saving" loading :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton label="Disabled" icon="lock" disabled :model="SPLIT_MODEL.slice(1, 4)" />
            <ApexSplitButton label="Opens left" icon="check" menu-align="start" severity="contrast" :model="SPLIT_MODEL.slice(1, 4)" />
          </div>
        </template>

        <!-- ApexSpeedDial: every cell needs height for the items to fan into. -->
        <template v-if="entry.id === 'speeddial'">
          <h2>Types</h2>
          <div class="grid grid--2">
            <div v-for="t in ['linear', 'circle', 'semi-circle', 'quarter-circle']" :key="t" class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">type="{{ t }}"</span>
              <ApexSpeedDial :items="DIAL_ITEMS" :type="t" direction="up" tooltip />
            </div>
          </div>

          <h2>Linear direction</h2>
          <div class="grid grid--2">
            <div v-for="d in ['up', 'down', 'left', 'right']" :key="d" class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">direction="{{ d }}"</span>
              <ApexSpeedDial :items="DIAL_ITEMS.slice(0, 3)" type="linear" :direction="d" tooltip />
            </div>
          </div>

          <h2>Quarter-circle corners</h2>
          <div class="grid grid--2">
            <div v-for="d in ['up-right', 'up-left', 'down-right', 'down-left']" :key="d" class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">direction="{{ d }}"</span>
              <ApexSpeedDial :items="DIAL_ITEMS.slice(0, 4)" type="quarter-circle" :direction="d" :radius="80" tooltip />
            </div>
          </div>

          <h2>Transition delay</h2>
          <p class="note">The stagger reverses on close, so items retract in the order they appeared.</p>
          <div class="grid grid--3">
            <div v-for="ms in [0, 60, 140]" :key="ms" class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">:transition-delay="{{ ms }}"</span>
              <ApexSpeedDial :items="DIAL_ITEMS" type="circle" :radius="82" :transition-delay="ms" />
            </div>
          </div>

          <h2>Mask</h2>
          <p class="note">A modal layer behind the open items, in any colour and opacity.</p>
          <div class="grid grid--3">
            <div class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">mask</span>
              <ApexSpeedDial :items="DIAL_ITEMS" type="semi-circle" mask tooltip />
            </div>
            <div class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">mask-color="#0B5FFF" :mask-opacity="0.25"</span>
              <ApexSpeedDial :items="DIAL_ITEMS" type="semi-circle" mask mask-color="#0B5FFF" :mask-opacity="0.25" severity="info" tooltip />
            </div>
            <div class="cell dial-cell">
              <span class="cell__tag dial-cell__tag">:mask-opacity="0.75"</span>
              <ApexSpeedDial :items="DIAL_ITEMS" type="semi-circle" mask :mask-opacity="0.75" severity="contrast" tooltip />
            </div>
          </div>
        </template>

        <!-- ApexButtonGroup -->
        <template v-if="entry.id === 'buttongroup'">
          <h2>Grouped</h2>
          <div class="card stack stack--start stack--wide">
            <ApexButtonGroup label="Text alignment" hide-label>
              <ApexButton severity="secondary" variant="outlined" icon="format_align_left" icon-only label="Align left" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_center" icon-only label="Align centre" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_right" icon-only label="Align right" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_justify" icon-only label="Justify" />
            </ApexButtonGroup>

            <ApexButtonGroup label="Record actions" hide-label>
              <ApexButton variant="outlined" severity="secondary" icon="save">Save</ApexButton>
              <ApexButton variant="outlined" severity="secondary" icon="content_copy">Duplicate</ApexButton>
              <ApexButton variant="outlined" severity="danger" icon="delete">Delete</ApexButton>
            </ApexButtonGroup>

            <ApexButtonGroup label="Rotation" hide-label>
              <ApexButton severity="contrast" icon="skip_previous" icon-only label="Previous" />
              <ApexButton severity="contrast" icon="play_arrow" icon-only label="Play" />
              <ApexButton severity="contrast" icon="skip_next" icon-only label="Next" />
            </ApexButtonGroup>
          </div>

          <h2>Framed with a label</h2>
          <p class="note">
            A <code>label</code> frames the group and sits on the border. Add
            <code>hideLabel</code> to keep it as the accessible name only.
          </p>
          <div class="card framed-row">
            <ApexButtonGroup label="Text alignment">
              <ApexButton severity="secondary" variant="outlined" icon="format_align_left" icon-only label="Align left" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_center" icon-only label="Align centre" />
              <ApexButton severity="secondary" variant="outlined" icon="format_align_right" icon-only label="Align right" />
            </ApexButtonGroup>
            <ApexButtonGroup label="Rotation interval" help="Applies to every display in this zone.">
              <ApexButton severity="secondary" variant="outlined">10s</ApexButton>
              <ApexButton severity="primary">30s</ApexButton>
              <ApexButton severity="secondary" variant="outlined">60s</ApexButton>
            </ApexButtonGroup>
          </div>

          <h2>Vertical</h2>
          <div class="card">
            <ApexButtonGroup orientation="vertical" label="Zoom" hide-label>
              <ApexButton severity="secondary" variant="outlined" icon="add" icon-only label="Zoom in" />
              <ApexButton severity="secondary" variant="outlined" icon="remove" icon-only label="Zoom out" />
              <ApexButton severity="secondary" variant="outlined" icon="crop_free" icon-only label="Fit" />
            </ApexButtonGroup>
          </div>

          <h2>Block</h2>
          <div class="card cell--solo">
            <ApexButtonGroup block label="View mode">
              <ApexButton severity="secondary" variant="outlined" icon="grid_view">Grid</ApexButton>
              <ApexButton severity="primary" icon="view_list">List</ApexButton>
              <ApexButton severity="secondary" variant="outlined" icon="map">Map</ApexButton>
            </ApexButtonGroup>
          </div>
        </template>

        <!-- ApexInput carries four sections no other control has. The gallery
             hand-authors them in its template; here they are driven from the
             registry, but the demos are the same ones. -->
        <template v-if="entry.id === 'input'">
          <h2>Autocomplete</h2>
          <p class="note">
            Two-way bound value, a suggestion list you own, and a <code>@complete</code> handler
            that queries. The control debounces (<code>delay</code>), enforces
            <code>minLength</code>, and drives keyboard selection — ↓ ↑ move, Enter picks, Esc closes.
          </p>
          <div class="grid grid--2">
            <div class="cell">
              <span class="cell__tag">:suggestions + @complete</span>
              <ApexInput
                v-model="acValue"
                label="City"
                leading-icon="location_on"
                placeholder="Start typing…"
                :suggestions="acHits"
                :loading="acBusy"
                :size="size"
                clearable
                dropdown
                @complete="acSearch"
              />
            </div>
            <div class="cell">
              <span class="cell__tag">forceSelection + completeOnFocus</span>
              <ApexInput
                v-model="acValue"
                label="City (must match)"
                leading-icon="location_on"
                :suggestions="acHits"
                :loading="acBusy"
                :min-length="0"
                :size="size"
                force-selection
                complete-on-focus
                help="Blurring with an unmatched value clears it."
                @complete="acSearch"
              />
            </div>
          </div>

          <div class="usage"><pre><code>{{ AUTOCOMPLETE_SNIPPET }}</code></pre></div>

          <h2>Icon slots</h2>
          <div class="grid grid--2">
            <div v-for="c in ICON_SLOT_CASES" :key="c.tag" class="cell">
              <span class="cell__tag">{{ c.tag }}</span>
              <ApexInput :model-value="c.value" v-bind="c.bind" :size="size" />
            </div>
          </div>

          <h2>Affixes and transforms</h2>
          <div class="grid grid--2">
            <div v-for="c in AFFIX_CASES" :key="c.tag" class="cell">
              <span class="cell__tag">{{ c.tag }}</span>
              <ApexInput :model-value="c.value" v-bind="c.bind" :size="size" />
            </div>
          </div>

          <h2>Key filter</h2>
          <p class="note">
            Rejected keystrokes never reach the value — paste and drop are filtered the same way.
            Try typing letters into any of these.
          </p>
          <div class="grid grid--2">
            <div v-for="c in KEY_FILTER_CASES" :key="c.key" class="cell">
              <span class="cell__tag">{{ c.tag }}</span>
              <ApexInput v-model="kf[c.key]" v-bind="c.bind" :size="size" />
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
