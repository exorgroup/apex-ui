<script setup lang="ts">
/**
 * ApexAvatarGroup — overlapping avatars with an optional overflow count.
 * Pass `people` for the common case, or drop ApexAvatar children in the slot.
 */
import { computed } from 'vue';
import ApexAvatar from './ApexAvatar.vue';

export interface AvatarPerson {
  label?: string;
  image?: string;
  initials?: string;
  icon?: string;
  status?: string;
}

const props = withDefaults(defineProps<{
  people?: AvatarPerson[];
  /** Show at most this many, then a +N counter. */
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  shape?: 'circle' | 'rounded' | 'square';
  /** How much each avatar overlaps the one before it. Defaults to a share of the size. */
  overlap?: string;
  autoColor?: boolean;
  ring?: boolean;
  ringColor?: string;
}>(), { size: 'md', shape: 'circle', ring: true });

/** A fixed overlap that suits md clips the initials at lg, so scale it with the size. */
const AV_PX: Record<string, number> = { xs: 24, sm: 30, md: 38, lg: 52, xl: 72 };
const overlapDefault = computed(() => {
  const px = typeof props.size === 'number' ? props.size : (AV_PX[props.size] ?? 38);
  return Math.round(px * 0.22) + 'px';
});

const shown = computed(() => (props.max != null ? (props.people || []).slice(0, props.max) : (props.people || [])));
const extra = computed(() => Math.max(0, (props.people || []).length - shown.value.length));
const rootStyle = computed(() => ({ '--av-overlap': props.overlap || overlapDefault.value }));
</script>

<template>
  <div class="apex-avg" :style="rootStyle">
    <slot>
      <ApexAvatar v-for="(p, i) in shown" :key="i" v-bind="p" :size="size" :shape="shape"
                  :auto-color="autoColor" :ring="ring" :ring-color="ringColor" />
      <ApexAvatar v-if="extra" :label="`+${extra}`" :initials="`+${extra}`" :size="size" :shape="shape"
                  :ring="ring" :ring-color="ringColor" />
    </slot>
  </div>
</template>
