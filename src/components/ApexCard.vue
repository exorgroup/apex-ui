<script setup lang="ts">
/**
 * ApexCard — a container with optional media, header, body and footer.
 *
 * Every region is a slot, and the common cases (`title`, `subtitle`, `image`)
 * are props so a plain card needs no markup at all.
 */
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  title?: string;
  subtitle?: string;
  /** Media across the top of the card. */
  image?: string;
  imageAlt?: string;
  imageHeight?: string;

  /* presentation */
  bordered?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  radius?: string;
  padding?: string;
  background?: string;
  borderColor?: string;
  /** Lift on hover — for cards that are links or open something. */
  hoverable?: boolean;
  /** Renders as a button and emits click. */
  clickable?: boolean;
  href?: string;
  /** Body content flows in a row rather than a column. */
  horizontal?: boolean;
}>(), { bordered: true, shadow: 'sm' });

const emit = defineEmits<{ (e: 'click', ev: MouseEvent): void }>();

const tag = computed(() => (props.href ? 'a' : props.clickable ? 'button' : 'article'));
const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.radius) s['--apex-card-radius'] = props.radius;
  if (props.padding) s['--apex-card-pad'] = props.padding;
  if (props.background) s['--apex-card-bg'] = props.background;
  if (props.borderColor) s['--apex-card-border'] = props.borderColor;
  if (props.imageHeight) s['--apex-card-media-h'] = props.imageHeight;
  return s;
});
</script>

<template>
  <component :is="tag" class="apex-cd" :style="rootStyle" :href="href"
             :type="tag === 'button' ? 'button' : undefined"
             :data-bordered="bordered ? 'true' : 'false'" :data-shadow="shadow"
             :data-hoverable="(hoverable || clickable || !!href) ? 'true' : 'false'"
             :data-horizontal="horizontal ? 'true' : 'false'"
             @click="(clickable || href) && emit('click', $event)">
    <div v-if="image || $slots.media" class="apex-cd__media">
      <slot name="media">
        <img :src="image" :alt="imageAlt || ''" />
      </slot>
    </div>

    <header v-if="title || subtitle || $slots.header" class="apex-cd__head">
      <slot name="header">
        <h3 v-if="title" class="apex-cd__title">{{ title }}</h3>
        <p v-if="subtitle" class="apex-cd__sub">{{ subtitle }}</p>
      </slot>
    </header>

    <div v-if="$slots.default" class="apex-cd__body"><slot /></div>

    <footer v-if="$slots.footer" class="apex-cd__foot"><slot name="footer" /></footer>
  </component>
</template>
