import { computed, inject, ref, type ComputedRef, type Ref } from 'vue';
import { evalCondition } from './conditions';
import { APEX_UI_OPTIONS } from './symbols';
import type { ApexFieldProps, ApexRule, ApexTone, ApexUiOptions } from '../types';

let uid = 0;
export const nextId = (p = 'apex') => `${p}-${++uid}`;

const first = (e: ApexFieldProps['error']): string | undefined =>
  Array.isArray(e) ? e[0] : e || undefined;

/**
 * Resolves tone + message for a field.
 * Precedence: explicit `error` > `warning` > `success` > matching `rules` (last wins) > `tone` prop.
 * Rules are conditional FORMATTING, not validation — they never block submit.
 */
export function useFieldState(
  props: ApexFieldProps,
  value: Ref<unknown> | ComputedRef<unknown>,
) {
  const opts = inject<ApexUiOptions>(APEX_UI_OPTIONS, {});
  const id = computed(() => props.id || nextId('apex-f'));
  const focused = ref(false);

  const matched = computed<ApexRule | undefined>(() => {
    const scope = { value: value.value, ...(props.context || {}) };
    let hit: ApexRule | undefined;
    (props.rules || []).forEach((r) => { if (evalCondition(r.when, scope)) hit = r; });
    return hit;
  });

  const tone = computed<ApexTone>(() => {
    if (first(props.error)) return 'danger';
    if (props.warning) return 'warning';
    if (props.success) return 'success';
    if (matched.value?.tone) return matched.value.tone;
    return props.tone || 'default';
  });

  const message = computed<string | undefined>(
    () => first(props.error) || props.warning || props.success || matched.value?.message || props.help || undefined,
  );

  const size = computed(() => props.size || opts.size || 'md');
  const labelPlacement = computed(() => props.labelPlacement || opts.labelPlacement || 'top');
  const invalid = computed(() => tone.value === 'danger');
  const describedBy = computed(() => (message.value ? `${id.value}-msg` : undefined));
  const ruleClass = computed(() => matched.value?.class);

  return { id, tone, message, size, labelPlacement, invalid, describedBy, focused, ruleClass, matched };
}
