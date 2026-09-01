<script setup lang="ts">
/**
 * ApexAvatar — a person or entity in a fixed square. Shows an image, initials
 * or an icon, with an optional status dot. Initials colour themselves from the
 * label, so a list of people is legible without any per-row configuration.
 */
import { computed } from 'vue';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<{
  /** Image source; falls back to `label` initials, then `icon`. */
  image?: string;
  /** Full name or short text. Initials are derived from it unless `initials` is set. */
  label?: string;
  initials?: string;
  icon?: string;
  shape?: 'circle' | 'rounded' | 'square';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  background?: string;
  color?: string;
  /** Ring around the avatar, for stacking on busy backgrounds. */
  ring?: boolean;
  ringColor?: string;
  /** Status dot: a tone name or any CSS colour. */
  status?: 'online' | 'busy' | 'away' | 'offline' | string;
  /** Where the dot sits. */
  statusPosition?: 'bottom-end' | 'bottom-start' | 'top-end' | 'top-start';
  /** A count or short text pinned to a corner. */
  badge?: string | number;
  badgeSeverity?: 'primary' | 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast';
  badgePosition?: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start';
  badgeBackground?: string;
  badgeColor?: string;
  /** Tint the initials from the label instead of the neutral default. */
  autoColor?: boolean;
  alt?: string;
}>(), { shape: 'circle', size: 'md', statusPosition: 'bottom-end', badgeSeverity: 'danger', badgePosition: 'top-end' });

const derived = computed(() => {
  if (props.initials) return props.initials;
  const words = (props.label || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
});

/** A stable hue per label, so the same person keeps the same colour everywhere. */
const hue = computed(() => {
  const s = props.label || props.initials || '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
});

const TONES: Record<string, string> = {
  online: 'var(--accent-success)',
  busy: 'var(--accent-danger)',
  away: 'var(--accent-warning)',
  offline: 'var(--border-strong)',
};

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (typeof props.size === 'number') s['--av-size'] = props.size + 'px';
  if (props.background) s['--av-bg'] = props.background;
  else if (props.autoColor) s['--av-bg'] = `oklch(0.92 0.06 ${hue.value})`;
  if (props.color) s['--av-fg'] = props.color;
  else if (props.autoColor) s['--av-fg'] = `oklch(0.42 0.13 ${hue.value})`;
  if (props.ringColor) s['--av-ring'] = props.ringColor;
  if (props.status) s['--av-status'] = TONES[props.status] || props.status;
  if (props.badgeBackground) s['--av-badge-bg'] = props.badgeBackground;
  if (props.badgeColor) s['--av-badge-fg'] = props.badgeColor;
  return s;
});
const sizeToken = computed(() => (typeof props.size === 'number' ? undefined : props.size));
</script>

<template>
  <span class="apex-av" :style="rootStyle" :data-shape="shape" :data-size="sizeToken"
        :data-ring="ring ? 'true' : 'false'" :data-status-pos="status ? statusPosition : undefined">
    <img v-if="image" :src="image" :alt="alt ?? label ?? ''" class="apex-av__img" />
    <ApexIcon v-else-if="!derived && icon" :name="icon" class="apex-av__icon" />
    <span v-else-if="derived" class="apex-av__text">{{ derived }}</span>
    <!-- the placeholder is for an avatar with nothing in it: slot content counts
         as content, or a consumer's own glyph lands on top of a silhouette -->
    <ApexIcon v-else-if="!$slots.default" name="person" class="apex-av__icon" />
    <slot />
    <span v-if="badge !== undefined && badge !== ''" class="apex-av__badge"
          :data-severity="badgeSeverity" :data-pos="badgePosition">{{ badge }}</span>
    <span v-if="status" class="apex-av__dot" :aria-label="typeof status === 'string' ? status : undefined"></span>
  </span>
</template>
