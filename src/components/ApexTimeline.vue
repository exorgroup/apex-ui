<script setup lang="ts">
/**
 * ApexTimeline — a series of chained events.
 *
 * Events are arbitrary objects; the `content` slot renders each one, and the
 * optional `opposite` slot fills the other side of the line. `marker` and
 * `connector` replace the drawn parts. Line and marker geometry and colour are
 * all props, so a timeline can be a hairline feed or a thick illustrated track.
 */
import { computed, useSlots } from 'vue';
import ApexIcon from './ApexIcon.vue';
import type { ApexTimelineClasses } from '../types';

type Event = Record<string, unknown>;

const props = withDefaults(defineProps<{
  /** Your own class on any part. See ApexTimelineClasses. */
  ui?: ApexTimelineClasses;
  value?: Event[];
  /** Which side the content sits on. `alternate` zig-zags. */
  align?: 'start' | 'end' | 'alternate';
  layout?: 'vertical' | 'horizontal';
  dataKey?: string;

  /* the line */
  lineColor?: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';

  /* the markers */
  markerSize?: number;
  markerColor?: string;
  markerBorderColor?: string;
  markerBorderWidth?: number;
  markerRadius?: string;
  /** Field on each event holding an icon name, drawn inside its marker. */
  iconField?: string;
  /** Field holding a marker colour, so an event can tint its own. */
  colorField?: string;

  /* spacing */
  gap?: string;
  eventGap?: string;
}>(), {
  align: 'start', layout: 'vertical', lineWidth: 2, lineStyle: 'solid',
  markerSize: 14, markerBorderWidth: 2,
});

const slots = useSlots();
const events = computed(() => props.value || []);
const hasOpposite = computed(() => !!slots.opposite);
const keyOf = (e: Event, i: number) => (props.dataKey ? String(e[props.dataKey] as string) : String(i));

/** Alternating sides are resolved here so the CSS only ever sees start or end. */
const sideOf = (i: number) => (props.align === 'alternate' ? (i % 2 === 0 ? 'start' : 'end') : props.align);

const rootStyle = computed(() => {
  const s: Record<string, string> = {
    '--apex-tl-line-w': props.lineWidth + 'px',
    '--apex-tl-line-style': props.lineStyle,
    '--apex-tl-marker': props.markerSize + 'px',
    '--apex-tl-marker-bw': props.markerBorderWidth + 'px',
  };
  if (props.lineColor) s['--apex-tl-line'] = props.lineColor;
  if (props.markerColor) s['--apex-tl-marker-bg'] = props.markerColor;
  if (props.markerBorderColor) s['--apex-tl-marker-border'] = props.markerBorderColor;
  if (props.markerRadius) s['--apex-tl-marker-radius'] = props.markerRadius;
  if (props.gap) s['--apex-tl-gap'] = props.gap;
  if (props.eventGap) s['--apex-tl-event-gap'] = props.eventGap;
  return s;
});
const markerStyle = (e: Event) => {
  const c = props.colorField ? (e[props.colorField] as string) : undefined;
  return c ? { '--apex-tl-marker-bg': c, '--apex-tl-marker-border': c } : undefined;
};
const iconOf = (e: Event) => (props.iconField ? (e[props.iconField] as string) : undefined);
</script>

<template>
  <div class="apex-tl" :class="ui?.root" :style="rootStyle" :data-layout="layout" :data-align="align"
       :data-opposite="hasOpposite ? 'true' : 'false'">
    <div v-for="(event, i) in events" :key="keyOf(event, i)" class="apex-tl__event" :class="ui?.event"
         :data-side="sideOf(i)" :data-first="i === 0 ? 'true' : undefined"
         :data-last="i === events.length - 1 ? 'true' : undefined">
      <div v-if="hasOpposite" class="apex-tl__opposite" :class="ui?.opposite">
        <slot name="opposite" :item="event" :index="i" />
      </div>

      <div class="apex-tl__sep" :class="ui?.separator">
        <span class="apex-tl__marker" :class="ui?.marker" :style="markerStyle(event)">
          <slot name="marker" :item="event" :index="i">
            <ApexIcon v-if="iconOf(event)" :name="iconOf(event)!" :size="Math.round(markerSize * 0.58)" />
          </slot>
        </span>
        <span v-if="i < events.length - 1" class="apex-tl__conn" :class="ui?.connector">
          <slot name="connector" :item="event" :index="i" />
        </span>
      </div>

      <div class="apex-tl__content" :class="ui?.content">
        <slot name="content" :item="event" :index="i">
          <slot :item="event" :index="i" />
        </slot>
      </div>
    </div>
  </div>
</template>
