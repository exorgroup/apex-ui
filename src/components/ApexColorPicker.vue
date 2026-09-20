<script setup lang="ts">
/**
 * ApexColorPicker — composable colour picker: a saturation/value area, hue and
 * alpha sliders (horizontal or vertical, beside the area), swatch presets, a
 * channel readout and a format toggle. Popover by default, `inline` to embed.
 *
 * v-model is a CSS string in `format`. The ApexColor model behind it is
 * exported separately for programmatic work.
 */
import { computed, nextTick, ref, watch, onBeforeUnmount } from 'vue';
import { useFloatLabel } from '../core/useFieldState';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { pickFieldProps } from '../core/utils';
import { ApexColor, type ColorFormat } from '../core/color';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: string | null;
  format?: ColorFormat;
  /** Alpha slider and alpha in the output. */
  showAlpha?: boolean;
  /** Sliders beside the area instead of under it. */
  orientation?: 'horizontal' | 'vertical';
  /** Render in place instead of in a popover. */
  inline?: boolean;
  /** Swatch row under the picker. */
  presets?: string[];
  /** Editable text field with the serialised colour. */
  showInput?: boolean;
  /** hex / rgb / hsl / hsb switcher. */
  showFormatToggle?: boolean;
  /** Numeric channel boxes. */
  showChannels?: boolean;
  placeholder?: string;

  /* The picker's appearance. Sugar over --apex-picker-* and --apex-swatch-*:
     the popover, the square you drag in, the tracks and the swatches. The
     format switcher, the channel boxes and the output row are reachable
     through the remaining variables and the `ui` classes, both on the docs
     page. */
  /** The popover: surface, edge, corner, lift. */
  pickerBackground?: string;
  pickerBorderColor?: string;
  pickerRadius?: string;
  pickerShadow?: string;
  /** The saturation/value square. Its gradient is the colour maths and stays
      as it is; these are its box. */
  areaHeight?: string;
  areaWidth?: string;
  areaRadius?: string;
  /** The marker dragged across the square — its ring, not its fill, which
      always shows the colour under it. */
  thumbColor?: string;
  /** The hue and alpha tracks, and the handle on them. `sliderHeight` is the
      track's thickness; `sliderLength` its long axis, which only applies when
      orientation is vertical (horizontally it fills the width). */
  sliderHeight?: string;
  sliderLength?: string;
  sliderThumbColor?: string;
  /** Every swatch. */
  swatchSize?: string;
  swatchBorderColor?: string;
}>(), {
  format: 'hex', orientation: 'horizontal', showInput: true,
  showAlpha: true, statusIcon: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void;
  (e: 'change', v: ApexColor): void;
}>();

const open = ref(false);
const focused = ref(false);
const root = ref<HTMLElement | null>(null);
const area = ref<HTMLElement | null>(null);
const fmt = ref<ColorFormat>(props.format);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

/**
 * Appearance prop -> CSS variable, on the element wrapping both the box and
 * the popover so it reaches either by cascade. Only what is set.
 */
const pickerStyle = computed(() => {
  const out: Record<string, string> = { position: 'relative' };
  const map: Array<[string | undefined, string]> = [
    [props.pickerBackground, '--apex-picker-bg'],
    [props.pickerBorderColor, '--apex-picker-border'],
    [props.pickerRadius, '--apex-picker-radius'],
    [props.pickerShadow, '--apex-picker-shadow'],
    [props.areaHeight, '--apex-picker-area-h'],
    [props.areaWidth, '--apex-picker-area-w'],
    [props.areaRadius, '--apex-picker-area-radius'],
    [props.thumbColor, '--apex-picker-thumb-border'],
    [props.sliderHeight, '--apex-picker-slider-h'],
    [props.sliderLength, '--apex-picker-slider-length'],
    [props.sliderThumbColor, '--apex-picker-slider-thumb'],
    [props.swatchSize, '--apex-swatch-size'],
    [props.swatchBorderColor, '--apex-swatch-border'],
  ];
  map.forEach(([v, name]) => { if (v) out[name] = v; });
  return out;
});

const color = computed(() => ApexColor.parse(props.modelValue || '#0B5FFF').toFormat(fmt.value));
const hue = computed(() => color.value.getChannelValue('h'));
const sat = computed(() => ApexColor.parse(color.value.toString('hsb')).getChannelValue('s'));
const val = computed(() => color.value.getChannelValue('v'));
const alpha = computed(() => color.value.getChannelValue('a'));
const css = computed(() => color.value.toString(fmt.value));
const solidHue = computed(() => ApexColor.fromHsv(hue.value, 100, 100).toString('hex'));
const channels = computed(() => color.value.getChannels());
const filled = computed(() => !!props.modelValue);

function commit(next: ApexColor) {
  const text = next.toString(fmt.value);
  emit('update:modelValue', text);
  emit('change', next);
}
function setChannel(ch: 'h' | 's' | 'v' | 'a', v: number) { commit(color.value.setChannelValue(ch, v)); }
function nudge(ch: 'h' | 's' | 'v' | 'a', step: number) { commit(color.value.incChannelValue(ch, step)); }

/* ── pointer drag on the SV area ────────────────────────── */
function areaFrom(e: PointerEvent) {
  const el = area.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  const y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
  commit(ApexColor.fromHsv(hue.value, x * 100, (1 - y) * 100, alpha.value, fmt.value));
}
function startArea(e: PointerEvent) {
  if (props.disabled) return;
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  areaFrom(e);
}
function moveArea(e: PointerEvent) {
  if (e.buttons !== 1) return;
  areaFrom(e);
}
function onAreaKey(e: KeyboardEvent) {
  const map: Record<string, [('s' | 'v'), number]> = {
    ArrowRight: ['s', 2], ArrowLeft: ['s', -2], ArrowUp: ['v', 2], ArrowDown: ['v', -2],
  };
  const hit = map[e.key];
  if (!hit) return;
  e.preventDefault();
  nudge(hit[0], hit[1]);
}

function onText(e: Event) {
  const next = ApexColor.parse((e.target as HTMLInputElement).value, css.value);
  commit(next.toFormat(fmt.value));
}
function setFormat(f: ColorFormat) {
  fmt.value = f;
  emit('update:modelValue', color.value.toString(f));
}
function openMenu() {
  if (props.disabled || props.readonly) return;
  open.value = true;
}
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) document.addEventListener('mousedown', onDocClick);
  else document.removeEventListener('mousedown', onDocClick);
});
watch(() => props.format, (f) => { fmt.value = f; });
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocClick);
});

const isFloat = useFloatLabel(props);
defineExpose({ color });
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="filled || (isFloat && !!placeholder)"
             :focused="focused || open" v-slot="{ id, describedBy, invalid, statusGlyph, ui }">
    <div ref="root" :style="pickerStyle">
      <div v-if="!inline" class="apex-ctl" :class="ui.control" :data-focused="(focused || open) ? 'true' : 'false'"
           :data-disabled="disabled ? 'true' : 'false'">
        <button type="button" class="apex-swatch" :class="ui.swatch" :style="{ '--sw': css }" :disabled="disabled"
                :aria-label="'Choose colour'" :aria-expanded="open"
                @click="open ? (open = false) : openMenu()"><i></i></button>
        <input class="apex-ctl__input apex-ctl--mono" :class="ui.input" :id="id" :name="name || id" type="text"
               :value="css" :placeholder="placeholder || '#000000'" :disabled="disabled"
               :readonly="readonly" :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
               :aria-label="labelPlacement === 'hidden' ? label : undefined"
               spellcheck="false" @input="onText" @focus="focused = true" @blur="focused = false" />
        <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
      </div>

      <div v-if="inline || open" class="apex-picker"
           :class="[{ 'apex-picker--inline': inline }, ui.picker]"
           :data-orientation="orientation" role="group" aria-label="Colour picker">
        <div class="apex-picker__main">
          <div ref="area" class="apex-picker__area" :class="ui.area" :style="{ '--hue': solidHue }" tabindex="0"
               role="application" :aria-label="'Saturation and brightness'"
               @pointerdown="startArea" @pointermove="moveArea" @keydown="onAreaKey">
            <span class="apex-picker__thumb" :class="ui.thumb" :style="{ left: sat + '%', top: (100 - val) + '%', '--sw': color.toString('hex') }"></span>
          </div>
          <div class="apex-picker__sliders" :class="ui.sliders">
            <label class="apex-picker__slider apex-picker__slider--hue" :class="ui.slider">
              <span class="sr-only">Hue</span>
              <input type="range" min="0" max="360" step="1" :value="hue" :disabled="disabled"
                     @input="setChannel('h', Number(($event.target as HTMLInputElement).value))" />
            </label>
            <label v-if="showAlpha" class="apex-picker__slider apex-picker__slider--alpha" :class="ui.slider"
                   :style="{ '--solid': ApexColor.parse(css).toString('hex').slice(0, 7) }">
              <span class="sr-only">Opacity</span>
              <input type="range" min="0" max="1" step="0.01" :value="alpha" :disabled="disabled"
                     @input="setChannel('a', Number(($event.target as HTMLInputElement).value))" />
            </label>
          </div>
        </div>

        <div v-if="showFormatToggle" class="apex-picker__formats" :class="ui.formats">
          <button v-for="f in (['hex', 'rgb', 'hsl', 'hsb'] as ColorFormat[])" :key="f" type="button"
                  :class="ui.format"
                  :aria-pressed="fmt === f" @click="setFormat(f)">{{ f }}</button>
        </div>

        <div v-if="showChannels" class="apex-picker__channels" :class="ui.channels">
          <label v-for="(v, k) in channels" :key="k" :class="ui.channel">
            <span>{{ k }}</span>
            <input type="number" :value="v" :step="k === 'a' ? 0.01 : 1"
                   :min="color.getChannelRange(k as any)[0]" :max="color.getChannelRange(k as any)[1]"
                   @input="setChannel(k as any, Number(($event.target as HTMLInputElement).value))" />
          </label>
        </div>

        <div v-if="showInput" class="apex-picker__value" :class="ui.output">
          <span class="apex-swatch apex-swatch--static" :class="ui.swatch" :style="{ '--sw': css }"><i></i></span>
          <input type="text" :value="css" spellcheck="false" @input="onText" />
        </div>

        <div v-if="presets && presets.length" class="apex-picker__presets" :class="ui.presets">
          <button v-for="p in presets" :key="p" type="button" class="apex-swatch" :class="ui.swatch"
                  :style="{ '--sw': p }"
                  :aria-label="p" :data-on="p.toLowerCase() === css.toLowerCase()"
                  @click="commit(ApexColor.parse(p).toFormat(fmt))"><i></i></button>
        </div>
      </div>
    </div>
  </ApexField>
</template>
