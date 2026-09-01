<script setup lang="ts">
/**
 * ApexListbox — an always-visible option list. Single selection by default,
 * `multiple` for many, `checkbox` to render a box per option, `filter` for the
 * built-in search, and grouped options through a nested `items` array.
 */
import { computed, ref } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import type { ApexFieldProps, ApexOption, ApexOptionsInput } from '../types';

export interface ListboxGroup {
  label: string;
  icon?: string;
  items: ApexOptionsInput;
}

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: unknown;
  /** Flat options, or groups of { label, items }. */
  options?: ApexOptionsInput | ListboxGroup[];
  /** Choose more than one; the model becomes an array. */
  multiple?: boolean;
  /** A checkbox per option. Implies multiple. */
  checkbox?: boolean;
  /** Search box pinned to the top of the list. */
  filter?: boolean;
  filterPlaceholder?: string;
  /** Cap the list height in pixels. */
  scrollHeight?: number;
  /** Row above the list with a running count. */
  toggleAll?: boolean;
  /** Cap the number of selections. */
  max?: number;
  emptyMessage?: string;
}>(), { scrollHeight: 260, statusIcon: false });

const emit = defineEmits<{
  (e: 'update:modelValue', v: unknown): void;
  (e: 'change'): void;
}>();

const t = useApexI18n();
const query = ref('');
const active = ref(-1);
const many = computed(() => props.multiple || props.checkbox);

const isGrouped = computed(() =>
  Array.isArray(props.options) && props.options.length > 0
  && typeof props.options[0] === 'object' && props.options[0] !== null
  && 'items' in (props.options[0] as object));

const groups = computed<Array<{ label?: string; icon?: string; items: ApexOption[] }>>(() => {
  if (!isGrouped.value) return [{ items: normaliseOptions(props.options as ApexOptionsInput) }];
  return (props.options as ListboxGroup[]).map((g) => ({ label: g.label, icon: g.icon, items: normaliseOptions(g.items) }));
});
const filtered = computed(() => {
  const q = query.value.toLowerCase().trim();
  if (!q) return groups.value;
  return groups.value
    .map((g) => ({ ...g, items: g.items.filter((o) => o.label.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length);
});
const flat = computed(() => filtered.value.flatMap((g) => g.items));
const selected = computed<unknown[]>(() => {
  if (!many.value) return props.modelValue == null ? [] : [props.modelValue];
  return Array.isArray(props.modelValue) ? props.modelValue : [];
});
const allOptions = computed(() => groups.value.flatMap((g) => g.items));
const allSelected = computed(() => allOptions.value.length > 0 && allOptions.value.every((o) => selected.value.includes(o.value)));
const atMax = computed(() => props.max != null && selected.value.length >= props.max);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const listId = computed(() => 'apex-lb-' + (props.id || props.name || 'list'));
const isSelected = (o: ApexOption) => selected.value.includes(o.value);

function pick(o: ApexOption) {
  if (props.disabled || props.readonly || o.disabled) return;
  if (!many.value) {
    emit('update:modelValue', isSelected(o) ? null : o.value);
  } else {
    const cur = [...selected.value];
    const i = cur.indexOf(o.value);
    if (i >= 0) cur.splice(i, 1);
    else { if (atMax.value) return; cur.push(o.value); }
    emit('update:modelValue', cur);
  }
  emit('change');
}
function toggleEverything() {
  emit('update:modelValue', allSelected.value ? [] : allOptions.value.filter((o) => !o.disabled).map((o) => o.value));
  emit('change');
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') { e.preventDefault(); active.value = Math.min(active.value + 1, flat.value.length - 1); }
  if (e.key === 'ArrowUp') { e.preventDefault(); active.value = Math.max(active.value - 1, 0); }
  if (e.key === 'Home') { e.preventDefault(); active.value = 0; }
  if (e.key === 'End') { e.preventDefault(); active.value = flat.value.length - 1; }
  if ((e.key === 'Enter' || e.key === ' ') && flat.value[active.value]) { e.preventDefault(); pick(flat.value[active.value]); }
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, invalid }">
    <div class="apex-listbox" :data-disabled="disabled ? 'true' : 'false'">
      <div v-if="filter" class="apex-pop__filter">
        <ApexIcon name="search" />
        <input type="text" :value="query" :placeholder="filterPlaceholder || t('apexui.search')"
               :aria-label="t('apexui.search')" autocomplete="off" :disabled="disabled"
               @input="query = ($event.target as HTMLInputElement).value; active = 0" @keydown="onKey" />
        <button v-if="query" type="button" class="apex-ctl__btn" :aria-label="t('apexui.clear')" @click="query = ''">
          <ApexIcon name="close" :size="16" />
        </button>
      </div>

      <button v-if="toggleAll && many && !query" type="button" class="apex-pop__all" :disabled="disabled"
              @click="toggleEverything">
        {{ allSelected ? t('apexui.clear') : t('apexui.select') }}
        <span>{{ selected.length }} / {{ allOptions.length }}</span>
      </button>

      <ul class="apex-listbox__list" :id="listId" role="listbox" :tabindex="disabled ? -1 : 0"
          :aria-multiselectable="many || undefined" :aria-describedby="describedBy"
          :aria-invalid="invalid || undefined" :aria-label="labelPlacement === 'hidden' ? label : undefined"
          :style="{ maxHeight: scrollHeight + 'px' }" @keydown="onKey">
        <template v-for="(g, gi) in filtered" :key="gi">
          <li v-if="g.label" class="apex-listbox__group" role="presentation">
            <ApexIcon v-if="g.icon" :name="g.icon" :size="16" />{{ g.label }}
          </li>
          <li v-for="o in g.items" :key="String(o.value)" class="apex-listbox__opt" role="option"
              :aria-selected="isSelected(o)" :aria-disabled="o.disabled || undefined"
              :data-selected="isSelected(o) ? 'true' : 'false'"
              :data-active="flat.indexOf(o) === active ? 'true' : 'false'"
              :data-disabled="(o.disabled || (atMax && !isSelected(o))) ? 'true' : 'false'"
              @click="pick(o)" @mouseenter="active = flat.indexOf(o)">
            <span v-if="checkbox" class="apex-cb__box" :data-on="isSelected(o)" aria-hidden="true">
              <ApexIcon v-if="isSelected(o)" name="check" :size="14" />
            </span>
            <img v-if="o.image" class="apex-pop__img" :src="o.image" alt="" />
            <ApexIcon v-else-if="o.icon" :name="o.icon" :size="18" />
            <span class="apex-listbox__txt">
              <slot name="option" :option="o">{{ o.label }}</slot>
              <span v-if="o.help" class="apex-pop__help">{{ o.help }}</span>
            </span>
            <ApexIcon v-if="!checkbox && isSelected(o)" name="check" class="apex-pop__tick" />
          </li>
        </template>
        <li v-if="!flat.length" class="apex-pop__empty" role="presentation">
          {{ emptyMessage || t('apexui.noResults') }}
        </li>
      </ul>
    </div>
  </ApexField>
</template>
