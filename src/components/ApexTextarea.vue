<script setup lang="ts">
/** ApexTextarea — auto-grow optional, character counter optional. */
import { computed, ref, watch, nextTick } from 'vue';
import ApexField from './ApexField.vue';
import { pickFieldProps } from '../core/utils';
import { guardKeydown, guardPaste, type KeyFilter } from '../core/keyFilter';
import ApexIcon from './ApexIcon.vue';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: string | null;
  placeholder?: string;
  rows?: number;
  maxlength?: number;
  counter?: boolean;
  autogrow?: boolean;
  mono?: boolean;
  /**
   * Restrict keystrokes: 'integer' | 'number' | 'money' | 'hex' | 'alphabetic'
   * | 'alphanumeric', or a RegExp / pattern string tested against the whole value.
   */
  keyFilter?: KeyFilter;
}>(), { rows: 4, statusIcon: true });

const emit = defineEmits<{ (e: 'update:modelValue', v: string): void; (e: 'blur' | 'focus'): void }>();
const focused = ref(false);
const el = ref<HTMLTextAreaElement | null>(null);
const filled = computed(() => !!props.modelValue);
const count = computed(() => String(props.modelValue ?? '').length);

function grow() {
  if (!props.autogrow || !el.value) return;
  el.value.style.height = 'auto';
  el.value.style.height = `${el.value.scrollHeight + 2}px`;
}
watch(() => props.modelValue, () => nextTick(grow));
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));
const isFloat = computed(() => String(props.labelPlacement || '').startsWith('float'));
function onKey(e: KeyboardEvent) { guardKeydown(e, props.keyFilter); }
function onPaste(e: ClipboardEvent) {
  const next = guardPaste(e, props.keyFilter);
  if (next === null) return;
  emit('update:modelValue', next);
  if (el.value) el.value.value = next;
}
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="filled || (isFloat && !!placeholder)" :focused="focused"
             v-slot="{ id, describedBy, invalid, statusGlyph }">
    <div class="apex-ctl apex-ctl--textarea" :class="{ 'apex-ctl--mono': mono }"
         :data-focused="focused ? 'true' : 'false'" :data-disabled="disabled ? 'true' : 'false'">
      <textarea ref="el" class="apex-ctl__input" :id="id" :name="name || id" :rows="rows"
                :value="modelValue ?? ''" :placeholder="placeholder" :disabled="disabled" :readonly="readonly"
                :maxlength="maxlength" :required="required" :aria-describedby="describedBy"
                :aria-invalid="invalid || undefined" :aria-label="labelPlacement === 'hidden' ? label : undefined"
                @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
                @keydown="onKey" @paste="onPaste" @drop.prevent
                @focus="focused = true; emit('focus')" @blur="focused = false; emit('blur')"></textarea>
      <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
    </div>
    <p v-if="counter" class="apex-field__msg apex-ctl__counter" :class="ui?.counter">
      {{ count }}<template v-if="maxlength"> / {{ maxlength }}</template>
    </p>
  </ApexField>
</template>
