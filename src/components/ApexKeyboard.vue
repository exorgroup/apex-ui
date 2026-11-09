<script setup lang="ts">
/**
 * ApexKeyboard — an on-screen keyboard for a touch screen with no keyboard of its own (a till's search).
 *
 * - `v-model` is the text typed. Letters are typed in lower case; `shift` adds a Shift key that
 *   capitalises the next letter (tap twice to lock).
 * - Keys switch on one by one: `enter`, `del`, `clear`, `space`, `hide`; `digits` the top row;
 *   `extra-letters` a row of letters the language needs (Maltese: ċ ġ ħ ż).
 * - Pressing a key never takes the focus: the field being typed into keeps its caret.
 * - Keys are at least 44 px. While the keyboard itself has focus, a physical keyboard types too.
 * - Laid out like a desktop keyboard: every character key is ONE unit wide, the others fixed multiples
 *   (⌫ 3, Enter and Shift 2.25, Clear and Hide 2.5, Space 8), the letter rows staggered, all on a
 *   13-unit board centred in the space. The unit follows the board's width up to
 *   `--apex-keyboard-key-max` — a wide key never takes the rest of its row.
 */
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
  modelValue?: string | null;
  enter?: boolean;
  del?: boolean;
  clear?: boolean;
  space?: boolean;
  /** A Hide key, emitting `hide`. */
  hide?: boolean;
  /** The digits row. */
  digits?: boolean;
  /** A Shift key: the next letter in capitals; twice locks. */
  shift?: boolean;
  /** Letters the language needs beyond A–Z, shown as their own row (e.g. ['ċ', 'ġ', 'ħ', 'ż']). */
  extraLetters?: string[];
  /** Characters the text may hold. */
  maxLength?: number;
  enterLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** The keyboard's accessible name. */
  label?: string;
}>(), {
  modelValue: '', enter: true, del: true, clear: true, space: true, hide: false, digits: true, shift: false,
  extraLetters: () => [], enterLabel: 'Enter', size: 'md', disabled: false, label: 'Keyboard',
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'enter', v: string): void;
  (e: 'hide'): void;
}>();

const ROWS = ['qwertyuiop', 'asdfghjkl-', 'zxcvbnm@.'];

/** off → once (next letter) → lock → off. */
const caps = ref<'off' | 'once' | 'lock'>('off');
const text = computed(() => String(props.modelValue ?? ''));
const upper = computed(() => caps.value !== 'off');

const shown = (ch: string) => (upper.value ? ch.toLocaleUpperCase() : ch);

function type(ch: string) {
  if (props.maxLength !== undefined && text.value.length >= props.maxLength) return;
  emit('update:modelValue', text.value + shown(ch));
  if (caps.value === 'once' && /\p{L}/u.test(ch)) caps.value = 'off';
}

function press(key: string) {
  if (key === 'enter') return emit('enter', text.value);
  if (key === 'hide') return emit('hide');
  if (key === 'shift') { caps.value = caps.value === 'off' ? 'once' : caps.value === 'once' ? 'lock' : 'off'; return; }
  if (key === 'del') return text.value && emit('update:modelValue', text.value.slice(0, -1));
  if (key === 'clear') return text.value && emit('update:modelValue', '');
  if (key === 'space') return type(' ');
  type(key);
}

/* A physical keyboard, while the on-screen one has focus. */
function onKeydown(e: KeyboardEvent) {
  if (props.disabled || e.ctrlKey || e.metaKey || e.altKey) return;
  let key: string | null = null;
  if (e.key === 'Enter' && props.enter) key = 'enter';
  else if (e.key === 'Backspace' && props.del) key = 'del';
  else if (e.key === 'Escape' && props.hide) key = 'hide';
  else if (e.key === ' ' && props.space) key = 'space';
  else if ([...e.key].length === 1 && e.key !== ' ') {
    if (props.maxLength !== undefined && text.value.length >= props.maxLength) { e.preventDefault(); return; }
    e.preventDefault();
    emit('update:modelValue', text.value + e.key);
    return;
  }
  if (key === null) return;
  e.preventDefault();
  press(key);
}
</script>

<template>
  <div class="apex-keyboard" :data-size="size" :data-disabled="disabled ? 'true' : 'false'" role="group" :aria-label="label"
       tabindex="0" @keydown="onKeydown" @mousedown.prevent>
    <div v-if="digits" class="apex-keyboard__row" data-row="digits">
      <button v-for="d in '1234567890'" :key="d" type="button" class="apex-keyboard__key" :disabled="disabled" :data-key="d"
              tabindex="-1" @click="press(d)">{{ d }}</button>
      <button v-if="del" type="button" class="apex-keyboard__key apex-keyboard__key--wide" :disabled="disabled" data-key="del"
              aria-label="Delete" tabindex="-1" @click="press('del')">⌫</button>
    </div>
    <div v-for="(row, r) in ROWS" :key="r" class="apex-keyboard__row" :data-row="r">
      <button v-if="r === 2 && shift" type="button" class="apex-keyboard__key apex-keyboard__key--wide" :disabled="disabled"
              data-key="shift" :data-caps="caps" :aria-pressed="caps !== 'off'" aria-label="Shift" tabindex="-1"
              @click="press('shift')">⇧</button>
      <button v-for="ch in row" :key="ch" type="button" class="apex-keyboard__key" :disabled="disabled" :data-key="ch"
              tabindex="-1" @click="press(ch)">{{ shown(ch) }}</button>
      <button v-if="r === 0 && del && !digits" type="button" class="apex-keyboard__key apex-keyboard__key--wide" :disabled="disabled"
              data-key="del" aria-label="Delete" tabindex="-1" @click="press('del')">⌫</button>
      <button v-if="r === 1 && enter" type="button" class="apex-keyboard__key apex-keyboard__key--wide apex-keyboard__key--enter"
              :disabled="disabled" data-key="enter" tabindex="-1" @click="press('enter')">{{ enterLabel }}</button>
    </div>
    <div v-if="extraLetters.length" class="apex-keyboard__row" data-row="extra">
      <button v-for="ch in extraLetters" :key="ch" type="button" class="apex-keyboard__key" :disabled="disabled" :data-key="ch"
              tabindex="-1" @click="press(ch)">{{ shown(ch) }}</button>
    </div>
    <div v-if="clear || space || hide" class="apex-keyboard__row" data-row="bottom">
      <button v-if="clear" type="button" class="apex-keyboard__key apex-keyboard__key--wide" :disabled="disabled" data-key="clear"
              tabindex="-1" @click="press('clear')">Clear</button>
      <button v-if="space" type="button" class="apex-keyboard__key apex-keyboard__key--space" :disabled="disabled" data-key="space"
              tabindex="-1" @click="press('space')">Space</button>
      <button v-if="hide" type="button" class="apex-keyboard__key apex-keyboard__key--wide" :disabled="disabled" data-key="hide"
              aria-label="Hide the keyboard" tabindex="-1" @click="press('hide')">Hide ⌄</button>
    </div>
  </div>
</template>
