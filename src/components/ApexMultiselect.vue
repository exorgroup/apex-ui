<script setup lang="ts">
/**
 * ApexMultiselect — ApexSelect with multiple selection. Same trigger, same
 * popover, same filter and icon/image support; the value is an array, chosen
 * options show as chips in the field and stay ticked in the list.
 */
import { computed, nextTick, ref, watch, onBeforeUnmount } from 'vue';
import { useFloatLabel } from '../core/useFieldState';
import { useAnchoredOverlay } from '../core/anchoredOverlay';
import ApexField from './ApexField.vue';
import ApexIcon from './ApexIcon.vue';
import { normaliseOptions, pickFieldProps } from '../core/utils';
import { useApexI18n } from '../core/i18n';
import { useCanCreate } from '../core/canCreate';
import type { ApexFieldProps, ApexOption, ApexOptionsInput } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  modelValue?: unknown[];
  options?: ApexOptionsInput;
  placeholder?: string;
  leadingIcon?: string;
  clearable?: boolean;
  loading?: boolean;
  /** Cap the number of selections. */
  max?: number;
  /** Collapse to "N selected" past this many chips. */
  maxChips?: number;
  /** Search box at the top of the popover. */
  filter?: boolean;
  filterPlaceholder?: string;
  /** Show the filter automatically once there are this many options. */
  filterThreshold?: number;
  /** Select all / clear all row above the list. */
  toggleAll?: boolean;

  /**
   * Offer an "Add new" row at the foot of the list. Activating it emits
   * `add-new` and closes the overlay; it is not an option, so it never
   * toggles and never counts towards `max`.
   */
  addNew?: boolean;
  /** Row text while the filter is empty. With a query it reads Add "…". */
  addNewLabel?: string;
  /** What is being created, passed to the app-level canCreate resolver. */
  resource?: string;
  /** Overrides the resolver. Set it and no resolver is consulted. */
  canAddNew?: boolean;
}>(), {
  statusIcon: true,
  /* Tri-state: yes, no, or "ask the resolver". Vue casts an absent boolean
     prop to false, which would read as a denial and silence the resolver. */
  canAddNew: undefined,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: unknown[]): void;
  (e: 'change'): void;
  /** The row was activated. `query` is whatever was typed in the filter. */
  (e: 'add-new', payload: { query: string }): void;
}>();

const t = useApexI18n();
const focused = ref(false);
const open = ref(false);
const active = ref(-1);
const query = ref('');
const root = ref<HTMLElement | null>(null);
const trigger = ref<HTMLElement | null>(null);
/* AF2-322. The panel was `position: absolute` under a `position: relative`
   wrapper, which any `overflow: auto` ancestor clips — a scrollable form, a
   drawer, an accordion, a table cell. Fixed positioning escapes the clip and
   the node stays where it was in the DOM. `matchWidth` is not cosmetic: the
   old CSS used `inset-inline: 0` to take the field's width, and under `fixed`
   that would resolve against the viewport. */
const pop = ref<HTMLElement | null>(null);
const { style: popStyle } = useAnchoredOverlay({
  open, anchor: trigger, panel: pop, matchWidth: true, zIndex: 1150,
});

const filterEl = ref<HTMLInputElement | null>(null);

const allOpts = computed(() => normaliseOptions(props.options));
const showFilter = computed(() => props.filter || (props.filterThreshold != null && allOpts.value.length >= props.filterThreshold));

const canCreate = useCanCreate();
const showAddNew = computed(() => props.addNew && canCreate(props.canAddNew, props.resource));
const addNewText = computed(() => (query.value.trim()
  ? `Add “${query.value.trim()}”`
  : props.addNewLabel || t('apexui.addNew')));

function pickAddNew() {
  /* Close first: a dialog or a route is about to take over. */
  open.value = false;
  emit('add-new', { query: query.value.trim() });
}
const opts = computed(() => {
  const q = query.value.toLowerCase().trim();
  return q ? allOpts.value.filter((o) => o.label.toLowerCase().includes(q)) : allOpts.value;
});
const selected = computed(() => props.modelValue || []);
const chips = computed(() => allOpts.value.filter((o) => selected.value.includes(o.value)));
const overflow = computed(() => (props.maxChips != null && chips.value.length > props.maxChips ? chips.value.length - props.maxChips : 0));
const shownChips = computed(() => (overflow.value ? chips.value.slice(0, props.maxChips) : chips.value));
const atMax = computed(() => props.max != null && selected.value.length >= props.max);
const allSelected = computed(() => allOpts.value.length > 0 && allOpts.value.every((o) => selected.value.includes(o.value)));
const listId = computed(() => 'apex-ms-' + (props.id || props.name || 'list'));
const fieldProps = computed(() => pickFieldProps(props as unknown as Record<string, unknown>));

function toggle(o: ApexOption) {
  if (o.disabled) return;
  const cur = [...selected.value];
  const i = cur.indexOf(o.value);
  if (i >= 0) cur.splice(i, 1);
  else { if (atMax.value) return; cur.push(o.value); }
  emit('update:modelValue', cur);
  emit('change');
}
function toggleEverything() {
  emit('update:modelValue', allSelected.value ? [] : allOpts.value.filter((o) => !o.disabled).map((o) => o.value));
  emit('change');
}
function openMenu() {
  if (props.disabled || props.readonly) return;
  query.value = '';
  open.value = true;
  active.value = 0;
  if (showFilter.value) nextTick(() => filterEl.value?.focus());
}
function onKey(e: KeyboardEvent) {
  if (props.disabled) return;
  if (e.key === 'Escape' || e.key === 'Tab') { open.value = false; return; }
  if (!open.value && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) { e.preventDefault(); openMenu(); return; }
  if (!open.value) return;
  /* One past the last option, so the row is keyboard-reachable like any other. */
  const last = opts.value.length - 1 + (showAddNew.value ? 1 : 0);
  if (e.key === 'ArrowDown') { e.preventDefault(); active.value = Math.min(active.value + 1, last); }
  if (e.key === 'ArrowUp') { e.preventDefault(); active.value = Math.max(active.value - 1, 0); }
  if (e.key === 'Home') { e.preventDefault(); active.value = 0; }
  if (e.key === 'End') { e.preventDefault(); active.value = last; }
  if (e.key === 'Enter') {
    e.preventDefault();
    /* The row is not an option: it opens a form rather than toggling. */
    if (showAddNew.value && active.value === opts.value.length) pickAddNew();
    else if (opts.value[active.value]) toggle(opts.value[active.value]);
  }
  if (e.key === 'Backspace' && !query.value && selected.value.length) {
    const last = allOpts.value.find((o) => o.value === selected.value[selected.value.length - 1]);
    if (last) toggle(last);
  }
}
function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false;
}
watch(open, (v) => {
  if (typeof document === 'undefined') return;
  if (v) document.addEventListener('mousedown', onDocClick);
  else document.removeEventListener('mousedown', onDocClick);
});
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.removeEventListener('mousedown', onDocClick);
});
const isFloat = useFloatLabel(props);
</script>

<template>
  <ApexField v-bind="fieldProps" :value="modelValue" :filled="chips.length > 0 || (isFloat && !!placeholder)" :focused="focused || open"
             v-slot="{ id, describedBy, invalid, statusGlyph, ui }">
    <div ref="root" style="position:relative">
      <div ref="trigger" class="apex-ctl apex-ctl--trigger apex-ctl--multi" :class="ui.control" role="combobox" :id="id"
           :aria-expanded="open" aria-haspopup="listbox" :aria-controls="listId"
           :aria-describedby="describedBy" :aria-invalid="invalid || undefined"
           :aria-label="labelPlacement === 'hidden' ? label : undefined"
           :tabindex="disabled ? -1 : 0" :data-focused="(focused || open) ? 'true' : 'false'"
           :data-disabled="disabled ? 'true' : 'false'"
           @click="open ? (open = false) : openMenu()" @keydown="onKey"
           @focus="focused = true" @blur="focused = false">
        <ApexIcon v-if="leadingIcon" :name="leadingIcon" class="apex-ctl__icon" :class="ui.icon" />
        <span v-for="c in shownChips" :key="String(c.value)" class="apex-chip" :class="ui.chip">
          <img v-if="c.image" class="apex-chip__img" :class="ui.thumbnail" :src="c.image" alt="" />
          <ApexIcon v-else-if="c.icon" :name="c.icon" :size="15" />
          {{ c.label }}
          <button type="button" :aria-label="`${t('apexui.remove')} ${c.label}`"
                  :disabled="disabled" @click.stop="toggle(c)">
            <ApexIcon name="close" />
          </button>
        </span>
        <span v-if="overflow" class="apex-chip apex-chip--more" :class="ui.chip">+{{ overflow }}</span>
        <span v-if="!chips.length" class="apex-ctl__ph" :class="ui.placeholder">{{ placeholder || t('apexui.select') }}</span>
        <ApexIcon v-if="loading" name="progress_activity" spin class="apex-ctl__icon" :class="ui.icon" />
        <button v-if="clearable && chips.length && !disabled" type="button" class="apex-ctl__btn" :class="ui.button"
                :aria-label="t('apexui.clear')" @click.stop="emit('update:modelValue', [])">
          <ApexIcon name="close" :size="17" />
        </button>
        <ApexIcon v-if="statusGlyph" :name="statusGlyph" class="apex-ctl__status" :size="18" />
        <ApexIcon name="keyboard_arrow_down" class="apex-ctl__icon apex-ctl__chev" :class="ui.chevron" :size="19" :data-open="open" />
      </div>

      <div v-if="open" ref="pop" class="apex-pop" :class="ui.popover" :style="popStyle" :id="listId" role="listbox" aria-multiselectable="true">
        <div v-if="showFilter" class="apex-pop__filter" :class="ui?.filter">
          <ApexIcon name="search" />
          <input ref="filterEl" type="text" :value="query" :placeholder="filterPlaceholder || t('apexui.search')"
                 :aria-label="t('apexui.search')" autocomplete="off"
                 @input="query = ($event.target as HTMLInputElement).value; active = 0" @keydown="onKey" />
          <button v-if="query" type="button" class="apex-ctl__btn" :class="ui.button" :aria-label="t('apexui.clear')"
                  @click="query = ''; filterEl?.focus()">
            <ApexIcon name="close" :size="16" />
          </button>
        </div>
        <button v-if="toggleAll && !query" type="button" class="apex-pop__all" :class="ui?.selectAll" @click="toggleEverything">
          {{ allSelected ? t('apexui.clear') : t('apexui.select') }}
          <span>{{ selected.length }} / {{ allOpts.length }}</span>
        </button>
        <button v-for="(o, i) in opts" :key="String(o.value)" :id="listId + '-' + i" type="button"
                class="apex-pop__opt" :class="ui.option" role="option" :aria-selected="selected.includes(o.value)"
                :data-active="i === active ? 'true' : 'false'"
                :disabled="o.disabled || (atMax && !selected.includes(o.value))"
                @mouseenter="active = i" @click="toggle(o)">
          <span class="apex-pop__box" :class="ui?.checkbox" :data-on="selected.includes(o.value)" aria-hidden="true">
            <ApexIcon v-if="selected.includes(o.value)" name="check" :size="15" />
          </span>
          <img v-if="o.image" class="apex-pop__img" :class="ui.thumbnail" :src="o.image" alt="" />
          <ApexIcon v-else-if="o.icon" :name="o.icon" :size="18" />
          <span>
            {{ o.label }}
            <span v-if="o.help" class="apex-pop__help" :class="ui.optionHelp">{{ o.help }}</span>
          </span>
        </button>
        <p v-if="!opts.length" class="apex-pop__empty" :class="ui.empty">{{ t('apexui.noResults') }}</p>
        <button v-if="showAddNew" type="button" class="apex-pop__add" :class="ui.addNew"
                :data-active="active === opts.length ? 'true' : 'false'" @click="pickAddNew">
          <ApexIcon name="add" :size="18" />
          <span>{{ addNewText }}</span>
        </button>
      </div>
    </div>
  </ApexField>
</template>
