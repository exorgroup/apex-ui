<script setup lang="ts">
/**
 * ApexCheckboxGroup — generates the boxes from a list of values.
 *
 *   <ApexCheckboxGroup v-model="roles" label="Roles" :options="ROLES" toggle-all />
 *
 * Options accept the string shorthand (['a','b']) or the full object form with
 * icon, image, help and disabled. The model is an array of the chosen values.
 */
import { computed } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import ApexCheckbox from './ApexCheckbox.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import type { ApexFieldProps, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: unknown[];
  options?: ApexOptionsInput;
  /** Lay the boxes out in a row. */
  inline?: boolean;
  /** Fixed column count instead of one per row. */
  columns?: number;
  /** Bordered choice cards. */
  card?: boolean;
  /** Select all / clear all link above the list. */
  toggleAll?: boolean;
  /** Cap the number of selections. */
  max?: number;
}>(), { statusIcon: false });

const emit = defineEmits<{ (e: 'update:modelValue', v: unknown[]): void; (e: 'change'): void }>();

const t = useApexI18n();
const opts = computed(() => normaliseOptions(props.options));
const selected = computed(() => props.modelValue || []);
const atMax = computed(() => props.max != null && selected.value.length >= props.max);
const allSelected = computed(() => opts.value.length > 0 && opts.value.every((o) => selected.value.includes(o.value)));
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const gridStyle = computed(() => (props.columns ? { '--apex-check-cols': String(props.columns) } : undefined));

/**
 * ApexCheckbox does the array arithmetic and hands back the new selection.
 * A row at the cap is rendered disabled, so it cannot normally grow past
 * `max` — the guard is here anyway rather than trusting the DOM.
 */
function onToggle(next: unknown) {
  if (props.disabled) return;
  const list = Array.isArray(next) ? next : [];
  if (props.max != null && list.length > props.max) return;
  emit('update:modelValue', list);
  emit('change');
}
function toggleEverything() {
  emit('update:modelValue', allSelected.value ? [] : opts.value.filter((o) => !o.disabled).map((o) => o.value));
  emit('change');
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, size, ui }">
    <div class="apex-checks" :class="ui.group" :id="id" role="group" :style="gridStyle"
         :data-inline="inline ? 'true' : 'false'" :data-cols="columns || undefined"
         :aria-describedby="describedBy" :aria-label="labelPlacement === 'hidden' ? label : undefined">
      <button v-if="toggleAll" type="button" class="apex-checks__all" :class="ui.selectAll"
              :disabled="disabled" @click="toggleEverything">
        <ApexIcon :name="allSelected ? 'remove_done' : 'done_all'" :size="16" />
        {{ allSelected ? t('apexui.clear') : t('apexui.select') }}
      </button>
      <!-- One markup for a checkbox, in ApexCheckbox. `bare` suppresses the
           field shell, which the group has already drawn. -->
      <ApexCheckbox v-for="o in opts" :key="String(o.value)" bare
                    :model-value="selected" :value="o.value" :name="(name || id) + '[]'"
                    :label="o.label" :icon="o.icon" :image="o.image" :hint="o.help"
                    :card="card" :size="size"
                    :disabled="disabled || o.disabled || (atMax && !selected.includes(o.value))"
                    :ui="ui" @update:model-value="onToggle">
        <slot name="option" :option="o">{{ o.label }}</slot>
      </ApexCheckbox>
    </div>
  </ApexField>
</template>
