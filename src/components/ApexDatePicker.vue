<script setup lang="ts">
/**
 * ApexDatePicker — calendar popup on the ApexSelect shell.
 *
 * Single, multiple or range selection; date / month / year views; optional time
 * picker in 12 or 24 hour format; min/max and disabled-date boundaries; button
 * bar; multiple months side by side; locale objects; inline mode; and a `date`
 * slot for custom cell content.
 *
 * `modelType` decides what v-model holds: 'date' (default) or 'string'
 * formatted with `dateFormat`.
 */
import { computed, nextTick, ref, watch, onBeforeUnmount } from 'vue';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { pickFieldProps } from '../core/utils';
import {
  EN_LOCALE, addMonths, formatDate, formatTime, isSameDay, monthGrid,
  parseDate, startOfDay, weekdayLabels, type ApexDateLocale,
} from '../core/dates';
import type { ApexFieldProps } from '../types';

type DateValue = Date | string | null;

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: DateValue | DateValue[];
  /** jQuery-UI style tokens: d dd o oo D DD m mm M MM y yy @ ! '…' */
  dateFormat?: string;
  /** What v-model holds. */
  modelType?: 'date' | 'string';
  selectionMode?: 'single' | 'multiple' | 'range';
  locale?: Partial<ApexDateLocale>;
  placeholder?: string;
  /** Calendar button beside the field. */
  showIcon?: boolean;
  icon?: string;
  clearable?: boolean;
  /** Render the calendar in place instead of a popup. */
  inline?: boolean;
  /** date | month | year — the level the picker selects at. */
  view?: 'date' | 'month' | 'year';
  numberOfMonths?: number;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  /** Day indexes to disable, 0 = Sunday. */
  disabledDays?: number[];
  showButtonBar?: boolean;
  showTime?: boolean;
  timeOnly?: boolean;
  hourFormat?: '12' | '24';
  showSeconds?: boolean;
  stepMinute?: number;
  /** Block typing and only allow the calendar. */
  readonlyInput?: boolean;
  /** Show the week's ISO number down the side. */
  showWeek?: boolean;

  /* The calendar's appearance. These are sugar over --apex-cal-*: the popover
     itself, and every state a day can be in. The rest of the calendar — title
     and nav, the month/year grids, the time spinners, the meridiem toggle, the
     button bar — is reachable through the remaining variables and the `ui`
     classes, both listed on the docs page. */
  /** The popover: its surface, edge, corner and lift. */
  calendarBackground?: string;
  calendarBorderColor?: string;
  calendarRadius?: string;
  calendarShadow?: string;
  /** A day at rest, and its corner. */
  dayColor?: string;
  dayRadius?: string;
  /** Under the pointer. */
  dayHoverBackground?: string;
  /** The selected day. Set both — the text is #fff by default, which a light
      background leaves unreadable. */
  daySelectedBackground?: string;
  daySelectedColor?: string;
  /** Today's ring, a day spilling in from the neighbouring month, and the
      band between the two ends of a range. */
  dayTodayRing?: string;
  dayOutsideColor?: string;
  dayRangeBackground?: string;
}>(), {
  dateFormat: 'dd/mm/yy', modelType: 'date', selectionMode: 'single', view: 'date',
  numberOfMonths: 1, hourFormat: '24', stepMinute: 1, statusIcon: true, icon: 'calendar_month',
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: DateValue | DateValue[]): void;
  (e: 'change'): void;
  (e: 'month-change', payload: { month: number; year: number }): void;
}>();

const loc = computed<ApexDateLocale>(() => ({ ...EN_LOCALE, ...(props.locale || {}) }));
const focused = ref(false);
const open = ref(false);
const root = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const typed = ref<string | null>(null);
const panel = ref<'date' | 'month' | 'year'>(props.view);
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

/**
 * Appearance prop -> CSS variable, set on the element that wraps both the box
 * and the calendar so it reaches the popover by cascade. Only what is set, so
 * an untouched picker carries nothing extra.
 */
const calStyle = computed(() => {
  const out: Record<string, string> = { position: 'relative' };
  const map: Array<[string | undefined, string]> = [
    [props.calendarBackground, '--apex-cal-bg'],
    [props.calendarBorderColor, '--apex-cal-border'],
    [props.calendarRadius, '--apex-cal-radius'],
    [props.calendarShadow, '--apex-cal-shadow'],
    [props.dayColor, '--apex-cal-day-fg'],
    [props.dayRadius, '--apex-cal-day-radius'],
    [props.dayHoverBackground, '--apex-cal-day-hover-bg'],
    [props.daySelectedBackground, '--apex-cal-day-selected-bg'],
    [props.daySelectedColor, '--apex-cal-day-selected-fg'],
    [props.dayTodayRing, '--apex-cal-day-today-ring'],
    [props.dayOutsideColor, '--apex-cal-day-outside-fg'],
    [props.dayRangeBackground, '--apex-cal-day-range-bg'],
  ];
  map.forEach(([v, name]) => { if (v) out[name] = v; });
  return out;
});

/* ── model in / out ─────────────────────────────────────── */
const toDate = (v: DateValue): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  return parseDate(String(v), props.dateFormat, loc.value);
};
const out = (d: Date | null): DateValue => {
  if (!d) return null;
  return props.modelType === 'string' ? fullFormat(d) : d;
};
function fullFormat(d: Date) {
  const datePart = props.timeOnly ? '' : formatDate(d, props.dateFormat, loc.value);
  const timePart = props.showTime || props.timeOnly ? formatTime(d, props.hourFormat, props.showSeconds, loc.value) : '';
  return [datePart, timePart].filter(Boolean).join(' ');
}

const dates = computed<Date[]>(() => {
  const v = props.modelValue;
  if (v == null) return [];
  const arr = Array.isArray(v) ? v : [v];
  return arr.map(toDate).filter(Boolean) as Date[];
});
const single = computed(() => dates.value[0] || null);
const rangeStart = computed(() => (props.selectionMode === 'range' ? dates.value[0] || null : null));
const rangeEnd = computed(() => (props.selectionMode === 'range' ? dates.value[1] || null : null));

const display = computed(() => {
  if (typed.value !== null) return typed.value;
  if (!dates.value.length) return '';
  if (props.selectionMode === 'range') {
    const [a, b] = dates.value;
    return [a && fullFormat(a), b && fullFormat(b)].filter(Boolean).join(' – ');
  }
  if (props.selectionMode === 'multiple') return dates.value.map((d) => formatDate(d, props.dateFormat, loc.value)).join(', ');
  return fullFormat(dates.value[0]);
});
const filled = computed(() => !!dates.value.length);

/* ── view state ─────────────────────────────────────────── */
const cursor = ref<Date>(startOfDay(single.value || new Date()));
watch(() => props.modelValue, () => { if (single.value) cursor.value = startOfDay(single.value); });

const months = computed(() => Array.from({ length: props.numberOfMonths }, (_, i) => addMonths(cursor.value, i)));
const weekdays = computed(() => weekdayLabels(loc.value));
const yearRange = computed(() => {
  const base = Math.floor(cursor.value.getFullYear() / 12) * 12;
  return Array.from({ length: 12 }, (_, i) => base + i);
});

function shift(n: number) {
  if (panel.value === 'year') cursor.value = new Date(cursor.value.getFullYear() + n * 12, cursor.value.getMonth(), 1);
  else if (panel.value === 'month') cursor.value = new Date(cursor.value.getFullYear() + n, cursor.value.getMonth(), 1);
  else cursor.value = addMonths(cursor.value, n);
  emit('month-change', { month: cursor.value.getMonth(), year: cursor.value.getFullYear() });
}

/* ── availability ───────────────────────────────────────── */
function disabledDate(d: Date) {
  if (props.minDate && startOfDay(d) < startOfDay(props.minDate)) return true;
  if (props.maxDate && startOfDay(d) > startOfDay(props.maxDate)) return true;
  if (props.disabledDays?.includes(d.getDay())) return true;
  if (props.disabledDates?.some((x) => isSameDay(x, d))) return true;
  return false;
}
function selected(d: Date) {
  if (props.selectionMode === 'range') return isSameDay(d, rangeStart.value) || isSameDay(d, rangeEnd.value);
  return dates.value.some((x) => isSameDay(x, d));
}
function inRange(d: Date) {
  if (props.selectionMode !== 'range' || !rangeStart.value || !rangeEnd.value) return false;
  const t = startOfDay(d).getTime();
  return t > startOfDay(rangeStart.value).getTime() && t < startOfDay(rangeEnd.value).getTime();
}

/* ── selection ──────────────────────────────────────────── */
function carryTime(d: Date) {
  const base = single.value;
  if ((props.showTime || props.timeOnly) && base) d.setHours(base.getHours(), base.getMinutes(), base.getSeconds());
  return d;
}
function pick(d: Date) {
  if (disabledDate(d)) return;
  typed.value = null;
  const day = carryTime(new Date(d.getFullYear(), d.getMonth(), d.getDate()));
  if (props.selectionMode === 'multiple') {
    const cur = dates.value.filter((x) => !isSameDay(x, day));
    if (cur.length === dates.value.length) cur.push(day);
    emit('update:modelValue', cur.map(out) as DateValue[]);
  } else if (props.selectionMode === 'range') {
    if (!rangeStart.value || rangeEnd.value) emit('update:modelValue', [out(day), null]);
    else if (day < rangeStart.value) emit('update:modelValue', [out(day), out(rangeStart.value)]);
    else emit('update:modelValue', [out(rangeStart.value), out(day)]);
  } else {
    emit('update:modelValue', out(day));
    if (!props.showTime && !props.inline) open.value = false;
  }
  emit('change');
}
function pickMonth(m: number) {
  cursor.value = new Date(cursor.value.getFullYear(), m, 1);
  if (props.view === 'month') { emit('update:modelValue', out(new Date(cursor.value))); emit('change'); if (!props.inline) open.value = false; }
  else panel.value = 'date';
}
function pickYear(y: number) {
  cursor.value = new Date(y, cursor.value.getMonth(), 1);
  if (props.view === 'year') { emit('update:modelValue', out(new Date(y, 0, 1))); emit('change'); if (!props.inline) open.value = false; }
  else panel.value = props.view === 'month' ? 'month' : 'month';
}
function setTime(part: 'h' | 'm' | 's', delta: number) {
  const base = single.value ? new Date(single.value) : new Date();
  if (part === 'h') base.setHours(base.getHours() + delta);
  if (part === 'm') base.setMinutes(base.getMinutes() + delta * props.stepMinute);
  if (part === 's') base.setSeconds(base.getSeconds() + delta);
  emit('update:modelValue', out(base));
  emit('change');
}
function toggleMeridiem() {
  const base = single.value ? new Date(single.value) : new Date();
  base.setHours((base.getHours() + 12) % 24);
  emit('update:modelValue', out(base));
}
function today() { pick(new Date()); }
function clear() {
  typed.value = null;
  emit('update:modelValue', props.selectionMode === 'single' ? null : []);
  emit('change');
}

/* ── typing ─────────────────────────────────────────────── */
function onType(e: Event) {
  const text = (e.target as HTMLInputElement).value;
  typed.value = text;
  const d = parseDate(text, props.dateFormat, loc.value);
  if (d && !disabledDate(d)) { cursor.value = startOfDay(d); emit('update:modelValue', out(d)); }
}
function commit() {
  focused.value = false;
  if (typed.value !== null) {
    const d = parseDate(typed.value, props.dateFormat, loc.value);
    if (!d || disabledDate(d)) emit('update:modelValue', props.selectionMode === 'single' ? null : []);
    typed.value = null;
  }
}

function openMenu() {
  if (props.disabled || props.readonly) return;
  panel.value = props.view;
  open.value = true;
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') { open.value = false; return; }
  if (e.key === 'ArrowDown' && !open.value) { e.preventDefault(); openMenu(); }
}
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) { open.value = false; commit(); }
}
watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) document.addEventListener('mousedown', onDocClick);
  else document.removeEventListener('mousedown', onDocClick);
});
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocClick);
});

const hourText = computed(() => {
  const d = single.value || new Date();
  const h = props.hourFormat === '12' ? (d.getHours() % 12 || 12) : d.getHours();
  return String(h).padStart(2, '0');
});
const minuteText = computed(() => String((single.value || new Date()).getMinutes()).padStart(2, '0'));
const secondText = computed(() => String((single.value || new Date()).getSeconds()).padStart(2, '0'));
const meridiem = computed(() => ((single.value || new Date()).getHours() < 12 ? loc.value.am : loc.value.pm));
const isFloat = computed(() => String(props.labelPlacement || '').startsWith('float'));
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="filled || (isFloat && !!placeholder)" :focused="focused || open"
             v-slot="{ id, describedBy, invalid, statusGlyph, ui }">
    <div ref="root" :style="calStyle">
      <div v-if="!inline" class="apex-ctl" :class="ui.control" :data-focused="(focused || open) ? 'true' : 'false'"
           :data-disabled="disabled ? 'true' : 'false'">
        <ApexIcon v-if="!showIcon" :name="icon" class="apex-ctl__icon" :class="ui.icon" />
        <input ref="inputEl" class="apex-ctl__input" :class="ui.input" :id="id" :name="name || id" type="text"
               :value="display" :placeholder="placeholder || dateFormat"
               :disabled="disabled" :readonly="readonly || readonlyInput" :required="required"
               :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
               :aria-label="labelPlacement === 'hidden' ? label : undefined"
               autocomplete="off" @input="onType" @focus="focused = true" @blur="commit"
               @keydown="onKey" @click="readonlyInput && openMenu()" />
        <button v-if="clearable && filled && !disabled" type="button" class="apex-ctl__btn" :class="ui.button"
                aria-label="Clear" @click="clear">
          <ApexIcon name="close" :size="17" />
        </button>
        <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
        <button v-if="showIcon" type="button" class="apex-ctl__btn" :class="ui.button" :disabled="disabled"
                :aria-label="'Open calendar'" :aria-expanded="open" @click="open ? (open = false) : openMenu()">
          <ApexIcon :name="icon" :size="19" />
        </button>
      </div>

      <div v-if="inline || open" class="apex-cal"
           :class="[{ 'apex-cal--inline': inline }, ui.calendar]" role="dialog">
        <!-- time only -->
        <template v-if="!timeOnly">
          <div class="apex-cal__nav" :class="ui.nav">
            <button type="button" class="apex-ctl__btn" aria-label="Previous" @click="shift(-1)">
              <ApexIcon name="chevron_left" :size="20" />
            </button>
            <div class="apex-cal__title" :class="ui.title">
              <button v-if="panel === 'date'" type="button" @click="panel = 'month'">
                {{ loc.monthNames[cursor.getMonth()] }}
              </button>
              <button type="button" @click="panel = 'year'">{{ cursor.getFullYear() }}</button>
            </div>
            <button type="button" class="apex-ctl__btn" aria-label="Next" @click="shift(1)">
              <ApexIcon name="chevron_right" :size="20" />
            </button>
          </div>

          <div v-if="panel === 'date'" class="apex-cal__months" :class="ui.months">
            <div v-for="(m, mi) in months" :key="mi" class="apex-cal__month" :class="ui.month">
              <p v-if="numberOfMonths > 1" class="apex-cal__mlabel" :class="ui.monthLabel">{{ loc.monthNames[m.getMonth()] }} {{ m.getFullYear() }}</p>
              <div class="apex-cal__grid" :class="ui.grid">
                <span v-for="w in weekdays" :key="w" class="apex-cal__wd" :class="ui.weekday">{{ w }}</span>
                <button v-for="cell in monthGrid(m.getFullYear(), m.getMonth(), loc.firstDayOfWeek)"
                        :key="cell.date.toISOString()" type="button" class="apex-cal__day" :class="ui.day"
                        :data-outside="cell.outside ? 'true' : 'false'"
                        :data-today="isSameDay(cell.date, new Date()) ? 'true' : 'false'"
                        :data-selected="selected(cell.date) ? 'true' : 'false'"
                        :data-inrange="inRange(cell.date) ? 'true' : 'false'"
                        :disabled="disabledDate(cell.date)"
                        :aria-label="formatDate(cell.date, 'DD d MM yy', loc)"
                        @click="pick(cell.date)">
                  <slot name="date" :date="cell.date" :outside="cell.outside" :selected="selected(cell.date)">
                    {{ cell.date.getDate() }}
                  </slot>
                </button>
              </div>
            </div>
          </div>

          <div v-else-if="panel === 'month'" class="apex-cal__pick" :class="ui.pick">
            <button v-for="(mn, i) in loc.monthNamesShort" :key="mn" type="button"
                    :data-selected="single && single.getMonth() === i && single.getFullYear() === cursor.getFullYear() ? 'true' : 'false'"
                    @click="pickMonth(i)">{{ mn }}</button>
          </div>

          <div v-else class="apex-cal__pick" :class="ui.pick">
            <button v-for="y in yearRange" :key="y" type="button"
                    :data-selected="single && single.getFullYear() === y ? 'true' : 'false'"
                    @click="pickYear(y)">{{ y }}</button>
          </div>
        </template>

        <div v-if="showTime || timeOnly" class="apex-cal__time" :class="ui.time">
          <div class="apex-cal__spin" :class="ui.spin">
            <button type="button" aria-label="Hour up" @click="setTime('h', 1)"><ApexIcon name="keyboard_arrow_up" :size="18" /></button>
            <span>{{ hourText }}</span>
            <button type="button" aria-label="Hour down" @click="setTime('h', -1)"><ApexIcon name="keyboard_arrow_down" :size="18" /></button>
          </div>
          <em>:</em>
          <div class="apex-cal__spin" :class="ui.spin">
            <button type="button" aria-label="Minute up" @click="setTime('m', 1)"><ApexIcon name="keyboard_arrow_up" :size="18" /></button>
            <span>{{ minuteText }}</span>
            <button type="button" aria-label="Minute down" @click="setTime('m', -1)"><ApexIcon name="keyboard_arrow_down" :size="18" /></button>
          </div>
          <template v-if="showSeconds">
            <em>:</em>
            <div class="apex-cal__spin" :class="ui.spin">
              <button type="button" aria-label="Second up" @click="setTime('s', 1)"><ApexIcon name="keyboard_arrow_up" :size="18" /></button>
              <span>{{ secondText }}</span>
              <button type="button" aria-label="Second down" @click="setTime('s', -1)"><ApexIcon name="keyboard_arrow_down" :size="18" /></button>
            </div>
          </template>
          <button v-if="hourFormat === '12'" type="button" class="apex-cal__mer" :class="ui.meridiem"
                  @click="toggleMeridiem">{{ meridiem }}</button>
        </div>

        <div v-if="showButtonBar" class="apex-cal__bar" :class="ui.bar">
          <button type="button" @click="today">{{ loc.today }}</button>
          <button type="button" @click="clear">{{ loc.clear }}</button>
        </div>
      </div>
    </div>
  </ApexField>
</template>
