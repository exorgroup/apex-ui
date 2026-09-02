<script setup lang="ts">
/**
 * ApexTags — multiple tag entry. Enter adds, Backspace removes the last one,
 * and an optional delimiter (a comma, say) adds as you type. Typeahead offers
 * suggestions from `options` through the same popover as the selects.
 */
import { computed, nextTick, ref, watch, onBeforeUnmount } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import type { ApexFieldProps, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: string[];
  placeholder?: string;
  leadingIcon?: string;
  /** Extra key that commits a tag, e.g. ',' or ';'. Enter always works. */
  delimiter?: string;
  /** Let the same tag be added twice. */
  allowDuplicate?: boolean;
  /** Cap the number of tags. */
  max?: number;
  /** Suggestion list — presence turns typeahead on. */
  options?: ApexOptionsInput;
  /** Only allow values from `options`. */
  restrict?: boolean;
  /** Trim and drop empty entries. Defaults to true. */
  trim?: boolean;
  clearable?: boolean;
  addOnBlur?: boolean;
}>(), { trim: true, addOnBlur: true, statusIcon: true });

const emit = defineEmits<{
  (e: 'update:modelValue', v: string[]): void;
  (e: 'add', tag: string): void;
  (e: 'remove', tag: string): void;
  (e: 'focus' | 'blur'): void;
}>();

const t = useApexI18n();
const draft = ref('');
const focused = ref(false);
const open = ref(false);
const active = ref(0);
const root = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);

const tags = computed(() => props.modelValue || []);
const all = computed(() => normaliseOptions(props.options));
const typeahead = computed(() => props.options !== undefined);
const atMax = computed(() => props.max != null && tags.value.length >= props.max);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const listId = computed(() => 'apex-tags-' + (props.id || props.name || 'list'));
const suggestions = computed(() => {
  const q = draft.value.toLowerCase().trim();
  return all.value.filter((o) => {
    const label = String(o.label);
    if (!props.allowDuplicate && tags.value.includes(String(o.value))) return false;
    return !q || label.toLowerCase().includes(q);
  });
});
const isFloat = computed(() => String(props.labelPlacement || '').startsWith('float'));

function add(raw: string) {
  let v = props.trim ? raw.trim() : raw;
  if (!v || atMax.value) return;
  if (props.restrict && !all.value.some((o) => String(o.value) === v || o.label === v)) return;
  if (!props.allowDuplicate && tags.value.includes(v)) { draft.value = ''; return; }
  emit('update:modelValue', [...tags.value, v]);
  emit('add', v);
  draft.value = '';
  open.value = false;
}
function removeAt(i: number) {
  const cur = [...tags.value];
  const [gone] = cur.splice(i, 1);
  emit('update:modelValue', cur);
  emit('remove', gone);
}
function onInput(e: Event) {
  const el = e.target as HTMLInputElement;
  let text = el.value;
  if (props.delimiter && text.includes(props.delimiter)) {
    const parts = text.split(props.delimiter);
    const last = parts.pop() ?? '';
    parts.forEach(add);
    draft.value = last;
    el.value = last;
    return;
  }
  draft.value = text;
  if (typeahead.value) { open.value = true; active.value = 0; }
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { open.value = false; return; }
  if (e.key === 'ArrowDown' && typeahead.value) { e.preventDefault(); open.value = true; active.value = Math.min(active.value + 1, suggestions.value.length - 1); return; }
  if (e.key === 'ArrowUp' && typeahead.value) { e.preventDefault(); active.value = Math.max(active.value - 1, 0); return; }
  if (e.key === 'Enter') {
    e.preventDefault();
    if (open.value && suggestions.value[active.value]) add(String(suggestions.value[active.value].value));
    else add(draft.value);
    return;
  }
  if (e.key === 'Backspace' && !draft.value && tags.value.length) { e.preventDefault(); removeAt(tags.value.length - 1); }
}
function onBlur() {
  focused.value = false;
  if (props.addOnBlur && draft.value) add(draft.value);
  emit('blur');
}
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) document.addEventListener('mousedown', onDocClick);
  else document.removeEventListener('mousedown', onDocClick);
});
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocClick);
});
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="tags.length > 0 || (isFloat && !!placeholder)"
             :focused="focused" v-slot="{ id, describedBy, invalid, statusGlyph }">
    <div ref="root" style="position:relative">
      <div class="apex-ctl apex-ctl--multi" :data-focused="focused ? 'true' : 'false'"
           :data-disabled="disabled ? 'true' : 'false'" @click="inputEl?.focus()">
        <ApexIcon v-if="leadingIcon" :name="leadingIcon" class="apex-ctl__icon" />
        <span v-for="(tag, i) in tags" :key="tag + i" class="apex-chip" :class="ui?.chip">
          {{ tag }}
          <button type="button" :aria-label="`${t('apexui.remove')} ${tag}`" :disabled="disabled"
                  @click.stop="removeAt(i)">
            <ApexIcon name="close" />
          </button>
        </span>
        <input ref="inputEl" class="apex-ctl__input" style="height:26px;flex:1 1 80px" :id="id"
               :value="draft" :placeholder="tags.length ? '' : placeholder"
               :disabled="disabled || atMax" :readonly="readonly" autocomplete="off"
               :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
               :aria-label="label || 'Tags'" :role="typeahead ? 'combobox' : undefined"
               :aria-expanded="typeahead ? open : undefined" :aria-controls="typeahead ? listId : undefined"
               @input="onInput" @keydown="onKey" @focus="focused = true; emit('focus')" @blur="onBlur" />
        <button v-if="clearable && tags.length && !disabled" type="button" class="apex-ctl__btn"
                :aria-label="t('apexui.clear')" @click.stop="emit('update:modelValue', [])">
          <ApexIcon name="close" :size="17" />
        </button>
        <span v-if="max" class="apex-ctl__affix">{{ tags.length }}/{{ max }}</span>
        <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
      </div>

      <div v-if="typeahead && open && suggestions.length" class="apex-pop" :id="listId" role="listbox">
        <button v-for="(o, i) in suggestions" :key="String(o.value)" type="button" class="apex-pop__opt"
                role="option" :aria-selected="i === active" :data-active="i === active ? 'true' : 'false'"
                @mouseenter="active = i" @mousedown.prevent @click="add(String(o.value))">
          <ApexIcon v-if="o.icon" :name="o.icon" :size="18" />
          <span>{{ o.label }}</span>
        </button>
      </div>
    </div>
  </ApexField>
</template>
