<script setup lang="ts">
/**
 * ApexButton — severity × variant.
 *
 *   severity: primary | secondary | success | info | warning | help | danger | contrast
 *   variant:  solid | outlined | text | link
 *
 * Plus raised (elevation), rounded (pill), circular icon-only, a badge, four
 * icon positions, and a loading state. Renders an <a> when given `href`.
 *
 * Backwards compatible: the old `variant` values ('ghost', 'outline-danger', …)
 * still resolve to the right severity/variant pair.
 */
import { computed } from 'vue';
import ApexIcon from './ApexIcon.vue';
import type { ApexSize, ApexButtonAppearance } from '../types';

export type ApexSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'help' | 'danger' | 'contrast';
export type ApexButtonVariant = 'solid' | 'outlined' | 'text' | 'link';

/** Legacy `variant` values, kept working. */
const LEGACY: Record<string, { severity: ApexSeverity; variant: ApexButtonVariant }> = {
  primary: { severity: 'primary', variant: 'solid' },
  secondary: { severity: 'secondary', variant: 'outlined' },
  ghost: { severity: 'secondary', variant: 'text' },
  danger: { severity: 'danger', variant: 'solid' },
  'outline-danger': { severity: 'danger', variant: 'outlined' },
};

const props = withDefaults(defineProps<ApexButtonAppearance & {
  /** Colour role. */
  severity?: ApexSeverity;
  /** solid | outlined | text | link — or a legacy value. */
  variant?: ApexButtonVariant | 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline-danger';
  size?: ApexSize;
  /** Leading icon (position set by `iconPos`). */
  icon?: string;
  /** Explicit trailing icon; shorthand for iconPos="right" with a separate glyph. */
  trailingIcon?: string;
  /** Where `icon` sits relative to the label. */
  iconPos?: 'left' | 'right' | 'top' | 'bottom';
  /** Drop shadow to indicate elevation. Works with text and outlined too. */
  raised?: boolean;
  /** Circular border radius. */
  rounded?: boolean;
  /** Square (or circular, with `rounded`) icon-only button. Needs `label` for a11y. */
  iconOnly?: boolean;
  /** Accessible name — required for icon-only buttons. */
  label?: string;
  /** Count or short text in a corner badge. */
  badge?: string | number;
  /** Badge colour role. Defaults to `contrast`. */
  badgeSeverity?: ApexSeverity;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  target?: string;
}>(), { size: 'md', type: 'button', iconPos: 'left' });

/**
 * Appearance prop -> CSS variable. Only what is set, so an untouched button
 * carries no style attribute at all.
 */
const btnStyle = computed(() => {
  const out: Record<string, string> = {};
  const map: Array<[string | undefined, string]> = [
    [props.color, '--apex-btn-color'],
    [props.hoverColor, '--apex-btn-hover'],
    [props.labelColor, '--apex-btn-label'],
    [props.tintColor, '--apex-btn-tint'],
    [props.height, '--apex-btn-h'],
    [props.fontSize, '--apex-btn-fs'],
    [props.paddingInline, '--apex-btn-pad'],
    [props.radius, '--apex-btn-radius'],
  ];
  map.forEach(([v, name]) => { if (v) out[name] = v; });
  return out;
});


const legacy = computed(() => (props.variant ? LEGACY[props.variant] : undefined));
const severity = computed<ApexSeverity>(() => props.severity ?? legacy.value?.severity ?? 'primary');
const variant = computed<ApexButtonVariant>(() =>
  legacy.value ? legacy.value.variant : ((props.variant as ApexButtonVariant) ?? 'solid'));
const stacked = computed(() => props.iconPos === 'top' || props.iconPos === 'bottom');
const glyph = computed(() => (props.loading ? 'progress_activity' : props.icon));
</script>

<template>
  <component :is="href ? 'a' : 'button'" class="apex-btn" :class="ui?.root" :style="btnStyle"
             :href="href" :target="target"
             :type="href ? undefined : type"
             :data-severity="severity" :data-variant="variant" :data-size="size"
             :data-icon-pos="iconPos" :data-block="block ? 'true' : 'false'"
             :data-raised="raised ? 'true' : 'false'" :data-rounded="rounded ? 'true' : 'false'"
             :data-icon-only="iconOnly ? 'true' : 'false'" :data-loading="loading ? 'true' : 'false'"
             :disabled="href ? undefined : (disabled || loading)" :aria-busy="loading || undefined"
             :aria-label="iconOnly ? label : undefined">
    <ApexIcon v-if="glyph && (iconPos === 'left' || iconPos === 'top')" :name="glyph" :spin="loading" />
    <span v-if="!iconOnly" class="apex-btn__txt" :class="ui?.label"><slot>{{ label }}</slot></span>
    <ApexIcon v-if="glyph && (iconPos === 'right' || iconPos === 'bottom')" :name="glyph" :spin="loading" />
    <ApexIcon v-if="trailingIcon && !loading && iconPos !== 'right'" :name="trailingIcon" />
    <span v-if="badge != null && badge !== ''" class="apex-btn__badge" :class="ui?.badge"
          :data-severity="badgeSeverity || 'contrast'">{{ badge }}</span>
  </component>
</template>
