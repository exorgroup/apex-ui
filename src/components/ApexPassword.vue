<script setup lang="ts">
/**
 * ApexPassword — ApexInput for password entry, plus a strength meter and a
 * live requirements checklist. Both can sit under the field or inside a
 * popover that opens on focus.
 */
import { computed, ref } from 'vue';
import ApexInput from './ApexInput.vue';
import ApexIcon from './ApexIcon.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

export interface PasswordRule {
  label: string;
  /** Either a regular expression or a predicate over the value. */
  test: RegExp | ((v: string) => boolean);
  /** Excluded from the score but still shown — e.g. "no spaces". */
  advisory?: boolean;
}

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: string | null;
  placeholder?: string;
  leadingIcon?: string;
  /** Show the eye toggle. */
  toggleMask?: boolean;
  /** Strength bar. */
  meter?: boolean;
  /** Requirements list. */
  checklist?: boolean;
  /** Put the meter and checklist in a popover that opens on focus. */
  popover?: boolean;
  /**
   * Override the default requirement list. Named `requirements` so it never
   * collides with the shared `rules` conditional-formatting prop.
   */
  requirements?: PasswordRule[];
  minLength?: number;
  /** Labels for the four strength bands. */
  strengthLabels?: [string, string, string, string];
  autocomplete?: string;
}>(), {
  toggleMask: true, meter: true, checklist: true, minLength: 8,
  autocomplete: 'new-password', statusIcon: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'focus' | 'blur'): void;
  (e: 'strength', payload: { score: number; label: string }): void;
}>();

const focused = ref(false);
const value = computed(() => String(props.modelValue ?? ''));

const DEFAULT_RULES: PasswordRule[] = [
  { label: `At least ${props.minLength} characters`, test: (v) => v.length >= props.minLength },
  { label: 'One lowercase letter', test: /[a-z]/ },
  { label: 'One uppercase letter', test: /[A-Z]/ },
  { label: 'One number', test: /\d/ },
  { label: 'One symbol', test: /[^A-Za-z0-9]/ },
];
const activeRules = computed(() => props.requirements || DEFAULT_RULES);

const results = computed(() => activeRules.value.map((r) => ({
  label: r.label,
  advisory: !!r.advisory,
  ok: typeof r.test === 'function' ? r.test(value.value)
    : r.test instanceof RegExp ? r.test.test(value.value)
      : false,
})));

/** 0–4: met scoring rules, scaled to four bands. */
const score = computed(() => {
  const scored = results.value.filter((r) => !r.advisory);
  if (!value.value || !scored.length) return 0;
  const met = scored.filter((r) => r.ok).length;
  return Math.max(1, Math.round((met / scored.length) * 4));
});
const bands = computed(() => props.strengthLabels || ['Too weak', 'Weak', 'Good', 'Strong']);
const strengthLabel = computed(() => (value.value ? bands.value[Math.max(0, score.value - 1)] : ''));
const showPanel = computed(() => (props.meter || props.checklist) && (!props.popover || focused.value));

/**
 * What ApexInput receives — an allow-list, never the whole prop object.
 *
 * ApexInput does not declare this component's own props, so spreading them all
 * sends them straight through to the DOM as attributes. `popover` is the one
 * that does real damage: `popover="false"` is not a valid value for the native
 * Popover API attribute, and the spec maps any invalid value to the `auto`
 * state. The UA stylesheet then applies
 * `position: fixed; inset: 0; margin: auto; border: solid` to the field, so
 * every password field on a page detaches from the layout and stacks in the
 * middle of the viewport, bordered, no matter where it was written.
 *
 * `minLength` is quieter and just as wrong: ApexInput has its own `minLength`
 * (characters typed before `@complete` fires), so the password length rule
 * would silently retune the autocomplete threshold.
 *
 * Same allow-list the JS mirror uses — see inputProps in apex-ui-mirror.js.
 */
const inputProps = computed(() => ({
  ...pickFieldProps(props as unknown as Record<string, unknown>),
  placeholder: props.placeholder,
  leadingIcon: props.leadingIcon,
  autocomplete: props.autocomplete,
}));

function onInput(v: string) {
  emit('update:modelValue', v);
  emit('strength', { score: score.value, label: strengthLabel.value });
}
</script>

<template>
  <div class="apex-pw" :data-popover="popover ? 'true' : 'false'">
    <ApexInput v-bind="inputProps" type="password" :model-value="modelValue"
               :trailing-action="undefined"
               @update:model-value="onInput" @focus="focused = true; emit('focus')"
               @blur="focused = false; emit('blur')">
      <template v-if="!toggleMask" #trailing><span></span></template>
    </ApexInput>

    <div v-if="showPanel" class="apex-pw__panel" :data-floating="popover ? 'true' : 'false'">
      <div v-if="meter" class="apex-pw__meter" :data-score="score"
           role="progressbar" :aria-valuemin="0" :aria-valuemax="4" :aria-valuenow="score"
           :aria-label="'Password strength: ' + (strengthLabel || 'empty')">
        <span v-for="i in 4" :key="i" :data-on="i <= score"></span>
      </div>
      <p v-if="meter && strengthLabel" class="apex-pw__label" :data-score="score">{{ strengthLabel }}</p>
      <ul v-if="checklist" class="apex-pw__rules">
        <li v-for="r in results" :key="r.label" :data-ok="r.ok">
          <ApexIcon :name="r.ok ? 'check_circle' : 'radio_button_unchecked'" :size="16" />
          <span>{{ r.label }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
