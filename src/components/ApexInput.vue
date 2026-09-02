<script setup lang="ts">
/**
 * ApexInput — text / email / tel / url / slug / password / search.
 * Affixes (prefix, suffix), leading + trailing icons, a clickable trailing
 * action, clear button, loading spinner, password reveal.
 *
 * Autocomplete: pass `suggestions` and handle `@complete`. The control is the
 * two-way bound value; the parent owns the query. Debounced by `delay`.
 *
 *   <ApexInput v-model="city" :suggestions="hits" :loading="busy"
 *              @complete="search" @item-select="pick" />
 *
 *   async function search({ query }) { hits.value = await api.cities(query); }
 */
import { computed, nextTick, ref, watch, onBeforeUnmount } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { applyTransform, normaliseOptions, pickFieldProps } from '../core/utils';
import { guardKeydown, guardPaste, type KeyFilter } from '../core/keyFilter';
import { useApexI18n } from '../core/i18n';
import type { ApexFieldProps, ApexOption, ApexOptionsInput, ApexTrailingAction } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: string | number | null;
  type?: 'text' | 'email' | 'tel' | 'url' | 'search' | 'password' | 'slug';
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  leadingIcon?: string;
  trailingIcon?: string;
  trailingAction?: ApexTrailingAction;
  clearable?: boolean;
  loading?: boolean;
  mono?: boolean;
  transform?: 'lower' | 'upper' | 'slug' | 'trim';
  maxlength?: number;
  /** Native browser autofill hint. Unrelated to the suggestion list below. */
  autocomplete?: string;
  /**
   * Restrict keystrokes: 'integer' | 'number' | 'money' | 'hex' | 'alphabetic'
   * | 'alphanumeric', or a RegExp / pattern string tested against the whole value.
   * Also filters paste and drop.
   */
  keyFilter?: KeyFilter;

  /* ── autocomplete ── */
  /** Suggestion list. Presence of this prop turns the control into a typeahead. */
  suggestions?: ApexOptionsInput;
  /** Characters required before @complete fires. */
  minLength?: number;
  /** Debounce before @complete fires, in ms. */
  delay?: number;
  /** Query again (with the current value) when the field gains focus. */
  completeOnFocus?: boolean;
  /** Show a chevron button that queries with an empty string. */
  dropdown?: boolean;
  /** Clear the value on blur unless it matches a suggestion. */
  forceSelection?: boolean;
  /** Message shown when a query returns nothing. */
  emptyMessage?: string;
}>(), { type: 'text', statusIcon: true, minLength: 1, delay: 300 });

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'change' | 'blur' | 'focus', v: string): void;
  (e: 'clear'): void;
  (e: 'action'): void;
  (e: 'complete', payload: { query: string }): void;
  (e: 'item-select', option: ApexOption): void;
}>();

const t = useApexI18n();
const focused = ref(false);
const reveal = ref(false);
const el = ref<HTMLInputElement | null>(null);
const root = ref<HTMLElement | null>(null);
const open = ref(false);
const active = ref(-1);
let timer: ReturnType<typeof setTimeout> | undefined;

const isPassword = computed(() => props.type === 'password');
const inputType = computed(() => (isPassword.value ? (reveal.value ? 'text' : 'password') : props.type === 'slug' ? 'text' : props.type));
const filled = computed(() => props.modelValue != null && props.modelValue !== '');
const autoTransform = computed(() => props.transform || (props.type === 'slug' ? 'slug' : undefined));
const showClear = computed(() => props.clearable && filled.value && !props.disabled && !props.readonly);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

const typeahead = computed(() => props.suggestions !== undefined);
const items = computed<ApexOption[]>(() => normaliseOptions(props.suggestions));
const listId = computed(() => 'apex-ac-' + (props.id || props.name || 'list'));

function ask(query: string, immediate = false) {
  if (!typeahead.value) return;
  clearTimeout(timer);
  const fire = () => { emit('complete', { query }); open.value = true; active.value = -1; };
  if (immediate || !props.delay) fire();
  else timer = setTimeout(fire, props.delay);
}

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value;
  const next = applyTransform(raw, autoTransform.value);
  if (next !== raw && el.value) el.value.value = next;
  emit('update:modelValue', next);
  if (typeahead.value) {
    if (next.length >= props.minLength) ask(next);
    else { open.value = false; clearTimeout(timer); }
  }
}

function select(o: ApexOption) {
  emit('update:modelValue', String(o.value));
  emit('item-select', o);
  open.value = false;
  active.value = -1;
  nextTick(() => el.value?.focus());
}

function onKey(e: KeyboardEvent) {
  guardKeydown(e, props.keyFilter);
  if (e.defaultPrevented) return;
  if (!typeahead.value) return;
  if (e.key === 'Escape') { open.value = false; return; }
  if (e.key === 'Tab') { open.value = false; return; }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (!open.value) { ask(String(props.modelValue ?? ''), true); return; }
    active.value = Math.min(active.value + 1, items.value.length - 1);
  }
  if (e.key === 'ArrowUp') { e.preventDefault(); active.value = Math.max(active.value - 1, 0); }
  if (e.key === 'Enter' && open.value && items.value[active.value]) {
    e.preventDefault();
    select(items.value[active.value]);
  }
}

function onFocus() {
  focused.value = true;
  emit('focus', String(props.modelValue ?? ''));
  if (typeahead.value && props.completeOnFocus) ask(String(props.modelValue ?? ''), true);
}

function onBlur() {
  focused.value = false;
  emit('blur', String(props.modelValue ?? ''));
  if (typeahead.value && props.forceSelection) {
    const v = String(props.modelValue ?? '');
    const hit = items.value.some((o) => String(o.value) === v || o.label === v);
    if (v && !hit) emit('update:modelValue', '');
  }
}

function toggleDropdown() {
  if (props.disabled) return;
  if (open.value) { open.value = false; return; }
  ask('', true);
  nextTick(() => el.value?.focus());
}

function onPaste(e: ClipboardEvent) {
  const next = guardPaste(e, props.keyFilter);
  if (next === null) return;
  emit('update:modelValue', next);
  if (el.value) el.value.value = next;
}

function clear() { emit('update:modelValue', ''); emit('clear'); open.value = false; el.value?.focus(); }

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) document.addEventListener('mousedown', onDocClick);
  else document.removeEventListener('mousedown', onDocClick);
});
onBeforeUnmount(() => {
  clearTimeout(timer);
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocClick);
});

defineExpose({ focus: () => el.value?.focus() });
const isFloat = computed(() => String(props.labelPlacement || '').startsWith('float'));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="filled || (isFloat && !!placeholder)" :focused="focused"
             v-slot="{ id, describedBy, invalid, statusGlyph, ui }">
    <div ref="root" :style="typeahead ? 'position:relative' : undefined">
      <div class="apex-ctl" :class="[{ 'apex-ctl--mono': mono }, ui.control]"
           :data-focused="focused ? 'true' : 'false'" :data-disabled="disabled ? 'true' : 'false'">
        <slot name="leading">
          <ApexIcon v-if="leadingIcon" :name="leadingIcon" class="apex-ctl__icon" :class="ui.icon" />
        </slot>
        <span v-if="prefix" class="apex-ctl__affix" :class="ui.affix">{{ prefix }}</span>
        <input ref="el" class="apex-ctl__input" :class="ui.input" :id="id" :name="name || id" :type="inputType"
               :value="modelValue ?? ''" :placeholder="isFloat ? undefined : placeholder"
               :disabled="disabled" :readonly="readonly" :required="required" :maxlength="maxlength"
               :autocomplete="typeahead ? 'off' : autocomplete" :aria-describedby="describedBy"
               :aria-invalid="invalid || undefined"
               :aria-label="labelPlacement === 'hidden' ? label : undefined"
               :role="typeahead ? 'combobox' : undefined" :aria-expanded="typeahead ? open : undefined"
               :aria-controls="typeahead ? listId : undefined" :aria-autocomplete="typeahead ? 'list' : undefined"
               :aria-activedescendant="typeahead && active >= 0 ? listId + '-' + active : undefined"
               @input="onInput" @change="emit('change', ($event.target as HTMLInputElement).value)"
               @keydown="onKey" @paste="onPaste" @drop.prevent @focus="onFocus" @blur="onBlur" />
        <span v-if="suffix" class="apex-ctl__affix" :class="ui.affix">{{ suffix }}</span>
        <ApexIcon v-if="loading" name="progress_activity" spin class="apex-ctl__icon" :class="ui.icon" :label="t('apexui.loading')" />
        <button v-if="showClear" type="button" class="apex-ctl__btn" :class="ui.button" :aria-label="t('apexui.clear')" @click="clear">
          <ApexIcon name="close" :size="17" />
        </button>
        <button v-if="isPassword" type="button" class="apex-ctl__btn" :class="ui.button" :disabled="disabled"
                :aria-label="reveal ? t('apexui.hidePassword') : t('apexui.showPassword')"
                :aria-pressed="reveal" @click="reveal = !reveal">
          <ApexIcon :name="reveal ? 'visibility_off' : 'visibility'" :size="18" />
        </button>
        <button v-if="trailingAction" type="button" class="apex-ctl__btn" :class="ui.button"
                :disabled="disabled || trailingAction.disabled"
                :aria-label="trailingAction.label" @click="emit('action')">
          <ApexIcon :name="trailingAction.icon" :size="18" />
        </button>
        <ApexIcon v-else-if="trailingIcon" :name="trailingIcon" class="apex-ctl__icon" :class="ui.icon" />
        <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
        <button v-if="typeahead && dropdown" type="button" class="apex-ctl__btn" :class="ui.button" :disabled="disabled"
                :aria-label="t('apexui.select')" @click="toggleDropdown">
          <ApexIcon name="keyboard_arrow_down" :size="19" />
        </button>
        <slot name="trailing" />
      </div>

      <div v-if="typeahead && open && (items.length || !loading)" class="apex-pop" :class="ui.popover" :id="listId" role="listbox">
        <button v-for="(o, i) in items" :key="String(o.value)" :id="listId + '-' + i" type="button"
                class="apex-pop__opt" :class="ui.option" role="option" :aria-selected="String(o.value) === String(modelValue)"
                :data-active="i === active ? 'true' : 'false'" :disabled="o.disabled"
                @mouseenter="active = i" @mousedown.prevent @click="select(o)">
          <ApexIcon v-if="o.icon" :name="o.icon" :size="18" />
          <span>
            <slot name="option" :option="o">{{ o.label }}</slot>
            <span v-if="o.help" class="apex-pop__help">{{ o.help }}</span>
          </span>
        </button>
        <p v-if="!items.length" class="apex-pop__empty">{{ emptyMessage || t('apexui.noResults') }}</p>
      </div>
    </div>
  </ApexField>
</template>
