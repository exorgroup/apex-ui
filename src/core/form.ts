/**
 * core/form.ts — ApexForm's engine, with no framework and no Pando in it.
 *
 * ApexForm is a VIEW: it renders a schema, validates locally for immediate
 * feedback, and displays whatever errors it is handed. It never submits. The host
 * owns the verb — an Inertia form, a Precognition form, or a plain object — and
 * ApexForm reads and writes through a DRIVER so there is never a second source of
 * truth for the values.
 *
 * Everything here is pure: schema in, decisions out. The component is markup.
 * Ported from the browser mirror's web/apex-form-core.js — keep the two in step.
 */
import { evalCondition } from './conditions';

/* ─── paths ──────────────────────────────────────────────────────
   Laravel speaks dot notation both ways: a schema key is `user.address.line1`
   and a 422 error arrives under exactly that string. So the path IS the key, and
   nothing needs translating between the two. */
export function getPath(obj: unknown, path: string): unknown {
  if (!obj || !path) return undefined;
  return String(path).split('.').reduce(
    (o: any, k) => (o == null ? undefined : o[k]), obj,
  );
}

export function setPath(obj: Record<string, unknown>, path: string, value: unknown) {
  const parts = String(path).split('.');
  let cur: any = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const k = parts[i];
    /* A numeric segment means the parent is an ARRAY. Creating an object there
       would produce {0:…} which serialises as an object, not a list, and Laravel
       would reject the payload shape rather than the values. */
    if (cur[k] == null || typeof cur[k] !== 'object') {
      cur[k] = /^\d+$/.test(parts[i + 1]) ? [] : {};
    }
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
  return obj;
}

/** Empty for validation: 0 and false are ANSWERS, not absence. */
export function isBlank(v: unknown): boolean {
  if (v === null || v === undefined || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  if (v instanceof File) return false;
  return false;
}

/* ─── rules ──────────────────────────────────────────────────────
   Two authoring surfaces, one internal shape. The pipe DSL exists because it can
   be pasted from a Laravel FormRequest and because a JSON schema emitted by PHP
   can carry it as a string; the object form exists because a TypeScript author
   wants a typed literal. They parse to the same list. */
export interface FormRule { name: string; args: string[] }

/** `'required|max:255|in:a,b'` → [{ name, args }] */
export function parseRuleString(str: string): FormRule[] {
  return String(str).split('|').filter(Boolean).map((part) => {
    const i = part.indexOf(':');
    if (i < 0) return { name: part.trim(), args: [] };
    return { name: part.slice(0, i).trim(), args: part.slice(i + 1).split(',') };
  });
}

export type FormRules = string | Array<string | Record<string, unknown>> | Record<string, unknown>;

export function normaliseRules(rules?: FormRules): FormRule[] {
  if (!rules) return [];
  if (typeof rules === 'string') return parseRuleString(rules);
  if (Array.isArray(rules)) {
    return rules.reduce<FormRule[]>((all, r) => all.concat(
      typeof r === 'string' ? parseRuleString(r) : normaliseRules(r),
    ), []);
  }
  /* object form: { required: true, max: 255, in: ['a','b'] } */
  return Object.keys(rules).reduce<FormRule[]>((all, name) => {
    const v = (rules as Record<string, unknown>)[name];
    if (v === false || v == null) return all;
    return all.concat([{ name, args: v === true ? [] : ([] as unknown[]).concat(v).map(String) }]);
  }, []);
}

export const MESSAGES: Record<string, string> = {
  required: '{label} is required.',
  email: 'Enter a valid email address.',
  url: 'Enter a valid URL.',
  numeric: '{label} must be a number.',
  integer: '{label} must be a whole number.',
  min: '{label} must be at least {0}.',
  max: '{label} must be at most {0}.',
  minLength: '{label} must be at least {0} characters.',
  maxLength: '{label} must be at most {0} characters.',
  between: '{label} must be between {0} and {1}.',
  in: '{label} is not one of the allowed values.',
  regex: '{label} is not in the expected format.',
  confirmed: '{label} does not match its confirmation.',
  same: '{label} must match {0}.',
  different: '{label} must be different from {0}.',
  accepted: '{label} must be accepted.',
  after: '{label} must be after {0}.',
  before: '{label} must be before {0}.',
};

export interface FormField {
  key?: string;
  label?: string;
  type?: string;
  required?: boolean;
  rules?: FormRules;
  messages?: Record<string, string>;
  options?: unknown;
  props?: Record<string, unknown>;
  /**
   * How many of the SECTION's columns this field takes.
   *
   * Unchanged, and deliberately so: `span: 2` in a two-column section has
   * meant "the whole row" since the first schema was written, and three
   * live screens say it. Reinterpreting it as twelfths would have made
   * every one of them a sixth wide, silently. AF2-393.
   */
  span?: number;
  /**
   * How many TWELFTHS this field takes, ignoring the section's columns.
   *
   * The escape hatch for mixed granularity: a section of halves where one
   * field is a third. Named for what it counts, because `cols` beside
   * `columns` is a name nobody would read correctly twice.
   *
   * Only meaningful where the grid is twelve tracks wide — see
   * `gridTracks()`. A section whose `columns` does not divide 12 keeps its
   * own track count, and this is ignored with a warning rather than
   * quietly laying out wrong.
   */
  span12?: number;
  /**
   * The twelfth this field STARTS at, 1–12.
   *
   * Placement rather than flow: it is what lets a field sit under another
   * one in the same column while the row above is a different shape.
   * Same rule as `span12` — twelve-track sections only.
   */
  start?: number;
  visibleIf?: unknown;
  hiddenIf?: unknown;
  disabled?: boolean;
  disabledIf?: unknown;
  /**
   * The control refuses input but still LOOKS like itself.
   *
   * Distinct from `disabled`, and the difference is legibility, not
   * pedantry: a disabled control is drawn in the muted palette, which is
   * correct for "you may not touch this" and wrong for "this is the record".
   * A whole form of disabled controls is a whole form nobody can read —
   * found on the first screen to render a view dialog this way (AF2-313).
   *
   * Use `disabled` for a control that is inert BECAUSE of something else on
   * the form, and `readonly` for a value that is simply not yours to change.
   */
  readonly?: boolean;
  /**
   * This one field renders as TEXT, the way the form-level `readonly` prop
   * renders all of them. For a field that has no sensible control — an id,
   * a computed total — sitting inside a form that is otherwise editable.
   */
  readonlyText?: boolean;
  /* Declared rather than reached for through the index signature below. The
     renderer reads all three, and through `[key: string]: unknown` each
     arrives as `unknown` and cannot be handed to a typed prop — which is the
     same "read what it declares rather than guessing" the design record
     argues for one layer up. AF2-291. */
  /** Rows for an action-split's menu, or an action-dial's actions. */
  items?: unknown[];
  /** An action field's handler; it is given the whole model. */
  onClick?: (model: unknown) => void;
  /** Which property of an object option or item to display. */
  itemLabel?: string;
  [key: string]: unknown;
}

/**
 * The rules ApexForm evaluates in the browser.
 *
 * Deliberately a short list. Laravel has around ninety, and reimplementing them
 * would guarantee drift from the FormRequest that actually decides. Anything not
 * here is SERVER-ONLY: retained on the field, never evaluated locally, and
 * reported as such — so "it looked valid and the server refused it" has an
 * explanation rather than being a mystery.
 */
/**
 * What `min`, `max` and `between` measure — Laravel's rule, faithfully.
 *
 * Laravel does not have one meaning for `max:255`: it measures an array's
 * length, a numeric value's magnitude, and **a string's length**. Which one
 * depends on the value and on whether the field also carries a numeric rule.
 *
 * This was numeric-only, so `Number('rere') <= 255` was `NaN <= 255`, which
 * is **false**, and every text field carrying the most common rule in
 * Laravel — `max:255` — failed with "must be at most 255" against a
 * four-character value. Found on the first screen migrated to a schema built
 * from a real FormRequest (AF2-306). The whole point of accepting the pipe
 * DSL is that it can be pasted from a FormRequest; pasting it and getting a
 * different answer is worse than not accepting it.
 *
 * A field is numeric when it says so — `numeric` or `integer` in its own
 * rules — or when the value already is a number. A digit STRING in a plain
 * text field is measured by length, which is also what Laravel does.
 */
function sizeOf(v: unknown, field?: FormField): number {
  if (Array.isArray(v)) return v.length;
  if (typeof v === 'number') return v;

  const numeric = normaliseRules(field?.rules).some(
    (r) => r.name === 'numeric' || r.name === 'integer',
  );
  if (numeric && v !== '' && !Number.isNaN(Number(v))) return Number(v);

  return String(v ?? '').length;
}

export const LOCAL: Record<string, (v: unknown, a: string[], all?: unknown, field?: FormField) => boolean> = {
  required: (v) => !isBlank(v),
  accepted: (v) => v === true || v === 1 || v === '1' || v === 'yes' || v === 'on',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)),
  url: (v) => /^https?:\/\/[^\s.]+\.\S+$/.test(String(v)),
  numeric: (v) => v !== '' && !Number.isNaN(Number(v)),
  integer: (v) => /^-?\d+$/.test(String(v)),
  /* Laravel's size rules are POLYMORPHIC, and these are written in Laravel's
     notation, so they have to mean what Laravel means — see sizeOf(). */
  min: (v, a, all, field) => sizeOf(v, field) >= Number(a[0]),
  max: (v, a, all, field) => sizeOf(v, field) <= Number(a[0]),
  /* The library's own names, kept: unambiguous where `max` is not. */
  minLength: (v, a) => String(v).length >= Number(a[0]),
  maxLength: (v, a) => String(v).length <= Number(a[0]),
  between: (v, a, all, field) => sizeOf(v, field) >= Number(a[0]) && sizeOf(v, field) <= Number(a[1]),
  in: (v, a) => a.map(String).indexOf(String(v)) > -1,
  /* Laravel's `regex:` rule REQUIRES delimiters — `regex:/^\d+$/i` — and
     JavaScript's RegExp constructor must not be given them: `new
     RegExp('/^\d+$/')` matches the literal characters, slashes and all, so
     the pattern matched NOTHING and every value was reported malformed.
     Found on the payment screen, where `2.5`, `5%` and `0` all came back
     "not in the expected format" while the server accepted them. L/015.

     An undelimited pattern still works, because a rule written for this
     library rather than pasted from a FormRequest has no reason to carry
     them. A pattern that will not compile is left to the server rather
     than thrown on a keystroke — the same treatment every rule the browser
     cannot settle gets. */
  regex: (v, a) => {
    const src = a.join(',');
    const delimited = /^\/(.*)\/([a-z]*)$/s.exec(src);

    try {
      const re = delimited ? new RegExp(delimited[1], delimited[2]) : new RegExp(src);

      return re.test(String(v));
    } catch {
      console.warn('[ApexForm] regex rule ' + src + ' will not compile — left to the server');

      return true;
    }
  },
  same: (v, a, all) => String(v) === String(getPath(all, a[0])),
  different: (v, a, all) => String(v) !== String(getPath(all, a[0])),
  confirmed: (v, a, all, field) => String(v) === String(getPath(all, (field?.key || '') + '_confirmation')),
  after: (v, a, all) => new Date(v as any) > new Date((getPath(all, a[0]) as any) || a[0]),
  before: (v, a, all) => new Date(v as any) < new Date((getPath(all, a[0]) as any) || a[0]),
};

/** True when a rule can only be settled by the server. */
export function isServerOnly(rule: FormRule): boolean { return !LOCAL[rule.name]; }

function fill(template: string, label: string, args: string[]) {
  return String(template).replace(/\{(\w+)\}/g, (_, k) => (
    k === 'label' ? label : (args[Number(k)] != null ? args[Number(k)] : '')
  ));
}

/**
 * One field, checked locally.
 *
 * `required` runs first and stops: a blank field should report that it is
 * required, not that it is not a valid email. Every other rule SKIPS a blank
 * value, because "optional, but an email if given" is the common case and
 * Laravel behaves the same way.
 */
export function validateField(field: FormField, value: unknown, all: unknown): string[] {
  /* The ONE place read-only is decided. `validate()` — the submit path —
     does not repeat it: it calls this function, so a copy there is a
     branch no test can distinguish, which is how dead code gets written.
     A mutation deleting the copy changed nothing, and that is what it was
     telling us.

     A field nobody can edit cannot be wrong, and an error on one is an
     instruction the reader cannot follow. VIEW MODE is the case that
     matters: a page whose fields are read-only (the settings screens, the
     categories view dialog) put a red ring and a message on values the
     server is perfectly happy with, as soon as anything blurred them.

     `disabled` goes with it for the same reason. The server still decides
     — nothing here is a relaxation of what may be saved, because a save
     from a form of read-only fields changes nothing anyway. L/016. */
  if (field.readonly || field.disabled) return [];

  const rules = normaliseRules(field.rules);
  if (field.required && !rules.some((r) => r.name === 'required')) rules.unshift({ name: 'required', args: [] });
  const label = field.label || 'This field';
  const out: string[] = [];
  const blank = isBlank(value);
  for (let i = 0; i < rules.length; i += 1) {
    const r = rules[i];
    if (r.name === 'required') {
      if (blank) return [fill((field.messages || {}).required || MESSAGES.required, label, [])];
      continue;
    }
    if (blank || isServerOnly(r)) continue;
    if (!LOCAL[r.name](value, r.args, all, field)) {
      out.push(fill((field.messages || {})[r.name] || MESSAGES[r.name] || '{label} is invalid.', label, r.args));
    }
  }
  return out;
}

/* ─── conditions ─────────────────────────────────────────────────
   Through core/conditions' evaluator, which is JSON-safe by construction — a
   schema emitted by a server cannot carry a function, so a data expression is
   the only form that survives the round trip. A function is still accepted for
   a TypeScript-authored schema. */
const COND_KEYS = ['field', 'all', 'any', 'not', 'op', 'value', 'eq', 'ne', 'gt', 'gte',
  'lt', 'lte', 'in', 'nin', 'includes', 'truthy', 'falsy', 'empty', 'matches'];

/**
 * `{ custom: true }` means "the field `custom` equals true".
 *
 * The full form is `{ field: 'custom', eq: true }`, and core/conditions has no
 * shorthand — an object of plain keys falls through to its default branch and
 * compares `undefined === undefined`, which is TRUE. So a mis-shaped condition
 * does not error: it silently shows every conditional field and hides every
 * inverse one. That cost a real bug in the mirror, so the shorthand is real here
 * rather than a trap.
 *
 * Several keys are ANDed. Reserved operator keys are left to the real evaluator.
 */
export function expandCondition(cond: unknown): unknown {
  if (!cond || typeof cond !== 'object' || Array.isArray(cond)) return cond;
  const keys = Object.keys(cond as object);
  if (!keys.length || keys.some((k) => COND_KEYS.indexOf(k) > -1)) return cond;
  const parts = keys.map((k) => ({ field: k, eq: (cond as Record<string, unknown>)[k] }));
  return parts.length === 1 ? parts[0] : { all: parts };
}

function truthy(cond: unknown, model: unknown, field?: FormField): boolean {
  if (cond == null) return false;
  if (typeof cond === 'function') return !!cond(model, field);
  const scope = Object.assign({}, model as object, { value: field ? getPath(model, field.key || '') : undefined });
  return !!evalCondition(expandCondition(cond) as any, scope as any);
}

export function isVisible(field: FormField, model: unknown): boolean {
  if (field.visibleIf != null) return truthy(field.visibleIf, model, field);
  if (field.hiddenIf != null) return !truthy(field.hiddenIf, model, field);
  return true;
}

export function isDisabled(field: FormField, model: unknown): boolean {
  if (field.disabled) return true;
  if (field.disabledIf != null) return truthy(field.disabledIf, model, field);
  return false;
}

/* ─── the control map ───────────────────────────────────────────
   A schema `type` names an intent; this decides which Apex control renders it
   and what it needs. Read per control rather than assumed: several take their
   data through their own prop name (`nodes`, not `options`) and one needs a prop
   turned on to be usable at all (a date picker with no `showIcon` has no pointer
   affordance). Getting these wrong is silent — the control renders and holds
   nothing. */
export interface ControlSpec {
  tag: string;
  props?: Record<string, unknown>;
  dataProp?: string;
  valueProp?: string;
}

export const CONTROLS: Record<string, ControlSpec> = {
  text: { tag: 'ApexInput' },
  email: { tag: 'ApexInput', props: { type: 'email' } },
  tel: { tag: 'ApexInput', props: { type: 'tel' } },
  url: { tag: 'ApexInput', props: { type: 'url' } },
  slug: { tag: 'ApexInput', props: { type: 'slug' } },
  password: { tag: 'ApexPassword' },
  textarea: { tag: 'ApexTextarea' },
  number: { tag: 'ApexNumber' },
  /* ApexNumber takes `currency`, not `prefix` — read from the component, not
     assumed. A field may override with `currency: 'GBP'`. */
  money: { tag: 'ApexNumber', props: { currency: 'EUR' } },
  stepper: { tag: 'ApexStepper' },
  select: { tag: 'ApexSelect' },
  multiselect: { tag: 'ApexMultiselect' },
  cascade: { tag: 'ApexCascadeSelect' },
  tree: { tag: 'ApexTreeSelect', dataProp: 'nodes' },
  radio: { tag: 'ApexRadioGroup' },
  cards: { tag: 'ApexRadioGroup', props: { card: true } },
  checkbox: { tag: 'ApexCheckbox' },
  checkboxes: { tag: 'ApexCheckboxGroup' },
  switch: { tag: 'ApexSwitch' },
  segmented: { tag: 'ApexSegmented' },
  selectbutton: { tag: 'ApexSelectButton' },
  togglebutton: { tag: 'ApexToggleButton' },
  date: { tag: 'ApexDatePicker', props: { showIcon: true } },
  datetime: { tag: 'ApexDatePicker', props: { showIcon: true, showTime: true } },
  time: { tag: 'ApexDatePicker', props: { showIcon: true, timeOnly: true } },
  color: { tag: 'ApexColorPicker' },
  rating: { tag: 'ApexRating' },
  slider: { tag: 'ApexSlider' },
  knob: { tag: 'ApexKnob' },
  tags: { tag: 'ApexTags' },
  otp: { tag: 'ApexOtp' },
  listbox: { tag: 'ApexListbox' },
  orderlist: { tag: 'ApexOrderList' },
  picklist: { tag: 'ApexPickList' },
  file: { tag: 'ApexFileUpload' },
  /* Its value prop is doc, not modelValue -- ApexForm binds whichever prop
     valueProp names. */
  richtext: { tag: 'ApexEditor', valueProp: 'doc' },
  /* Its value prop is html, not modelValue. */
  html: { tag: 'ApexHTMLEditor', valueProp: 'html' },
  /* ApexDataTable's rows prop is `value`, and it has NO update:value emit at
     all -- wiring it through the generic update:valueProp listener would
     silently do nothing, the same class of bug ApexOrderList's selection and
     the editors' value prop already were. `commitEdits` (on by default here)
     makes ApexDataTable mutate the row objects IN PLACE, and since the array
     bound to `value` is the same array reference the model holds, that mutation
     lands in the model with no v-model round trip needed at all. ApexForm only
     has to notice it happened -- see the cell-edit-complete / row-edit-save
     listeners below. */
  table: { tag: 'ApexDataTable', props: { commitEdits: true }, valueProp: 'value' },
  /* The five below all take `value` for their real prop name, not `modelValue`
     -- same shape as `table`, so they share its DIRECT_BIND_TYPES treatment
     (bypassing ApexField's label/help/required/etc, which none of them declare)
     and its exemption from validation: a progress bar or an org chart is not
     "required". Only ApexTree actually emits `update:value` (drag-reorder can
     mutate it); the other four are pure display of data the model already
     holds, so their value is read but never written back. */
  treetable: { tag: 'ApexTreeTable', valueProp: 'value' },
  /* Named `treeview`, not `tree` -- that key is ApexTreeSelect (a dropdown). */
  treeview: { tag: 'ApexTree', valueProp: 'value' },
  timeline: { tag: 'ApexTimeline', valueProp: 'value' },
  progress: { tag: 'ApexProgressBar', valueProp: 'value' },
  orgchart: { tag: 'ApexOrgChart', valueProp: 'value' },
  /* ApexDataView: same story as table -- value=Array, no update:value, but it
     DOES take a caption/layout switcher of its own, all covered by auxKeys. */
  dataview: { tag: 'ApexDataView', valueProp: 'value' },
  /* ApexPaginator has no `value` at all -- its own bindable prop is `first`
     (a zero-based page offset), and it genuinely emits update:first, so it is
     the one DIRECT_BIND type besides treeview that writes back for real. */
  paginator: { tag: 'ApexPaginator', valueProp: 'first' },
};

/**
 * Types bound directly to `:value`, bypassing ApexField's generic wrapper
 * entirely (label/help/required/disabled/readonly/error/name) -- none of these
 * six declare ApexFieldProps, so that block would fall through as stray DOM
 * attributes exactly like `table`'s `modelvalue="[object Object]"` bug.
 */
export const DIRECT_BIND_TYPES = new Set([
  'table', 'treetable', 'treeview', 'timeline', 'progress', 'orgchart', 'dataview', 'paginator',
]);
export function isDirectBindType(type?: string): boolean { return !!type && DIRECT_BIND_TYPES.has(type); }

/**
 * Schema types that are not fields at all -- an ACTION, not a value.
 *
 * `action-split` and `action-dial` render their control directly with no
 * ApexField wrapper (no label/help/error, because there is no value to be
 * wrong about) and are skipped entirely by validation and by
 * `sectionErrorCount`: a button cannot be "required".
 */
export const DISPLAY_TYPES = new Set(['action-split', 'action-dial']);
export function isDisplayType(type?: string): boolean { return !!type && DISPLAY_TYPES.has(type); }
/** A table is a real field (its rows are data) but never validated -- "is this
    blank" is not a question a grid answers. */
export function isUnvalidatedType(type?: string): boolean { return isDirectBindType(type) || isDisplayType(type); }

/**
 * Drops props the control does not declare, and SAYS which.
 *
 * Four times in this project a prop name was assumed rather than read —
 * `options` where a tree wants `nodes`, `source` where a pick list wants its
 * model, `prefix` where a number wants `currency`. Every one was silent: the
 * control rendered and simply held nothing, or Vue warned from deep inside a
 * component the schema author never wrote. \`knownComponents\` is supplied by the
 * caller (the mirror keys by kebab-case tag, the SFC by import), so the mapper
 * can check rather than guess, and an unknown prop becomes one clear message
 * naming the field.
 */
const WARNED: Record<string, boolean> = {};
export function knownProps(
  tag: string,
  props: Record<string, unknown>,
  field: FormField,
  declaredProps?: Record<string, unknown>,
): Record<string, unknown> {
  if (!declaredProps) return props;
  const out: Record<string, unknown> = {};
  const dropped: string[] = [];
  Object.keys(props).forEach((k) => {
    if (k in declaredProps || k === 'modelValue') out[k] = props[k];
    else dropped.push(k);
  });
  if (dropped.length) {
    const sig = tag + ':' + dropped.join(',');
    if (!WARNED[sig]) {
      WARNED[sig] = true;
      // eslint-disable-next-line no-console
      console.warn('[ApexForm] ' + tag + ' does not declare ' + dropped.join(', ')
        + ' — dropped from field "' + (field.key || field.label) + '". Check the control\'s props.');
    }
  }
  return out;
}

/** The control tag and props for one schema field, BEFORE the known-props filter
    (the caller supplies the declared-prop set, since only it knows the registry). */
export function controlFor(field: FormField): { tag: string; valueProp: string; props: Record<string, unknown> } {
  const spec = CONTROLS[field.type as string] || CONTROLS.text;
  const props: Record<string, unknown> = Object.assign({}, spec.props || {});
  /* Kept OUT of props: written into props once, it was spread straight onto
     every control by fieldBind, so all declared-nothing controls picked up an
     undeclared __valueProp and knownProps rightly flagged every one. */
  const valueProp = spec.valueProp || 'modelValue';
  if (field.options) props[spec.dataProp || 'options'] = field.options;
  (['placeholder', 'min', 'max', 'step', 'rows', 'maxlength', 'unit', 'currency', 'precision',
    'multiple', 'accept', 'stars', 'showTime', 'filter', 'clearable', 'mask', 'inline',
    'columns', 'dataKey',
  ] as const).forEach((k) => { if ((field as any)[k] !== undefined) props[k] = (field as any)[k]; });
  Object.assign(props, field.props || {});
  return { tag: spec.tag, valueProp, props };
}

/* ─── the schema ─────────────────────────────────────────────────
   Normalised once so the component never branches on shorthand. A section may be
   omitted entirely (a flat field list), which is what a small form wants and
   what every schema example starts as. */
export interface FormSection {
  id: string;
  title?: string;
  subtitle?: string;
  icon?: string;
  columns: number;
  fields: FormField[];
  fieldset?: boolean;
  legend?: string;
  toggleable?: boolean;
  /**
   * The space between this section's fields — one CSS gap value, or a
   * number read as pixels. Overrides the app-wide `formGap` option;
   * unset, the stylesheet's `18px 20px` stands. AF2-394.
   */
  gap?: string | number;
  /**
   * A class on THIS section's element, for a host that needs to style one
   * group and not the others.
   *
   * Declared rather than left to the index signature below, for the same
   * reason `items` is: the renderer reads it, and through
   * `[key: string]: unknown` it arrives as `unknown`. The `ui` map cannot
   * do this job — it is form-wide, so `ui.cell` is every cell in the form.
   */
  class?: string;
  [key: string]: unknown;
}

export interface NormalisedSchema {
  title?: string;
  subtitle?: string;
  icon?: string;
  shell: 'page' | 'modal';
  layout: 'long' | 'tabs' | 'sidebar';
  submitLabel: string;
  cancelLabel: string;
  sections: FormSection[];
  rules: unknown[];
}

export interface FormSchema {
  title?: string;
  subtitle?: string;
  icon?: string;
  shell?: string;
  layout?: string;
  submitLabel?: string;
  cancelLabel?: string;
  sections?: Array<Partial<FormSection>>;
  fields?: FormField[];
  columns?: number;
  rules?: unknown[];
}

/**
 * How many tracks a section's grid actually has — AF2-393.
 *
 * TWELVE whenever the section's column count divides into it, which is
 * every count a form has ever used (1, 2, 3, 4, 6, 12). Twelve tracks with
 * every field spanning `12 / columns` lays out identically to `columns`
 * tracks spanning one — same fractions, same gaps — and it is what makes
 * `span12` and `start` possible: a section of halves can hold a field that
 * is a third, which two tracks cannot express at all.
 *
 * A count that does NOT divide 12 keeps its own tracks. Scaling would need
 * a fractional span, and a grid cannot have one; `columns: 5` renders as
 * five tracks exactly as before, and the twelfths keys are refused there
 * rather than being applied to a grid they do not describe.
 */
export function gridTracks(columns: number): number {
  const n = Math.max(1, Math.floor(columns) || 1);

  return 12 % n === 0 ? 12 : n;
}

/**
 * One field's placement, in the tracks `gridTracks()` decided.
 *
 * Returns the span and, when asked for, the starting track. The caller
 * writes them as CUSTOM PROPERTIES rather than as `grid-column`, so the
 * stylesheet can override the whole lot when the container is too narrow
 * to be a grid at all — an inline `grid-column` cannot be beaten by a
 * media query, which is why a narrow form used to grow an implicit column
 * instead of stacking.
 */
export function cellPlacement(
  field: FormField,
  section: Pick<FormSection, 'columns'>,
  warn?: (message: string) => void,
): { span: number; start?: number } {
  const columns = Math.max(1, Math.floor(section.columns) || 1);
  const tracks = gridTracks(columns);
  const twelve = tracks === 12;

  if (! twelve && (field.span12 || field.start) && warn) {
    warn(`[ApexForm] span12/start need a grid of 12 tracks, and columns: ${columns} does not divide 12`
      + ` — ignored on field "${field.key || field.label}".`);
  }

  const scaled = Math.min(Math.max(1, Math.floor(field.span || 1)), columns) * (tracks / columns);
  const span = twelve && field.span12
    ? Math.min(Math.max(1, Math.floor(field.span12)), 12)
    : scaled;
  const start = twelve && field.start
    ? Math.min(Math.max(1, Math.floor(field.start)), 12)
    : undefined;

  /* A field placed at 9 that wants 6 would run off the end, and the grid
     would answer by inventing tracks. Clamp to what is left. */
  return { span: start ? Math.min(span, 13 - start) : span, start };
}

/** One or two CSS lengths, which is what the `gap` shorthand accepts. */
const GAP = /^(0|-?\d*\.?\d+(px|rem|em|%|ch|vw|vh))(\s+(0|-?\d*\.?\d+(px|rem|em|%|ch|vw|vh)))?$/;

/**
 * The space between a section's fields — AF2-394.
 *
 * Resolved the way every other look-and-feel default in the kit is: the
 * section wins, then the app-wide option, then nothing — and nothing means
 * the stylesheet's own `18px 20px`, so a form that says neither is
 * unchanged.
 *
 * A bare number is read as pixels, because `gap: 8` is what everyone
 * writes first.
 *
 * VALIDATED, and that is not fussiness: the value lands in a custom
 * property, and an invalid custom property makes the whole `gap`
 * declaration invalid at computed-value time — so `'8x'` would not fall
 * back to the default, it would collapse every field in the form onto its
 * neighbour. A typo should not flatten a form silently.
 */
export function gridGap(
  section: Pick<FormSection, 'gap'>,
  option?: string | number,
  warn?: (message: string) => void,
): string | undefined {
  const raw = section.gap ?? option;
  if (raw == null || raw === '') return undefined;

  const value = typeof raw === 'number' ? `${raw}px` : String(raw).trim();

  if (!GAP.test(value)) {
    if (warn) warn(`[ApexForm] gap "${value}" is not one or two CSS lengths — ignored, `
      + 'because an invalid value would collapse the grid rather than fall back.');

    return undefined;
  }

  return value;
}

export function normalise(schema?: FormSchema): NormalisedSchema {
  const s = schema || {};
  const sections: FormSection[] = (s.sections || [{ fields: s.fields || [] }]).map((sec, i) => Object.assign(
    {},
    sec,
    {
      /* Spread first, named keys second. Rebuilding a section from a fixed list
         silently dropped every key the list did not name -- `fieldset` never
         reached the component, and each new schema key would have needed an edit
         here as well as where it is used. */
      id: sec.id || ('s' + i),
      title: sec.title,
      subtitle: sec.subtitle,
      icon: sec.icon,
      /* Columns live on the SECTION and spans on the field: one number to reason
         about per group, and a JSON schema can carry both. */
      columns: sec.columns || s.columns || 1,
      fields: (sec.fields || []).map((f) => Object.assign({}, f, { span: f.span || 1 })),
    },
  )) as FormSection[];
  return {
    title: s.title,
    subtitle: s.subtitle,
    icon: s.icon,
    shell: s.shell === 'page' ? 'page' : 'modal',
    layout: (['long', 'tabs', 'sidebar'].indexOf(s.layout as string) > -1 ? s.layout : 'long') as NormalisedSchema['layout'],
    submitLabel: s.submitLabel || 'Save changes',
    cancelLabel: s.cancelLabel || 'Cancel',
    sections,
    rules: s.rules || [],
  };
}

/** Every field in the schema, flat — for validation and for a summary. */
export function allFields(schema: NormalisedSchema): FormField[] {
  return schema.sections.reduce<FormField[]>((all, sec) => all.concat(sec.fields), []);
}

/**
 * The whole form, checked locally.
 *
 * Invisible fields are SKIPPED. Blocking a submit on a field the author cannot
 * see is the worst failure a conditional form has, and it is silent: the summary
 * names a field that is not on screen.
 */
export function validate(schema: NormalisedSchema, model: unknown): { errors: Record<string, string[]>; ok: boolean } {
  const errors: Record<string, string[]> = {};
  allFields(schema).forEach((f) => {
    if (!f.key || !isVisible(f, model) || isUnvalidatedType(f.type)) return;
    const msgs = validateField(f, getPath(model, f.key), model);
    if (msgs.length) errors[f.key] = msgs;
  });
  return { errors, ok: Object.keys(errors).length === 0 };
}

/** Fields whose rules cannot be settled in the browser — for honest reporting. */
export function serverOnlyFields(schema: NormalisedSchema): (string | undefined)[] {
  return allFields(schema).filter((f) => normaliseRules(f.rules).some(isServerOnly)).map((f) => f.key);
}

/* ─── the driver ─────────────────────────────────────────────────
   The values live in ONE place. Given an Inertia or Precognition form, that place
   is the host's form object; given nothing, ApexForm makes an internal one.
   Never both — two sources of truth for form state is the defect this whole
   project keeps paying for in other shapes.

   Capability detection rather than two code paths: a Precognition form has
   `validate(field)`, so per-field server validation happens; an Inertia form does
   not, so the local rules are the only pre-submit feedback and the server speaks
   on submit. */
export interface FormDriver {
  kind: 'precognition' | 'inertia' | 'internal';
  get(path: string): unknown;
  set(path: string, v: unknown): void;
  values?(): unknown;
  serverErrors(): Record<string, string[]>;
  clearError(path?: string): void;
  validateField: ((path: string) => void) | null;
  validating(): boolean;
  processing(): boolean;
}

/**
 * The object a host form keeps its values in.
 *
 * A plain `data` object when the host has one; the form itself when `data` is
 * a method, which is what both Inertia and Precognition ship.
 */
export function bag(f: any): Record<string, unknown> {
  return f && f.data && typeof f.data !== 'function' ? f.data : f;
}

export function makeDriver(form: unknown, initial?: unknown): FormDriver {
  const f = form as any;
  if (f && typeof f === 'object' && (f.errors || typeof f.post === 'function')) {
    const hasPrecog = typeof f.validate === 'function';
    return {
      kind: hasPrecog ? 'precognition' : 'inertia',
      /* Inertia exposes the data as the form's own properties, so the form IS
         the value object as far as a path read is concerned.

         `typeof f.data !== 'function'` is load-bearing. Inertia's useForm
         carries **`data()` as a METHOD**, not a `data` property, so a bare
         `f.data ?` is truthy and every path was read off the function
         object — `get('name')` returned the string "data", because that is a
         function's own `.name`, and every write landed on the function and
         vanished. It would have looked like the library ignoring the host
         form. laravel-precognition-vue has the same shape, so this guard
         serves both. AF2-306, found wiring the first real screen. */
      get: (path: string) => getPath(bag(f), path),
      set: (path: string, v: unknown) => setPath(bag(f), path, v),
      serverErrors: () => f.errors || {},
      clearError: (path?: string) => { if (f.clearErrors) f.clearErrors(path); },
      validateField: hasPrecog ? (path: string) => f.validate(path) : null,
      validating: () => (hasPrecog ? !!f.validating : false),
      processing: () => !!f.processing,
    };
  }
  const state = { values: JSON.parse(JSON.stringify(initial || {})) };
  return {
    kind: 'internal',
    get: (path: string) => getPath(state.values, path),
    set: (path: string, v: unknown) => setPath(state.values, path, v),
    values: () => state.values,
    serverErrors: () => ({}),
    clearError: () => {},
    validateField: null,
    validating: () => false,
    processing: () => false,
  };
}
