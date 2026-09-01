<script setup lang="ts">
/**
 * ApexSelect — custom popover listbox by default, so the menu matches the field
 * (the OS-drawn native menu cannot be styled). Pass `native` to fall back to a
 * real <select> — right for dense mobile forms and plain non-JS form posts.
 */
import { computed, nextTick, ref, watch, onBeforeUnmount } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import type { ApexFieldProps, ApexOption, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: string | number | null;
  options?: ApexOptionsInput;
  placeholder?: string;
  leadingIcon?: string;
  clearable?: boolean;
  loading?: boolean;
  /** Use the browser's own <select> instead of the popover listbox. */
  native?: boolean;
  /** Search box at the top of the popover. */
  filter?: boolean;
  filterPlaceholder?: string;
  /** Show the filter automatically once there are this many options. */
  filterThreshold?: number;
}>(), { statusIcon: true });

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number | null): void;
  (e: 'change'): void;
}>();

const t = useApexI18n();
const focused = ref(false);
const open = ref(false);
const active = ref(-1);
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLElement | null>(null);

const allOpts = computed(() => normaliseOptions(props.options));
const query = ref('');
const showFilter = computed(() => props.filter || (props.filterThreshold != null && allOpts.value.length >= props.filterThreshold));
const opts = computed(() => {
  const q = query.value.toLowerCase().trim();
  return q ? allOpts.value.filter((o) => o.label.toLowerCase().includes(q)) : allOpts.value;
});
const filterEl = ref<HTMLInputElement | null>(null);
const filled = computed(() => props.modelValue != null && props.modelValue !== '');
const selected = computed<ApexOption | undefined>(() => allOpts.value.find((o) => o.value === props.modelValue));
const listId = computed(() => 'apex-sel-' + (props.id || props.name || 'list'));
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

function pick(o: ApexOption) {
  if (o.disabled) return;
  emit('update:modelValue', o.value as string | number);
  emit('change');
  open.value = false;
  nextTick(() => trigger.value?.focus());
}
function openMenu() {
  if (props.disabled || props.readonly) return;
  query.value = '';
  open.value = true;
  active.value = Math.max(0, opts.value.findIndex((o) => o.value === props.modelValue));
  if (showFilter.value) nextTick(() => filterEl.value?.focus());
}
function onKey(e: KeyboardEvent) {
  if (props.disabled) return;
  if (e.key === 'Escape') { open.value = false; return; }
  if (e.key === 'Tab') { open.value = false; return; }
  if (!open.value && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); openMenu(); return; }
  if (!open.value) return;
  if (e.key === 'ArrowDown') { e.preventDefault(); active.value = Math.min(active.value + 1, opts.value.length - 1); }
  if (e.key === 'ArrowUp') { e.preventDefault(); active.value = Math.max(active.value - 1, 0); }
  if (e.key === 'Home') { e.preventDefault(); active.value = 0; }
  if (e.key === 'End') { e.preventDefault(); active.value = opts.value.length - 1; }
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (opts.value[active.value]) pick(opts.value[active.value]); }
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
const isFloat = computed(() => String(props.labelPlacement || '').startsWith('float'));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="filled || (isFloat && !!placeholder)" :focused="focused || open"
             v-slot="{ id, describedBy, invalid, statusGlyph }">
    <!-- native -->
    <div v-if="native" class="apex-ctl apex-ctl--select" :data-focused="focused ? 'true' : 'false'"
         :data-disabled="disabled ? 'true' : 'false'">
      <ApexIcon v-if="leadingIcon" :name="leadingIcon" class="apex-ctl__icon" />
      <select class="apex-ctl__input" :id="id" :name="name || id" :value="modelValue ?? ''"
              :disabled="disabled" :required="required" :aria-describedby="describedBy"
              :aria-invalid="invalid || undefined" :aria-label="labelPlacement === 'hidden' ? label : undefined"
              @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value); emit('change')"
              @focus="focused = true" @blur="focused = false">
        <option value="" disabled>{{ placeholder || t('apexui.select') }}</option>
        <option v-for="o in opts" :key="String(o.value)" :value="o.value" :disabled="o.disabled">{{ o.label }}</option>
      </select>
      <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
      <ApexIcon name="keyboard_arrow_down" class="apex-ctl__icon" :size="19" />
    </div>

    <!-- popover listbox -->
    <div v-else ref="root" style="position:relative">
      <div ref="trigger" class="apex-ctl apex-ctl--trigger" role="combobox" :id="id"
           :aria-expanded="open" aria-haspopup="listbox" :aria-controls="listId"
           :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
           :aria-label="labelPlacement === 'hidden' ? label : undefined"
           :aria-activedescendant="open && active >= 0 ? listId + '-' + active : undefined"
           :tabindex="disabled ? -1 : 0" :data-focused="(focused || open) ? 'true' : 'false'"
           :data-disabled="disabled ? 'true' : 'false'"
           @click="open ? (open = false) : openMenu()" @keydown="onKey"
           @focus="focused = true" @blur="focused = false">
        <img v-if="selected && selected.image" class="apex-ctl__img" :src="selected.image" alt="" />
        <ApexIcon v-else-if="selected && selected.icon" :name="selected.icon" class="apex-ctl__icon" />
        <ApexIcon v-else-if="leadingIcon" :name="leadingIcon" class="apex-ctl__icon" />
        <span v-if="selected" class="apex-ctl__value">{{ selected.label }}</span>
        <span v-else class="apex-ctl__ph">{{ placeholder || t('apexui.select') }}</span>
        <ApexIcon v-if="loading" name="progress_activity" spin class="apex-ctl__icon" />
        <button v-if="clearable && filled && !disabled" type="button" class="apex-ctl__btn"
                :aria-label="t('apexui.clear')" @click.stop="emit('update:modelValue', null)">
          <ApexIcon name="close" :size="17" />
        </button>
        <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
        <ApexIcon name="keyboard_arrow_down" class="apex-ctl__icon apex-ctl__chev" :size="19" :data-open="open" />
      </div>
      <div v-if="open" class="apex-pop" :id="listId" role="listbox"
           :aria-activedescendant="active >= 0 ? listId + '-' + active : undefined">
        <div v-if="showFilter" class="apex-pop__filter">
          <ApexIcon name="search" />
          <input ref="filterEl" type="text" :value="query" :placeholder="filterPlaceholder || t('apexui.search')"
                 :aria-label="t('apexui.search')" autocomplete="off"
                 @input="query = ($event.target as HTMLInputElement).value; active = 0" @keydown="onKey" />
          <button v-if="query" type="button" class="apex-ctl__btn" :aria-label="t('apexui.clear')"
                  @click="query = ''; filterEl?.focus()">
            <ApexIcon name="close" :size="16" />
          </button>
        </div>
        <button v-for="(o, i) in opts" :key="String(o.value)" :id="listId + '-' + i" type="button"
                class="apex-pop__opt" role="option" :aria-selected="o.value === modelValue"
                :data-active="i === active ? 'true' : 'false'" :disabled="o.disabled"
                @mouseenter="active = i" @click="pick(o)">
          <img v-if="o.image" class="apex-pop__img" :src="o.image" alt="" />
          <ApexIcon v-else-if="o.icon" :name="o.icon" :size="18" />
          <span>
            {{ o.label }}
            <span v-if="o.help" class="apex-pop__help">{{ o.help }}</span>
          </span>
          <ApexIcon v-if="o.value === modelValue" name="check" class="apex-pop__tick" />
        </button>
        <p v-if="!opts.length" class="apex-pop__empty">{{ t('apexui.noResults') }}</p>
      </div>
    </div>
  </ApexField>
</template>
