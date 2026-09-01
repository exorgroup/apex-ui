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
import { normaliseOptions, pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import type { ApexFieldProps, ApexOption, ApexOptionsInput } from '../types';

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

function toggle(o: ApexOption) {
  if (props.disabled || o.disabled) return;
  const cur = [...selected.value];
  const i = cur.indexOf(o.value);
  if (i >= 0) cur.splice(i, 1);
  else { if (atMax.value) return; cur.push(o.value); }
  emit('update:modelValue', cur);
  emit('change');
}
function toggleEverything() {
  emit('update:modelValue', allSelected.value ? [] : opts.value.filter((o) => !o.disabled).map((o) => o.value));
  emit('change');
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" v-slot="{ id, describedBy, size }">
    <div class="apex-checks" :id="id" role="group" :style="gridStyle"
         :data-inline="inline ? 'true' : 'false'" :data-cols="columns || undefined"
         :aria-describedby="describedBy" :aria-label="labelPlacement === 'hidden' ? label : undefined">
      <button v-if="toggleAll" type="button" class="apex-checks__all" :disabled="disabled" @click="toggleEverything">
        <ApexIcon :name="allSelected ? 'remove_done' : 'done_all'" :size="16" />
        {{ allSelected ? t('apexui.clear') : t('apexui.select') }}
      </button>
      <label v-for="o in opts" :key="String(o.value)" class="apex-cb" :class="{ 'apex-cb--card': card }"
             :data-size="size" :data-checked="selected.includes(o.value) ? 'true' : 'false'"
             :data-disabled="(disabled || o.disabled || (atMax && !selected.includes(o.value))) ? 'true' : 'false'">
        <input type="checkbox" :name="(name || id) + '[]'" :value="String(o.value)"
               :checked="selected.includes(o.value)"
               :disabled="disabled || o.disabled || (atMax && !selected.includes(o.value))"
               @change="toggle(o)" />
        <span class="apex-cb__box" aria-hidden="true">
          <ApexIcon v-if="selected.includes(o.value)" name="check" :size="14" />
        </span>
        <span class="apex-cb__txt">
          <span class="apex-cb__lead">
            <img v-if="o.image" class="apex-cb__img" :src="o.image" alt="" />
            <ApexIcon v-else-if="o.icon" :name="o.icon" :size="18" />
            {{ o.label }}
          </span>
          <span v-if="o.help" class="apex-cb__help">{{ o.help }}</span>
        </span>
      </label>
    </div>
  </ApexField>
</template>
