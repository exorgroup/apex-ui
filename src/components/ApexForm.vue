<script setup lang="ts">
/**
 * ApexForm — the schema-driven form VIEW.
 *
 * Renders a schema through Apex controls, validates locally for immediate
 * feedback, and displays whatever errors it holds. It never submits: the host
 * owns the verb, and `submit` carries the values out.
 *
 * Three layouts — long, tabs, sidebar — in two shells: page or modal. Nothing
 * else. All the decisions live in core/form; this file is markup.
 *
 * Ported from the browser mirror's web/apex-form.js — keep the two in step.
 */
import { computed, nextTick, reactive, ref, watch, type Component, inject } from 'vue';
import { APEX_UI_OPTIONS } from '../core/symbols';
import type { ApexUiOptions, ApexOverlayTransition } from '../types';
import { useOverlayTransition } from '../core/overlayTransition';
import {
  bag, controlFor, isBlank, isDirectBindType, isDisabled, isUnvalidatedType, isVisible, knownProps,
  cellPlacement, gridGap, gridTracks,
  makeDriver, normalise, validate, validateField as validateOneField,
  type FormDriver, type FormField, type FormSchema, type FormSection, type NormalisedSchema,
} from '../core/form';
import { normaliseOptions } from '../core/utils';
/* `core/anchor`, not `core/i18n`. Their i18n module is a different file
   sharing a filename with ours — AF2-267a split the RTL geometry helpers
   out into core/anchor.ts, and `pointerAnchor` went with them. The name
   exists in both trees, which is what makes this silent. */
import { pointerAnchor } from '../core/anchor';
import type { ApexFormClasses } from '../types';
import type { MenuItem } from './ApexMenuItem';
import type { SpeedDialItem } from '../core/speedDial';
import ApexIcon from './ApexIcon.vue';
import ApexButton from './ApexButton.vue';
import { apexRipple as vApexRipple } from '../core/ripple';
import ApexFieldset from './ApexFieldset.vue';
import ApexInput from './ApexInput.vue';
import ApexPassword from './ApexPassword.vue';
import ApexTextarea from './ApexTextarea.vue';
import ApexNumber from './ApexNumber.vue';
import ApexStepper from './ApexStepper.vue';
import ApexSelect from './ApexSelect.vue';
import ApexMultiselect from './ApexMultiselect.vue';
import ApexCascadeSelect from './ApexCascadeSelect.vue';
import ApexTreeSelect from './ApexTreeSelect.vue';
import ApexRadioGroup from './ApexRadioGroup.vue';
import ApexCheckbox from './ApexCheckbox.vue';
import ApexCheckboxGroup from './ApexCheckboxGroup.vue';
import ApexSwitch from './ApexSwitch.vue';
import ApexSegmented from './ApexSegmented.vue';
import ApexSelectButton from './ApexSelectButton.vue';
import ApexToggleButton from './ApexToggleButton.vue';
import ApexDatePicker from './ApexDatePicker.vue';
import ApexColorPicker from './ApexColorPicker.vue';
import ApexRating from './ApexRating.vue';
import ApexSlider from './ApexSlider.vue';
import ApexKnob from './ApexKnob.vue';
import ApexTags from './ApexTags.vue';
import ApexOtp from './ApexOtp.vue';
import ApexListbox from './ApexListbox.vue';
import ApexOrderList from './ApexOrderList.vue';
import ApexPickList from './ApexPickList.vue';
import ApexFileUpload from './ApexFileUpload.vue';
import ApexEditor from './ApexEditor.vue';
import ApexHTMLEditor from './ApexHTMLEditor.vue';
import ApexDataTable from './ApexDataTable.vue';
import ApexTreeTable from './ApexTreeTable.vue';
import ApexTree from './ApexTree.vue';
import ApexTimeline from './ApexTimeline.vue';
import ApexProgressBar from './ApexProgressBar.vue';
import ApexOrgChart from './ApexOrgChart.vue';
import ApexDataView from './ApexDataView.vue';
import ApexPaginator from './ApexPaginator.vue';
import ApexSplitButton from './ApexSplitButton.vue';
import ApexSpeedDial from './ApexSpeedDial.vue';

/* The tag names core/form's CONTROLS map names, resolved to the real imported
   component. Both the element rendered and the declared-prop set knownProps
   checks come from the SAME registry, so a control can never be invoked with a
   different prop list than the one it is validated against. */
const REGISTRY: Record<string, Component> = {
  ApexInput, ApexPassword, ApexTextarea, ApexNumber, ApexStepper, ApexSelect,
  ApexMultiselect, ApexCascadeSelect, ApexTreeSelect, ApexRadioGroup, ApexCheckbox,
  ApexCheckboxGroup, ApexSwitch, ApexSegmented, ApexSelectButton, ApexToggleButton,
  ApexDatePicker, ApexColorPicker, ApexRating, ApexSlider, ApexKnob, ApexTags, ApexOtp,
  ApexListbox, ApexOrderList, ApexPickList, ApexFileUpload, ApexEditor, ApexHTMLEditor,
  ApexDataTable, ApexTreeTable, ApexTree, ApexTimeline, ApexProgressBar, ApexOrgChart,
  ApexDataView, ApexPaginator,
};

const props = withDefaults(defineProps<ApexOverlayTransition & {
  schema: FormSchema;
  /**
   * Modal visibility. Bind it (v-model:open) and the HOST owns dismissal — it
   * may want to hold the panel up while a save fails. Leave it unbound and
   * ApexForm owns it, because nobody else can close it.
   *
   * Named `open` rather than `visible`: `visible(field)` already means field
   * visibility here, and one word with two meanings in one component is a
   * defect waiting to happen.
   */
  open?: boolean | null;
  /** The footer with Cancel/Save. Off for an embedded form whose host owns saving. */
  actions?: boolean;
  /** Initial values, when no host form is supplied. */
  modelValue?: Record<string, unknown>;
  /**
   * An Inertia or Precognition form. Given one, IT holds the values and
   * ApexForm reads and writes through it; given nothing, ApexForm keeps its
   * own. Never both.
   */
  form?: Record<string, unknown> | null;
  /** Overrides the schema's own choice, for a host that offers a switcher. */
  layout?: string;
  shell?: string;
  /** Values are shown as text and no control is rendered. */
  readonly?: boolean;
  /** Ripple Save and Cancel. Defaults to the plugin's `ripple` option. */
  ripple?: boolean;
  /** Validate a field as soon as it changes, rather than only once touched. */
  eager?: boolean;
  /** Class map — §4.3. Every part of the shell takes one key. */
  ui?: ApexFormClasses;
}>(), {
  open: null, actions: true, modelValue: () => ({}), form: null,
  readonly: false, eager: false,
  /* `undefined`, explicitly. Vue casts an ABSENT boolean prop to `false`,
     not to undefined — so `props.ripple ?? option` would read `false ?? true`
     and the app-wide option could never turn anything on. The tri-state
     "unset / on / off" only survives if the default is spelled out. */
  ripple: undefined,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: Record<string, unknown>): void;
  (e: 'update:open', v: boolean): void;
  (e: 'submit', v: unknown): void;
  (e: 'cancel'): void;
  (e: 'change', v: unknown): void;
  (e: 'field-change', payload: { key?: string; value: unknown }): void;
}>();

/* Ripple the buttons this component renders for itself. Same resolution as
   every other look-and-feel default in the kit: the prop wins, then the
   app-wide plugin option, then OFF — off, because a library that started
   rippling on upgrade would be changing an app that never asked. AF2-324.

   The directive is IMPORTED rather than assumed registered: these components
   can be imported directly without the plugin, and a missing directive is a
   runtime warning and a dead button. */
const uiOptions = inject<ApexUiOptions>(APEX_UI_OPTIONS, {});
const rippleOn = computed(() => props.ripple ?? uiOptions.ripple ?? false);

/* The MODAL panel animates; the scrim does not — it is a sibling with its
   own v-if, so a Transition around the panel alone is all it takes. In the
   page shell the panel is always rendered and a Transition around a
   permanent element simply never fires. AF2-331. */
const shellTransition = useOverlayTransition(props, 'apex-form');
const root = ref<HTMLElement | null>(null);
const active = ref(0);
const touched = reactive<Record<string, boolean>>({});
const selfOpen = ref(true);
/** One teleported list at a time: { i, x, y, rows, count } in viewport coordinates. */
const tip = ref<{ i: number; x: number; y: number; rows: { key?: string; message: string }[]; count: number } | null>(null);
const localErrors = ref<Record<string, string[]>>({});
const submitted = ref(false);
const dirty = ref(false);
const tick = ref(0);

let uidCounter = 0;
const uid = 'apexform-' + (uidCounter += 1);

const driver = ref<FormDriver>(makeDriver(props.form, props.modelValue));

/**
 * Forget what the last editing session decided.
 *
 * `localErrors`, `submitted`, `touched` and `dirty` describe **this** visit:
 * what the user typed, what they were told, and whether they have pressed
 * Save. Opening the dialog again, or pointing it at a different record, is a
 * new visit, and carrying any of it across is asserting something untrue.
 *
 * The defect this closes (AF2-306, found on the first migrated screen): a
 * modal's PANEL unmounts when it closes — `v-if="!isModal || isOpen()"` —
 * but the COMPONENT does not, so every one of these refs survived. Reopening
 * showed the previous session's messages against the new record's values,
 * and a freshly opened Add dialog said "Unsaved changes". The host could not
 * help: nothing was exposed to clear it.
 */
function reset() {
  localErrors.value = {};
  submitted.value = false;
  dirty.value = false;
  Object.keys(touched).forEach((k) => { delete touched[k]; });
}

/* On OPEN rather than on close: resetting as it closes blanks the panel
   while the user is still looking at it, and opening is also the moment a
   host may have swapped to a different record. */
watch(() => isOpen(), (now, was) => { if (now && !was) reset(); });


/* A different host form is a different record, even with the dialog left
   open — a master/detail screen switching rows never closes anything. */
watch(() => props.form, () => {
  driver.value = makeDriver(props.form, props.modelValue);
  reset();
});

const sch = computed<NormalisedSchema>(() => {
  const base = normalise(props.schema);
  if (props.layout) base.layout = props.layout as NormalisedSchema['layout'];
  if (props.shell) base.shell = props.shell === 'page' ? 'page' : 'modal';
  return base;
});
watch(() => sch.value.layout, () => { active.value = 0; });

const isModal = computed(() => sch.value.shell === 'modal');
watch(isModal, (now) => { if (now && props.open == null) selfOpen.value = true; });

/* A read through `tick` so a nested write still re-renders: setPath mutates in
   place, and a host's plain object is not deeply reactive. */
const model = computed(() => {
  void tick.value;
  /* `bag`, NOT `props.form.data || props.form`. Inertia and Precognition both
     ship `data` as a METHOD, and a method is truthy, so the bare read handed
     every whole-form consumer the FUNCTION OBJECT: submit-time validation,
     the `submit` and `change` payloads, and every visibleIf / same / different
     that reads a sibling.
   *
   * It hid for four screens because `getPath(fn, 'name')` does not return
   * undefined — it returns the function's own `.name`, a non-empty string. A
   * form whose only required field is `name` therefore validated by accident.
   * The first schema with a second required field reported it empty while it
   * held a value. Same defect as AF2-306, same guard, one call site short. */
  return driver.value.kind === 'internal' ? driver.value.values!() : bag(props.form);
});

/**
 * Server errors WIN, and keep winning until that field changes.
 *
 * After a 422 in the Inertia tier there is no revalidation, so the only way to
 * clear an error is to edit the field — and a local rule that happens to pass
 * must not erase what the server said. This is the behaviour Pando already has,
 * so a migrated form behaves as its users expect.
 */
const errors = computed<Record<string, string[]>>(() => {
  void tick.value;
  const server = driver.value.serverErrors() || {};
  const out: Record<string, string[]> = {};
  Object.keys(localErrors.value).forEach((k) => { if (localErrors.value[k].length) out[k] = localErrors.value[k]; });
  Object.keys(server).forEach((k) => { if (server[k]) out[k] = ([] as string[]).concat(server[k]); });
  return out;
});
/* `items` is `unknown[]` on a FormField, because a schema is data and these
   rows arrive from JSON. Narrowed here rather than in the template: a TS cast
   written inside an attribute expression parses as a value and takes the file
   down with it (AF2-286, twice). */
const menuItems = (f: FormField) => (f.items || []) as MenuItem[];
const dialItems = (f: FormField) => (f.items || []) as SpeedDialItem[];

const sections = computed<FormSection[]>(() => sch.value.sections);
/** Long shows every section; tabs and sidebar show one. Paired with its index,
    because a tab panel has to reference the tab that selected it. */
const visibleSections = computed(() => {
  if (sch.value.layout === 'long') return sections.value.map((s, i) => ({ s, i }));
  const i = sections.value[active.value] ? active.value : 0;
  return [{ s: sections.value[i], i }];
});
const tabbed = computed(() => sch.value.layout !== 'long' && sections.value.length > 1);
const processing = computed(() => { void tick.value; return driver.value.processing(); });
/**
 * A server validation round trip is in flight -- AF2-347.
 *
 * FORM-WIDE, because that is what Precognition reports: one `validating` flag
 * for the whole form, not one per field. A spinner beside a field would be
 * claiming to know which field the request is about when nothing here does,
 * so it goes in the footer where "this form is being checked" is the truth.
 *
 * No `void tick.value`: unlike `processing`, this has to move on its own
 * between blur and the response, with no input event to tick it. It does --
 * both precognition forms keep the flag on a reactive object (the Inertia
 * adapter syncs it across with a watchEffect). An Inertia or internal form
 * answers false forever, so the indicator simply never appears for them.
 */
const validating = computed(() => driver.value.validating());

/* ─── values ─── */
function valueOf(field: FormField) { void tick.value; return driver.value.get(field.key || ''); }
function control(field: FormField) { return controlFor(field); }

/**
 * Every OTHER `update:X` a DIRECT_BIND control emits for its own state --
 * `expandedKeys`, `selectionKeys`, `filters`, `sortField`, `first`/`rows` and so
 * on. Passing a fixed prop for one of these while never listening for its
 * `update:` counterpart is how ApexTreeTable's expand/collapse broke: the
 * click emitted into the void, and the fixed prop value kept overriding the
 * render on every tick. So none of it is hand-wired per control -- it is read
 * off the component's OWN declared props/emits, the same registry `knownProps`
 * already validates against, and round-tripped through the model as sibling
 * keys (`field.key + '__' + stateKey`) so a host can inspect or persist it if
 * it wants to, without the schema author declaring anything.
 */
function auxKeys(field: FormField): string[] {
  const comp = REGISTRY[control(field).tag] as { emits?: string[] } | undefined;
  const declaredProps = (comp as { props?: Record<string, unknown> } | undefined)?.props || {};
  const emits = comp?.emits || [];
  return emits
    .filter((e) => e.startsWith('update:') && e !== 'update:value' && e !== 'update:modelValue')
    .map((e) => e.slice('update:'.length))
    .filter((k) => k in declaredProps);
}
/**
 * The name of a direct-bind control's own PRIMARY prop -- `value` for most of
 * them, but ApexPaginator's is `first` (it has no `value` at all). And whether
 * that primary prop writes back: read off the component's own declared
 * `emits`, the same way `auxKeys` reads the rest, rather than a per-type
 * hardcoded list -- ApexTree and ApexPaginator both genuinely round-trip;
 * ApexDataTable/ApexTreeTable/ApexTimeline/ApexProgressBar/ApexOrgChart/
 * ApexDataView do not, and forcing a listener onto an event that is never
 * emitted is harmless but claiming one exists when it does not would not be.
 */
function directValueProp(field: FormField): string { return control(field).valueProp || 'value'; }
function directWritesBackPrimary(field: FormField): boolean {
  const comp = REGISTRY[control(field).tag] as { emits?: string[] } | undefined;
  return !!comp?.emits?.includes(`update:${directValueProp(field)}`);
}
function auxBind(field: FormField): Record<string, unknown> {
  void tick.value;
  const out: Record<string, unknown> = {};
  /* Omitted entirely when unset, not written as undefined: a schema-provided
     STATIC default (e.g. rows: 5 for a page size) lives in control(f).props,
     and spreading `{ rows: undefined }` over it before any interaction has
     happened would silently erase that default back to the component's own. */
  auxKeys(field).forEach((k) => {
    const v = driver.value.get(`${field.key}__${k}`);
    if (v !== undefined) out[k] = v;
  });
  return out;
}
function auxListeners(field: FormField): Record<string, (v: unknown) => void> {
  const out: Record<string, (v: unknown) => void> = {};
  /* v-on="object" expects BARE event names (`update:x`), not `onUpdate:x` --
     Vue's own compiler adds the `on` prefix when merging, so pre-prefixing here
     produced `onOnUpdate:x`, which nothing listens for. Every click silently
     did nothing; there was no error to find it by. */
  auxKeys(field).forEach((k) => {
    out[`update:${k}`] = (v: unknown) => {
      driver.value.set(`${field.key}__${k}`, v);
      tick.value += 1;
      emit('field-change', { key: `${field.key}__${k}`, value: v });
      emit('change', model.value);
      if (driver.value.kind === 'internal') emit('update:modelValue', model.value as Record<string, unknown>);
    };
  });
  if (directWritesBackPrimary(field)) {
    out[`update:${directValueProp(field)}`] = (v: unknown) => onInput(field, v);
  }
  return out;
}
/** Reads the SAME key fieldBind uses to bind the prop -- the mirror had these
    reading two different names and stayed silent on richtext/html edits as a
    result. Kept in step deliberately. */
function valueProp(field: FormField) { return control(field).valueProp || 'modelValue'; }

function checkField(field: FormField) {
  const msgs = validateOneField(field, driver.value.get(field.key || ''), model.value);
  localErrors.value = Object.assign({}, localErrors.value, { [field.key || '']: msgs });
}

function onInput(field: FormField, v: unknown) {
  driver.value.set(field.key || '', v);
  dirty.value = true;
  tick.value += 1;
  /* The server's verdict on this field is stale the moment it changes. */
  driver.value.clearError(field.key);
  if (props.eager || touched[field.key || ''] || submitted.value) checkField(field);
  /* The server is NOT asked here, deliberately -- AF2-347. Precognition
     validates with the REAL FormRequest rules, but a half-typed value is one
     the server has every right to reject: "the slug is taken" arrives while
     the user is three letters into typing a different slug, and the rules
     that can answer mid-word (`required`, `max`) are the ones the local pass
     above already answers without a round trip. So the keystroke gets the
     local rules and the server gets the finished value, on blur. */
  emit('field-change', { key: field.key, value: v });
  emit('change', model.value);
  if (driver.value.kind === 'internal') emit('update:modelValue', model.value as Record<string, unknown>);
}
function onBlur(field: FormField) {
  touched[field.key || ''] = true;
  checkField(field);
  /* The one place the server is asked. Precognition debounces it itself
     (1.5s by default), so tabbing through a form is not a request per field. */
  if (driver.value.validateField) driver.value.validateField(field.key || '');
}

/* ─── fields ─── */
function visible(field: FormField) { return isVisible(field, model.value); }
function shown(section: FormSection) { return section.fields.filter((f) => visible(f)); }

/* Declared HERE, below `sections` and `visible`, and not beside the other
   watchers: `watch` evaluates its source at setup, so the computed ran
   before `sections` existed and every mount died with "Cannot access
   'sections' before initialization". The same temporal-dead-zone trap as
   AF2-331. */
/**
 * A form that cannot be edited any more — J/013.
 *
 * TRUE when the host sets `readonly`, and equally when every visible field
 * carries its own `readonly`, because those are two spellings of the same
 * state and a screen may not use the one you expect: the form-level prop
 * renders values as prose, so a page that wants controls-that-refuse marks
 * the FIELDS instead (AF2-313). A rule written against the prop alone would
 * look finished and leave such a page behaving exactly as before.
 *
 * `length > 0` because `every` is true of nothing, and a form still waiting
 * for its schema is not read-only.
 */
const uneditable = computed(() => {
  if (props.readonly) return true;

  const fields = sections.value.flatMap((s) => s.fields.filter((f) => visible(f)));

  return fields.length > 0 && fields.every((f) => !!f.readonly);
});

/**
 * Becoming uneditable — or editable again — ENDS THE EDITING SESSION.
 *
 * A modal gets this for free: it resets when it opens, which is the
 * boundary between one visit and the next. A PAGE never opens, so without
 * this there is no boundary at all for the life of the page, and what the
 * browser decided about a value the user has since abandoned outlives it:
 * a red field and its message in view mode, the section's error badge, and
 * a footer claiming unsaved changes on a form that matches the server.
 *
 * Found on the settings screen — type an invalid email, press Cancel, and
 * the complaint survives into a read-only page that offers no way to fix
 * it.
 *
 * `reset()` clears only what THIS component decided: `localErrors`,
 * `touched`, `submitted`, `dirty`. Server errors belong to the host's form
 * and are left where they are, so a read-only form still shows why the last
 * save was refused. That is the distinction — the browser's opinion of an
 * abandoned session is stale, the server's answer is not.
 */
watch(uneditable, () => reset());

function fieldBind(field: FormField, value: unknown) {
  const c = control(field);
  const comp = REGISTRY[c.tag];
  const declared = comp && (comp as any).props;
  const filteredProps = knownProps(c.tag, c.props, field, declared);
  return Object.assign({}, filteredProps, {
    [c.valueProp || 'modelValue']: value,
    label: field.label,
    help: field.help,
    required: !!field.required,
    disabled: isDisabled(field, model.value) || processing.value,
    readonly: props.readonly || !!field.readonly,
    error: errors.value[field.key || ''],
    name: field.key,
  });
}

/** One grid, spans from the field. A span of 1 emits NOTHING: an inline
    `span 1` outranks the stylesheet, so it silently defeated the rule that
    gives a textarea or an editor the full width of its group. A span is an
    override, not a default. Collapsing to one column is a media query rather
    than a JS breakpoint, so it survives a panel narrower than the viewport. */
function cellStyle(field: FormField, section: FormSection) {
  const { span, start } = cellPlacement(field, section, warnOnce);

  /* CUSTOM PROPERTIES, not `grid-column` — AF2-393. An inline
     `grid-column` cannot be overridden by a stylesheet, so the narrow
     container query could not undo it: the grid dropped to one track while
     a span-2 cell still asked for two, and CSS grid answered by inventing
     an implicit column. The form did not stack, it went lopsided. The
     variables let the query reset every cell to the full row. */
  return start ? { '--cell-span': span, '--cell-start': start } : { '--cell-span': span };
}

/**
 * The grid's own style: how many tracks, and how far apart — AF2-394.
 *
 * The gap variable is written ONLY when there is one to write, so a form
 * that sets nothing inherits the stylesheet's default rather than an
 * inline value that would beat a host's own rule.
 */
function gridStyle(section: FormSection) {
  const gap = gridGap(section, uiOptions.formGap, warnOnce);

  return gap
    ? { '--form-cols': gridTracks(section.columns), '--apex-form-gap': gap }
    : { '--form-cols': gridTracks(section.columns) };
}

/** Said once per message, like knownProps: a per-render warning is noise. */
const WARNED_GRID: Record<string, boolean> = {};
function warnOnce(message: string) {
  if (WARNED_GRID[message]) return;
  WARNED_GRID[message] = true;
  // eslint-disable-next-line no-console
  console.warn(message);
}

/** A read-only value as text, which is what makes a detail page and an edit page one schema. */
function displayValue(field: FormField) {
  const v = valueOf(field);
  if (isBlank(v)) return '—';
  if (Array.isArray(v)) return v.map((x) => optionLabel(field, x)).join(', ');
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  return optionLabel(field, v);
}
function optionLabel(field: FormField, v: unknown) {
  const opts = normaliseOptions((field.options as any) || []);
  const hit = opts.find((o) => String(o.value) === String(v));
  return hit ? hit.label : String((v as any)?.name || v);
}

/* ─── sections ─── */
function sectionErrorCount(section: FormSection) {
  return section.fields.filter((f) => f.key && visible(f) && !isUnvalidatedType(f.type) && errors.value[f.key]).length;
}
/** What the tab's hover list shows: the field name carries the identity, the
    message carries the reason. The field's own message, verbatim -- rewording
    it here would give the same failure two different sentences in one form. */
function sectionErrors(section: FormSection) {
  return section.fields
    .filter((f) => f.key && visible(f) && errors.value[f.key])
    .map((f) => ({ key: f.key, message: errors.value[f.key as string][0] }));
}

function go(i: number, focusPane?: boolean) {
  active.value = i;
  /* Focus moves to the PANE, not to the next tab: a keyboard user switching
     section wants to be in the content, not back at the top of the form. */
  if (focusPane) nextTick(() => { const p = root.value?.querySelector<HTMLElement>('[role="tabpanel"]'); p?.focus(); });
}
function tabId(i: number) { return uid + '-tab-' + i; }
/** Anchored to the button's edge — below it for a horizontal strip, beside it
    for a vertical one — then clamped by pointerAnchor, which returns LOGICAL
    insets so an RTL page is not mirrored. */
function showTip(e: MouseEvent | FocusEvent, i: number, section: FormSection) {
  if (!sectionErrorCount(section)) return;
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const vertical = sch.value.layout === 'sidebar';
  tip.value = {
    i,
    x: vertical ? r.right + 8 : r.left,
    y: vertical ? r.top : r.bottom + 6,
    rows: sectionErrors(section) as { key?: string; message: string }[],
    count: sectionErrorCount(section),
  };
}
function hideTip() { tip.value = null; }
function tipStyle() {
  const t = tip.value;
  return t ? pointerAnchor(t.x, t.y, 320, 200, 0) : {};
}
function panelId(i: number) { return uid + '-panel-' + i; }
/** Arrow keys are part of the tab pattern, not a nicety: with a roving tabindex
    the other tabs are unreachable by Tab alone. */
function onTabKey(e: KeyboardEvent, i: number) {
  const last = sections.value.length - 1;
  const vertical = sch.value.layout === 'sidebar';
  const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
  const next = vertical ? 'ArrowDown' : 'ArrowRight';
  let to: number | null = null;
  if (e.key === next) to = i >= last ? 0 : i + 1;
  else if (e.key === prev) to = i <= 0 ? last : i - 1;
  else if (e.key === 'Home') to = 0;
  else if (e.key === 'End') to = last;
  if (to === null) return;
  e.preventDefault();
  active.value = to;
  const target = to;
  nextTick(() => { root.value?.querySelector<HTMLElement>('#' + tabId(target))?.focus(); });
}

/* ─── lifecycle ─── */
function focusFirstError() {
  nextTick(() => { root.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); });
}
function focusField(key?: string) {
  if (!key) return;
  const i = sections.value.findIndex((s) => s.fields.some((f) => f.key === key));
  if (i >= 0) active.value = i;
  nextTick(() => {
    const el = root.value?.querySelector<HTMLElement>('[name="' + key + '"], #' + String(key).replace(/\./g, '\\.'));
    el?.focus();
  });
}
/** Uncontrolled falls back to the component's own flag. */
function isOpen() { return props.open == null ? selfOpen.value : props.open; }

/* The modal shell must OUTLIVE the panel — AF2-337.

   `.apex-form[data-shell="modal"][data-open="false"] { display: none }` is
   what stops a closed modal's full-screen grid swallowing clicks. It also
   hid the panel the instant `open` went false, so the leave animation ran
   on an invisible element and every exit looked like the dialog being
   switched off.

   `showing` lags `open` by exactly one transition. It cannot be replaced by
   reading a computed style to check: a display:none element still reports
   its animation as running, which is how this survived a browser probe.

   Declared HERE, below isOpen(), and not beside the other transition
   state: the immediate watch calls isOpen(), which reads `selfOpen`, and
   running that above `selfOpen`'s declaration is a temporal dead zone
   error that takes six specs down with it. */
const showing = ref(false);
watch(() => isOpen(), (v) => { if (v) showing.value = true; }, { immediate: true });
/** Ownership, stated once. `open` bound means the HOST decides -- it may want to
    hold the panel up while a save fails. Unbound means nobody else can close it,
    so ApexForm does. Named `open` because `visible` is already a function here
    (field visibility), and two meanings of one word in one component is a
    defect waiting to happen. */
function dismiss() {
  if (props.open == null) selfOpen.value = false;
  emit('update:open', false);
}
function cancel() {
  emit('cancel');
  dismiss();
}
function submit() {
  submitted.value = true;
  const res = validate(sch.value, model.value);
  localErrors.value = res.errors;
  if (!res.ok) {
    /* Bring the first failing section into view — in tabs and sidebar the
       failure is otherwise off-screen and the form looks inert. */
    const i = sections.value.findIndex((s) => sectionErrorCount(s) > 0);
    if (i >= 0) active.value = i;
    focusFirstError();
    return;
  }
  emit('submit', model.value);
  /* Only when uncontrolled: with `open` bound the host may want to keep the
     panel up until its own save comes back. */
  if (props.open == null) dismiss();
}

/** ApexDataTable has no update:value emit; `commitEdits` (on by default for
    `table`) mutates the row objects IN PLACE, so a cell/row edit already landed
    in the model the moment this fires. ApexForm only needs to notice it did. */
function onTableEdit(field: FormField) {
  dirty.value = true;
  tick.value += 1;
  emit('field-change', { key: field.key, value: driver.value.get(field.key || '') });
  emit('change', model.value);
  if (driver.value.kind === 'internal') emit('update:modelValue', model.value as Record<string, unknown>);
}

/* `reset` is exposed as well as automatic: a host that keeps one dialog open
   across several records can say so explicitly. The default has to be right
   on its own, or every host reimplements it. */
defineExpose({ submit, cancel, focusField, isOpen, reset });
</script>

<template>
  <div ref="root" class="apex-form" :class="ui?.root" :data-shell="sch.shell" :data-layout="sch.layout"
       :data-open="isModal ? String(showing) : undefined" :data-readonly="readonly ? 'true' : 'false'">
    <div v-if="isModal && isOpen()" class="apex-form__scrim" :class="ui?.scrim"></div>
    <Transition v-bind="shellTransition" @after-leave="showing = false">
    <form v-if="!isModal || isOpen()" class="apex-form__panel" :class="ui?.panel" novalidate @submit.prevent="submit">

      <header v-if="sch.title" class="apex-form__head" :class="ui?.head">
        <span v-if="sch.icon" class="apex-form__badge" :class="ui?.badge"><ApexIcon :name="sch.icon" :size="24" /></span>
        <div class="apex-form__titles" :class="ui?.titles">
          <h2>{{ sch.title }}</h2>
          <p v-if="sch.subtitle">{{ sch.subtitle }}</p>
        </div>
        <slot name="head-end" />
      </header>

      <!-- Tabs and sidebar are the SAME section list in two orientations, so a
           schema can switch between them without knowing which is showing. -->
      <nav v-if="sch.layout === 'tabs' && sections.length > 1" class="apex-form__tabs" :class="ui?.tabs"
           role="tablist" aria-orientation="horizontal">
        <button v-for="(s, i) in sections" :key="s.id" type="button" role="tab"
                :id="tabId(i)" :aria-controls="active === i ? panelId(i) : undefined"
                :aria-selected="active === i ? 'true' : 'false'" :tabindex="active === i ? 0 : -1"
                :data-invalid="sectionErrorCount(s) ? 'true' : 'false'"
                :aria-describedby="sectionErrorCount(s) ? tabId(i) + '-err' : undefined"
                @keydown="onTabKey($event, i)" @click="go(i, true)"
                @mouseenter="showTip($event, i, s)" @mouseleave="hideTip"
                @focus="showTip($event, i, s)" @blur="hideTip">
          <ApexIcon v-if="s.icon" :name="s.icon" :size="17" />
          <span>{{ s.title || 'Section ' + (i + 1) }}</span>
          <em v-if="sectionErrorCount(s)">{{ sectionErrorCount(s) }}</em>
        </button>
      </nav>

      <div class="apex-form__body" :class="ui?.body">
        <!-- The same tab pattern, vertical. Tabs and sidebar are one section list
             in two orientations, so they must not be two ARIA contracts. -->
        <nav v-if="sch.layout === 'sidebar' && sections.length > 1" class="apex-form__side" :class="ui?.side"
             role="tablist" aria-orientation="vertical">
          <button v-for="(s, i) in sections" :key="s.id" type="button" role="tab"
                  :id="tabId(i)" :aria-controls="active === i ? panelId(i) : undefined"
                  :aria-selected="active === i ? 'true' : 'false'" :tabindex="active === i ? 0 : -1"
                  :data-invalid="sectionErrorCount(s) ? 'true' : 'false'"
                  :aria-describedby="sectionErrorCount(s) ? tabId(i) + '-err' : undefined"
                  @keydown="onTabKey($event, i)" @click="go(i, true)"
                  @mouseenter="showTip($event, i, s)" @mouseleave="hideTip"
                  @focus="showTip($event, i, s)" @blur="hideTip">
            <ApexIcon v-if="s.icon" :name="s.icon" :size="19" />
            <span>{{ s.title || 'Section ' + (i + 1) }}</span>
            <em v-if="sectionErrorCount(s)">{{ sectionErrorCount(s) }}</em>
          </button>
        </nav>

        <div class="apex-form__main" :class="ui?.main">
          <!-- `class` on a SECTION, so a host can style ONE group without a
               hook that reaches every group. The `ui` map is form-wide by
               design — `ui.cell` is every cell in the form — and a screen
               that wants narrower boxes in one pane only had nothing to say
               it with short of an id selector on a generated id. AF2-374. -->
          <section v-for="pane in visibleSections" :key="pane.s.id" class="apex-form__section"
                   :class="[ui?.section, pane.s.class]"
                   :role="tabbed ? 'tabpanel' : undefined" :id="tabbed ? panelId(pane.i) : undefined"
                   :aria-labelledby="tabbed ? tabId(pane.i) : undefined" :tabindex="tabbed ? 0 : undefined">
            <!-- The heading is for the LONG layout only: tabs and sidebar
                 already name the section in their nav, and a pane repeating
                 its own tab reads as a fault.

                 The SUBTITLE is not a repeat of anything, so it renders in
                 every layout — it was authored, and nothing else says it.
                 It used to appear only in long, which meant switching a
                 form to tabs silently deleted its section descriptions.
                 AF2-374, the same loss the fieldset branch below had. -->
            <div v-if="!pane.s.fieldset && ((pane.s.title && sch.layout === 'long') || pane.s.subtitle)"
                 class="apex-form__sectionhead" :class="ui?.sectionHead">
              <h3 v-if="pane.s.title && sch.layout === 'long'">
                <ApexIcon v-if="pane.s.icon" :name="pane.s.icon" :size="18" />{{ pane.s.title }}
              </h3>
              <p v-if="pane.s.subtitle">{{ pane.s.subtitle }}</p>
            </div>
            <!-- The grid ALWAYS renders; only its wrapper changes. A fieldset
                 needs the grid inside its body slot, and an ordinary section
                 wraps in a display:contents div so the box tree is unchanged. -->
            <component :is="pane.s.fieldset ? ApexFieldset : 'div'"
                       v-bind="pane.s.fieldset ? { legend: pane.s.legend || pane.s.title, icon: pane.s.icon,
                                                   toggleable: !!pane.s.toggleable } : {}"
                       :class="[pane.s.fieldset ? null : 'apex-form__pass', ui?.fieldsetPass]">
            <!-- A fieldset takes the title as its LEGEND, which skips the
                 section head above — and took the subtitle down with it.
                 Authored text disappearing because the wrapper changed is a
                 silent loss, so it renders here instead, under the legend
                 where a description belongs. Same class as the head's, so
                 there is no second thing to style. AF2-374. -->
            <div v-if="pane.s.fieldset && pane.s.subtitle" class="apex-form__sectionhead" :class="ui?.sectionHead">
              <p>{{ pane.s.subtitle }}</p>
            </div>
            <div class="apex-form__grid" :class="ui?.grid" :style="gridStyle(pane.s)">
              <div v-for="f in shown(pane.s)" :key="f.key || f.label" class="apex-form__cell" :class="ui?.cell"
                   :style="cellStyle(f, pane.s)" :data-type="f.type || 'text'">
                <!-- A read-only field is TEXT, not a disabled control: a greyed
                     input still reads as something the author failed to fill. -->
                <div v-if="readonly || f.readonlyText" class="apex-form__ro" :class="ui?.readonly">
                  <span class="apex-form__rolabel" :class="ui?.readonlyLabel">{{ f.label }}</span>
                  <span class="apex-form__rovalue" :class="ui?.readonlyValue">{{ displayValue(f) }}</span>
                </div>
                <!-- An ACTION, not a value: no ApexField wrapper, no label/help/
                     error, because there is no value to be wrong about. -->
                <ApexSplitButton v-else-if="f.type === 'action-split'" :label="f.label" :model="menuItems(f)"
                                 v-bind="f.props" @click="f.onClick && f.onClick(model)" />
                <ApexSpeedDial v-else-if="f.type === 'action-dial'" :items="dialItems(f)" v-bind="f.props" />
                <!-- A real field (its rows/nodes/value ARE data) but never
                     validated -- "is this blank" is not a question a table,
                     tree, timeline, progress bar or org chart answers. None of
                     the six declare ApexFieldProps, so this bypasses fieldBind
                     entirely (see the comment on DIRECT_BIND_TYPES). Only
                     ApexTree (treeview) emits update:value for real -- drag
                     reorder can change it; the other five are pure display of
                     data the model already holds and are never written back. -->
                <div v-else-if="isDirectBindType(f.type)" class="apex-form__table" :class="ui?.table">
                  <span v-if="f.label" class="apex-form__rolabel" :class="ui?.readonlyLabel">{{ f.label }}</span>
                  <component :is="REGISTRY[control(f).tag]"
                             v-bind="{ ...control(f).props, ...auxBind(f), [directValueProp(f)]: valueOf(f) }"
                             :aria-label="f.label" v-on="auxListeners(f)"
                             @cell-edit-complete="f.type === 'table' && onTableEdit(f)"
                             @row-edit-save="f.type === 'table' && onTableEdit(f)">
                    <!-- ApexDataView's item/grid slots and ApexTimeline's content
                         slot are otherwise slot-driven with NO default text --
                         a plain schema-declared itemLabel names which property of
                         each row to show. Harmless no-op on every other
                         direct-bind control, since none of them define these
                         slot names. -->
                    <template v-if="f.itemLabel" #item="{ item }">{{ item[f.itemLabel] }}</template>
                    <template v-if="f.itemLabel" #content="{ item }">{{ item[f.itemLabel] }}</template>
                  </component>
                </div>
                <!-- `blur` is handed out with `update` because the default
                     markup below wires @blur itself and a custom control
                     cannot: without it a slot-rendered field is touched by
                     nothing, never marked touched, and never sent to the
                     server for validation. The pilot screen's slug -- the one
                     field whose `unique` rule is the entire reason for
                     Precognition -- is slot-rendered. AF2-347. -->
                <slot v-else :name="'field-' + f.key" :field="f" :value="valueOf(f)"
                      :error="errors[f.key || '']" :update="(v: unknown) => onInput(f, v)"
                      :blur="() => onBlur(f)">
                  <!-- The value prop is not always modelValue: ApexEditor takes
                       doc and ApexHTMLEditor takes html. Vue rejects two bare
                       v-bind on one element, so the value entry merges into the
                       same object fieldBind returns. -->
                  <component :is="REGISTRY[control(f).tag]" v-bind="fieldBind(f, valueOf(f))"
                             v-on="{ ['update:' + valueProp(f)]: (v: unknown) => onInput(f, v) }"
                             @blur="onBlur(f)" />
                </slot>
              </div>
            </div>
            </component>
          </section>
        </div>
      </div>

      <footer v-if="actions" class="apex-form__foot" :class="ui?.foot">
        <!-- One slot in the footer, two things to say. They swap rather than
             sit side by side: "Checking…" only ever happens while the form is
             dirty, so showing both would be two labels about the same edit. -->
        <span v-if="validating" class="apex-form__validating" :class="ui?.validating">
          <ApexIcon name="progress_activity" :size="15" spin />Checking…
        </span>
        <span v-else-if="dirty && !processing" class="apex-form__dirty" :class="ui?.dirty">
          <ApexIcon name="edit" :size="15" />Unsaved changes
        </span>
        <span class="apex-form__spacer" :class="ui?.spacer"></span>
        <slot name="actions" :submit="submit" :cancel="cancel" :processing="processing">
          <ApexButton v-apex-ripple="rippleOn" variant="text" severity="secondary" :label="sch.cancelLabel"
                      :disabled="processing" @click="cancel" />
          <ApexButton v-apex-ripple="rippleOn" icon="check" :label="sch.submitLabel" :loading="processing" @click="submit" />
        </slot>
      </footer>
    </form>
    </Transition>

    <Teleport to="body">
      <div v-if="tip" class="apex-form__tiperr" :class="ui?.tabTip" role="tooltip" :id="tabId(tip.i) + '-err'" :style="tipStyle()">
        <b>{{ tip.count }} {{ tip.count === 1 ? 'error' : 'errors' }}</b>
        <span v-for="e in tip.rows" :key="e.key">{{ e.message }}</span>
      </div>
    </Teleport>
  </div>
</template>
