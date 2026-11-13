<script setup lang="ts">
/**
 * ApexKeyPad — an on-screen number pad: a till's keypad and a PIN pad are the same control.
 *
 * - `v-model` is the entry as a string (`12.5`, `3+2`, `0042`).
 * - Keys are switched on one by one: `operators` (+ − × ÷), `enter`, `del`, `dot`, `clear`,
 *   `double-zero`; the screen adds its own with `function-keys`.
 * - A sum is worked out in standard order (× ÷ first) by `core/keypad`, never `eval`. `enter` and a
 *   function key emit the RESULT; a sum that cannot be worked out shows "Can't work that out",
 *   emits nothing, and the next key clears it.
 * - `randomise` shuffles the ten digits each time the pad appears and — unless `reshuffle` is off —
 *   after each entry; every other key keeps its place. `mask` shows ● for each digit.
 * - Keys are at least 44 px. Digits, `.`, the operators, Enter, Backspace and Escape typed on a
 *   physical keyboard work while the pad has focus.
 * - `secure` makes it a PIN pad that gives nothing away (TBX TL6 D12, Till P-D53 / D54): the digits are
 *   shuffled each time it appears and after each entry, masked; a physical keyboard is IGNORED (a PIN is
 *   never typed); a pressed key looks exactly like a resting one — no hover, press or focus change, and a
 *   tap never moves the focus onto the key; a screen reader hears "PIN key" and "N digits entered", never
 *   the digits. Someone who cannot use it signs in another way (an NFC card).
 */
import { computed, onMounted, ref } from 'vue';
import {
  OPERATOR_GLYPH, OPERATOR_NAME, KEYPAD_OPERATORS, displayText, evaluate, press, shuffledDigits, digitCount,
  type KeyPadOperator, type KeyPadFunctionKey,
} from '../core/keypad';

const props = withDefaults(defineProps<{
  modelValue?: string | null;
  /** + − × ÷ — `true` for all four, or the ones wanted. */
  operators?: boolean | KeyPadOperator[];
  enter?: boolean;
  del?: boolean;
  dot?: boolean;
  clear?: boolean;
  doubleZero?: boolean;
  /** Shuffle the digits each time the pad appears. */
  randomise?: boolean;
  /** With `randomise`: shuffle again after each entry (on), or keep the layout until the pad appears again (off). */
  reshuffle?: boolean;
  /** Show ● for each digit, as a PIN pad does. */
  mask?: boolean;
  /** Digits the entry may hold. */
  maxLength?: number;
  /** Emit `enter` by itself once `max-length` digits are in. */
  autoSubmit?: boolean;
  /** Places a result may carry; a result needing more is refused, never rounded. */
  decimals?: number;
  /** `calculator`: 7-8-9 on top. `phone`: 1-2-3 on top. */
  layout?: 'calculator' | 'phone';
  /** Show the entry above the keys. */
  display?: boolean;
  /** The screen's own keys; each emits `function` with the result. */
  functionKeys?: KeyPadFunctionKey[];
  /** The label of the enter key. */
  enterLabel?: string;
  /** What the display says when empty. */
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** The pad's accessible name. */
  label?: string;
  /** A PIN pad that reveals nothing: shuffled, masked, no keyboard input, no pressed-key highlight, digits not spoken. */
  secure?: boolean;
}>(), {
  modelValue: '', operators: false, enter: true, del: true, dot: false, clear: false, doubleZero: false,
  randomise: false, reshuffle: true, mask: false, autoSubmit: false, decimals: 2, layout: 'calculator', display: true,
  functionKeys: () => [], enterLabel: 'Enter', placeholder: '0', size: 'md', disabled: false, label: 'Number pad',
  secure: false,
});

/* `secure` switches on what a PIN pad must have, whatever else was passed. */
const shuffled = computed(() => props.randomise || props.secure);
const masked = computed(() => props.mask || props.secure);

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'enter', v: string): void;
  (e: 'function', id: string, v: string): void;
}>();

const entry = computed(() => String(props.modelValue ?? ''));
const failed = ref(false);
/* A pad with no operators and no dot enters a CODE (a PIN): its leading zeros are kept. */
const rules = computed(() => ({
  decimals: props.dot ? props.decimals : 0,
  maxLength: props.maxLength,
  code: !props.dot && props.operators === false,
}));

const ops = computed<KeyPadOperator[]>(() =>
  props.operators === true ? [...KEYPAD_OPERATORS] : Array.isArray(props.operators) ? KEYPAD_OPERATORS.filter((o) => (props.operators as KeyPadOperator[]).includes(o)) : []);

/* The ten digit slots, top row first; randomise puts a shuffled digit in each slot. */
const order = ref<string[]>([]);
const slots = computed(() => {
  if (shuffled.value && order.value.length === 10) return order.value;
  return props.layout === 'phone'
    ? ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    : ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'];
});
function shuffle() { if (shuffled.value) order.value = shuffledDigits(); }
onMounted(shuffle);
/** After an entry: a new layout, unless the pad keeps it. */
function afterEntry() { if (props.reshuffle || props.secure) shuffle(); }

/* The bottom digit row: [00 or . or blank] [the tenth digit] [. when both, else blank]. */
const bottomLeft = computed(() => (props.doubleZero ? '00' : props.dot ? '.' : ''));
const bottomRight = computed(() => (props.doubleZero && props.dot ? '.' : ''));

const actions = computed(() => [
  props.clear && { key: 'clear', label: 'CL', name: 'Clear' },
  props.del && { key: 'del', label: '⌫', name: 'Delete' },
  props.enter && { key: 'enter', label: props.enterLabel, name: props.enterLabel },
].filter(Boolean) as { key: string; label: string; name: string }[]);

const shown = computed(() => {
  if (failed.value) return "Can't work that out";
  if (!entry.value) return '';
  return masked.value ? '●'.repeat(digitCount(entry.value)) : displayText(entry.value);
});
/* What a screen reader hears from a secure pad's display — how many, never which. */
const spoken = computed(() => {
  const n = digitCount(entry.value);
  return n === 1 ? '1 digit entered' : `${n} digits entered`;
});
/* A secure pad's digit keys are all named alike, so the layout is never read out. */
const digitLabel = computed(() => (props.secure ? 'PIN key' : undefined));
/* A tap on a secure pad must not move the focus (a focus ring would mark the key). */
function hold(e: Event) { if (props.secure) e.preventDefault(); }

function set(next: string) {
  if (next !== entry.value) emit('update:modelValue', next);
}

/*
 * No disabled checks below: a disabled pad (or function key) draws its buttons `disabled`, so no click
 * arrives, and `onKeydown` refuses while disabled — the only two ways in.
 */
function key(k: string) {
  if (k === 'enter') return submit();
  const base = failed.value ? '' : entry.value;
  failed.value = false;
  const next = press(base, k, rules.value);
  set(next);
  if (props.autoSubmit && props.maxLength !== undefined && /^\d$|^00$/.test(k) && digitCount(next) === props.maxLength && next !== base) submit(next);
}

/** Work the sum out; null (and the message) when it cannot be. */
function result(of = entry.value): string | null {
  const v = evaluate(of, rules.value);
  if (v === null) { if (of !== '') failed.value = true; return null; }
  return v;
}

function submit(of = entry.value) {
  const v = result(of);
  if (v === null) return;
  emit('enter', v);
  afterEntry();
}

function fn(f: KeyPadFunctionKey) {
  const v = result();
  if (v === null) return;
  emit('function', f.id, v);
  afterEntry();
}

function onKeydown(e: KeyboardEvent) {
  /* A PIN is never typed on a keyboard (P-D53): a secure pad ignores every key. */
  if (props.secure || props.disabled || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  let mapped: string | null = null;
  if (/^\d$/.test(k)) mapped = k;
  else if ((k === '.' || k === ',') && props.dot) mapped = '.';
  else if (k === 'x' || k === 'X') mapped = ops.value.includes('*') ? '*' : null;
  else if (['+', '-', '*', '/'].includes(k)) mapped = ops.value.includes(k as KeyPadOperator) ? k : null;
  else if ((k === 'Enter' || k === '=') && props.enter) mapped = 'enter';
  else if (k === 'Backspace' && props.del) mapped = 'del';
  else if ((k === 'Escape' || k === 'Delete') && props.clear) mapped = 'clear';
  if (mapped === null) return;
  e.preventDefault();
  key(mapped);
}

defineExpose({ shuffle });
</script>

<template>
  <div class="apex-keypad" :data-size="size" :data-layout="layout" :data-disabled="disabled ? 'true' : 'false'"
       :data-operators="ops.length ? 'true' : 'false'" :data-functions="functionKeys.length ? 'true' : 'false'"
       :data-secure="secure ? 'true' : 'false'" role="group" :aria-label="label" :tabindex="secure ? -1 : 0"
       @keydown="onKeydown" @mousedown="hold" @pointerdown="hold">
    <div v-if="display" class="apex-keypad__display" :data-error="failed ? 'true' : 'false'" aria-live="polite"
         :aria-label="secure ? spoken : undefined">
      <span v-if="shown" class="apex-keypad__entry">{{ shown }}</span>
      <span v-else class="apex-keypad__placeholder">{{ placeholder }}</span>
    </div>
    <div class="apex-keypad__body">
      <div class="apex-keypad__digits">
        <button v-for="(d, i) in slots.slice(0, 9)" :key="'d' + i" type="button" class="apex-keypad__key"
                :disabled="disabled" :data-key="d" :aria-label="digitLabel" :tabindex="secure ? -1 : undefined" @click="key(d)">{{ d }}</button>
        <button v-if="bottomLeft" type="button" class="apex-keypad__key" :disabled="disabled" :data-key="bottomLeft"
                :aria-label="bottomLeft === '.' ? 'Decimal point' : 'Double zero'" @click="key(bottomLeft)">{{ bottomLeft }}</button>
        <span v-else class="apex-keypad__gap" aria-hidden="true" />
        <button type="button" class="apex-keypad__key" :disabled="disabled" :data-key="slots[9]" :aria-label="digitLabel"
                :tabindex="secure ? -1 : undefined" @click="key(slots[9])">{{ slots[9] }}</button>
        <button v-if="bottomRight" type="button" class="apex-keypad__key" :disabled="disabled" data-key="." aria-label="Decimal point"
                @click="key('.')">.</button>
        <span v-else class="apex-keypad__gap" aria-hidden="true" />
      </div>
      <div v-if="ops.length" class="apex-keypad__ops">
        <button v-for="o in ops" :key="o" type="button" class="apex-keypad__key apex-keypad__key--op" :disabled="disabled"
                :data-key="o" :aria-label="OPERATOR_NAME[o]" @click="key(o)">{{ OPERATOR_GLYPH[o] }}</button>
      </div>
      <div v-if="functionKeys.length" class="apex-keypad__fns">
        <button v-for="f in functionKeys" :key="f.id" type="button" class="apex-keypad__key apex-keypad__key--fn"
                :disabled="disabled || f.disabled" :data-fn="f.id" @click="fn(f)">{{ f.label }}</button>
      </div>
    </div>
    <div v-if="actions.length" class="apex-keypad__actions">
      <button v-for="a in actions" :key="a.key" type="button" class="apex-keypad__key"
              :class="`apex-keypad__key--${a.key}`" :disabled="disabled" :data-key="a.key" :aria-label="a.name"
              :tabindex="secure ? -1 : undefined" @click="key(a.key)">{{ a.label }}</button>
    </div>
  </div>
</template>
