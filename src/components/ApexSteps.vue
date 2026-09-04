<script setup lang="ts">
/**
 * ApexSteps — a wizard-style progression.
 *
 * Named for the flow rather than the widget, since ApexStepper is the numeric
 * − value + control.
 *
 * Steps are declared as a `steps` array and their content comes from `panel-<n>`
 * slots, matching ApexSplitter and ApexDataView rather than a four-component
 * family. The header is always rendered; `stepsOnly` drops the panels so the
 * component works as a bare progress indicator.
 */
import { computed, ref, watch } from 'vue';
import type { ApexContainerProps } from '../types';
import ApexIcon from './ApexIcon.vue';
import ApexButton from './ApexButton.vue';

export interface StepsStep {
  /** Stable identifier. Falls back to the 1-based index. */
  value?: string | number;
  label?: string;
  subtitle?: string;
  icon?: string;
  disabled?: boolean;
  /** Marks a step done regardless of position — for a resumed wizard. */
  completed?: boolean;
  /** Blocks a linear stepper from advancing past this step. */
  incomplete?: boolean;
}

const props = withDefaults(defineProps<ApexContainerProps & {
  steps?: StepsStep[];
  /** The active step's `value`. Bindable. */
  modelValue?: string | number;
  orientation?: 'horizontal' | 'vertical';
  /** Each step must be completed before the next becomes reachable. */
  linear?: boolean;
  /** Header only — no panels. */
  stepsOnly?: boolean;
  /** What a header renders as. A button is focusable and clickable. */
  as?: 'button' | 'div';
  /** Show a tick on steps behind the active one. */
  showComplete?: boolean;
  completeIcon?: string;
  /** Built-in Back / Next controls under each panel. */
  showNav?: boolean;
  backLabel?: string;
  nextLabel?: string;
  finishLabel?: string;

  /* appearance */
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  completeColor?: string;
  connectorColor?: string;
  /** Marker diameter in pixels. */
  markerSize?: number;
  /** Hide the connector line between markers. */
  hideConnector?: boolean;
  disabled?: boolean;
}>(), {
  orientation: 'horizontal', as: 'button', showComplete: true, completeIcon: 'check',
  size: 'md', backLabel: 'Back', nextLabel: 'Next', finishLabel: 'Finish',
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string | number): void;
  (e: 'step-change', payload: { value: string | number; index: number; previous: string | number }): void;
  (e: 'finish', payload: { value: string | number; index: number }): void;
}>();

const list = computed(() => props.steps || []);
const valueOf = (step: StepsStep, i: number) => step.value ?? i + 1;

const localValue = ref<string | number | undefined>(undefined);
const active = computed(() => {
  const v = props.modelValue ?? localValue.value;
  if (v !== undefined && list.value.some((s, i) => valueOf(s, i) === v)) return v;
  return list.value.length ? valueOf(list.value[0], 0) : 1;
});
const activeIndex = computed(() => list.value.findIndex((s, i) => valueOf(s, i) === active.value));

/**
 * A step is done when it sits behind the active one, or says so itself — the
 * explicit flag lets a resumed wizard show earlier work as complete without
 * having visited it in this session.
 */
const isComplete = (step: StepsStep, i: number) => step.completed ?? (i < activeIndex.value);

/** In a linear stepper only the current step, its neighbours behind it, and the next unblocked one are reachable. */
function isReachable(step: StepsStep, i: number) {
  if (step.disabled || props.disabled) return false;
  if (!props.linear) return true;
  if (i <= activeIndex.value) return true;
  if (i > activeIndex.value + 1) return false;
  const current = list.value[activeIndex.value];
  return !(current && current.incomplete);
}

function goTo(i: number) {
  const step = list.value[i];
  if (!step || !isReachable(step, i)) return;
  const next = valueOf(step, i);
  if (next === active.value) return;
  const previous = active.value;
  localValue.value = next;
  emit('update:modelValue', next);
  emit('step-change', { value: next, index: i, previous });
}
function back() { goTo(activeIndex.value - 1); }
function next() {
  const i = activeIndex.value;
  if (i === list.value.length - 1) { emit('finish', { value: active.value, index: i }); return; }
  goTo(i + 1);
}

/** Roving focus along the header. */
const headers = ref<HTMLElement[]>([]);
function onKey(i: number, e: KeyboardEvent) {
  const forward = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
  const backward = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
  let target = -1;
  if (e.key === forward) target = Math.min(i + 1, list.value.length - 1);
  else if (e.key === backward) target = Math.max(i - 1, 0);
  else if (e.key === 'Home') target = 0;
  else if (e.key === 'End') target = list.value.length - 1;
  else return;
  e.preventDefault();
  headers.value[target]?.focus();
}

watch(() => props.steps, () => {
  if (props.modelValue === undefined && !list.value.some((s, i) => valueOf(s, i) === localValue.value)) {
    localValue.value = undefined;
  }
});

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.activeColor) s['--apex-steps-active'] = props.activeColor;
  if (props.completeColor) s['--apex-steps-complete'] = props.completeColor;
  if (props.connectorColor) s['--apex-steps-line'] = props.connectorColor;
  if (props.markerSize) s['--apex-steps-marker'] = props.markerSize + 'px';
  return s;
});
const stateOf = (step: StepsStep, i: number) =>
  (i === activeIndex.value ? 'active' : isComplete(step, i) ? 'complete' : 'todo');

defineExpose({ goTo, back, next, activeIndex });
</script>

<template>
  <div class="apex-st" :class="ui?.root" :style="rootStyle" :data-orientation="orientation" :data-size="size"
       :data-linear="linear ? 'true' : 'false'" :data-connector="hideConnector ? 'false' : 'true'"
       :data-disabled="disabled ? 'true' : 'false'">
    <!-- vertical keeps each panel with its own header, so the two interleave -->
    <template v-if="orientation === 'vertical'">
      <div v-for="(step, i) in list" :key="valueOf(step, i)" class="apex-st__item" :class="ui?.item"
           :data-state="stateOf(step, i)">
        <component :is="as" ref="headers" class="apex-st__head" :class="ui?.head"
                   :type="as === 'button' ? 'button' : undefined"
                   :disabled="as === 'button' && !isReachable(step, i) ? true : undefined"
                   :aria-current="i === activeIndex ? 'step' : undefined"
                   :aria-disabled="as !== 'button' && !isReachable(step, i) ? 'true' : undefined"
                   :tabindex="as === 'button' ? undefined : 0"
                   @click="goTo(i)" @keydown="onKey(i, $event)">
          <slot :name="`step-${i + 1}`" :step="step" :index="i" :active="i === activeIndex"
                :complete="isComplete(step, i)" :go-to="() => goTo(i)">
            <span class="apex-st__marker" :class="ui?.marker">
              <ApexIcon v-if="showComplete && isComplete(step, i)" :name="completeIcon" :size="16" />
              <ApexIcon v-else-if="step.icon" :name="step.icon" :size="17" />
              <template v-else>{{ i + 1 }}</template>
            </span>
            <span class="apex-st__text" :class="ui?.text">
              <span class="apex-st__label" :class="ui?.label">{{ step.label }}</span>
              <span v-if="step.subtitle" class="apex-st__sub" :class="ui?.sub">{{ step.subtitle }}</span>
            </span>
          </slot>
          <span v-if="!hideConnector && i < list.length - 1" class="apex-st__rail" :class="ui?.rail" aria-hidden="true"></span>
        </component>

        <div v-if="!stepsOnly" class="apex-st__body" :class="ui?.body" :data-open="i === activeIndex">
          <div v-if="i === activeIndex" class="apex-st__panel" :class="ui?.panel">
            <slot :name="`panel-${i + 1}`" :step="step" :index="i" :back="back" :next="next" />
            <div v-if="showNav" class="apex-st__nav" :class="ui?.nav">
              <ApexButton :disabled="i === 0" variant="ghost" @click="back">{{ backLabel }}</ApexButton>
              <ApexButton @click="next">{{ i === list.length - 1 ? finishLabel : nextLabel }}</ApexButton>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="apex-st__list" :class="ui?.list" role="tablist" :aria-orientation="orientation">
        <div v-for="(step, i) in list" :key="valueOf(step, i)" class="apex-st__item" :class="ui?.item"
             :data-state="stateOf(step, i)">
          <component :is="as" ref="headers" class="apex-st__head" :class="ui?.head"
                     :type="as === 'button' ? 'button' : undefined"
                     :disabled="as === 'button' && !isReachable(step, i) ? true : undefined"
                     :aria-current="i === activeIndex ? 'step' : undefined"
                     :aria-disabled="as !== 'button' && !isReachable(step, i) ? 'true' : undefined"
                     :tabindex="as === 'button' ? undefined : 0"
                     @click="goTo(i)" @keydown="onKey(i, $event)">
            <slot :name="`step-${i + 1}`" :step="step" :index="i" :active="i === activeIndex"
                  :complete="isComplete(step, i)" :go-to="() => goTo(i)">
              <span class="apex-st__marker" :class="ui?.marker">
                <ApexIcon v-if="showComplete && isComplete(step, i)" :name="completeIcon" :size="16" />
                <ApexIcon v-else-if="step.icon" :name="step.icon" :size="17" />
                <template v-else>{{ i + 1 }}</template>
              </span>
              <span class="apex-st__text" :class="ui?.text">
                <span class="apex-st__label" :class="ui?.label">{{ step.label }}</span>
                <span v-if="step.subtitle" class="apex-st__sub" :class="ui?.sub">{{ step.subtitle }}</span>
              </span>
            </slot>
          </component>
        </div>
      </div>

      <div v-if="!stepsOnly" class="apex-st__panel" :class="ui?.panel">
        <slot :name="`panel-${activeIndex + 1}`" :step="list[activeIndex]" :index="activeIndex"
              :back="back" :next="next" />
        <div v-if="showNav" class="apex-st__nav" :class="ui?.nav">
          <ApexButton :disabled="activeIndex === 0" variant="ghost" @click="back">{{ backLabel }}</ApexButton>
          <ApexButton @click="next">{{ activeIndex === list.length - 1 ? finishLabel : nextLabel }}</ApexButton>
        </div>
      </div>
    </template>
  </div>
</template>
