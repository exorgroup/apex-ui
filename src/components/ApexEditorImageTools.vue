<script setup lang="ts">
/**
 * The floating bar for a selected image — AF2-286, rebuilt at N/034.
 *
 * The image half of what ApexEditorTableTools does for a cell: same
 * contract, where a null subject is what hides the bar rather than a
 * `visible` prop. ApexEditorObjectBar places whichever one the selection
 * is in.
 *
 * Five of its controls were dead the first time it was mounted against
 * `ApexEditor`, and all five for the same reason: the bar called
 * commands no registry had, or emitted events no host answered.
 *
 *   the description   a BUTTON emitting `edit` — nothing to type into
 *   "In line"         `image_align_none`, registered nowhere
 *   the width select  `run('image_width', v)`, a factory that did not exist
 *   edit              emitted `edit`, which this host does not answer
 *   delete            `image_delete`, registered nowhere
 *
 * So: a real description field, three alignment buttons, width and
 * height in pixels, a wrapping menu, and a delete that deletes. The
 * commands behind them live in `media.ts`, which is what makes them
 * work for every editor rather than for one screen.
 */
import { computed, ref, watch } from 'vue';
import ApexIcon from './ApexIcon.vue';
import ApexMenu from './ApexMenu.vue';
import { describe, type SurfaceItem } from '../core/editor/catalogue';
import type { ApexEditorClasses } from '../types';

/** The selected image's attributes, or null — which is what hides the bar. */
export interface ImageState {
  /** `image` (a figure) or `image_inline`. Only a figure can be captioned. */
  type?: string;
  src?: string;
  alt?: string | null;
  caption?: string | null;
  style?: string;
  width?: string | null;
  height?: string | null;
  align?: string | null;
  wrap?: string | null;
  /** What the picture actually measures, for boxes that must show a number. */
  renderedWidth?: number | null;
  renderedHeight?: number | null;
  [key: string]: unknown;
}

const props = withDefaults(defineProps<{
  image?: ImageState | null;
  run?: (name: string, value?: string | null) => boolean;
  can?: Record<string, boolean> | null;
  /**
   * The whole bar, off. Separate from `can`, which is per command — the
   * size boxes write a value rather than running a named command, so
   * `can` never reaches them. AF2-281 found the same hole in the table bar.
   */
  disabled?: boolean;
  ui?: ApexEditorClasses;
}>(), { image: null, run: undefined, can: null, disabled: false });

defineEmits<{ (e: 'edit'): void }>();

const ALIGNMENT: SurfaceItem[] = ['image_align_left', 'image_align_center', 'image_align_right'];

const alignItems = computed(() => ALIGNMENT.map(describe));

/**
 * The four wrapping modes, in Word's words.
 *
 * Tight is Square here: the two differ only for an image with
 * transparency, and `shape-outside` on a photograph gives back the
 * rectangle it already had. Behind Text and In Front of Text are absent
 * rather than faked — both need absolute positioning, which in a column
 * that reflows on a phone puts text on top of the picture.
 */
const WRAPS = [
  { value: 'inline', label: 'In line with text', icon: 'format_align_justify' },
  { value: 'left', label: 'Square — text on the right', icon: 'format_image_left' },
  { value: 'right', label: 'Square — text on the left', icon: 'format_image_right' },
  { value: 'block', label: 'Top and bottom', icon: 'horizontal_split' },
];

/* "In line with text" came back at N/039, when there was finally
   something for it to do: a second, INLINE image node that lives in a
   paragraph's content. Until then a picture was a block whatever this
   menu said, and the row was removed rather than left as theatre. */

const wrapMenu = ref<InstanceType<typeof ApexMenu> | null>(null);

/* A picture with no wrap of its own is a block one: the attribute is
   null on a figure and 'inline' on an inline picture, so the absence
   is the answer rather than a missing value. */
const wrapValue = computed(() => String(props.image?.wrap || 'block'));
const wrapIcon = computed(() => WRAPS.find((w) => w.value === wrapValue.value)?.icon || 'horizontal_split');

const wrapItems = computed(() => WRAPS.map((w) => ({
  label: w.label,
  icon: w.icon,
  /* The current mode is MARKED rather than omitted: a menu that leaves
     out the one you are in cannot tell you which one that is. */
  hint: w.value === wrapValue.value ? 'Current' : undefined,
  command: () => props.run?.('image_wrap', w.value),
})));

/** A stored length as a plain number, for a box that takes numbers. */
const asNumber = (value: unknown) => {
  const text = String(value ?? '').trim();
  const n = parseFloat(text);

  return Number.isFinite(n) && /^[0-9.]+(px)?$/.test(text) ? String(Math.round(n)) : '';
};

/* Local, so typing does not fight the document on every keystroke: the
   value is written on change or on Enter, and re-read whenever the
   selection reports a different picture. */
const width = ref('');
const height = ref('');
const alt = ref('');
const caption = ref('');

watch(() => props.image, (image) => {
  width.value = asNumber(image?.width) || String(image?.renderedWidth ?? '');
  height.value = asNumber(image?.height) || String(image?.renderedHeight ?? '');
  /* '' is a real value — a decorative image — so null is the empty one. */
  alt.value = image?.alt == null ? '' : String(image.alt);
  caption.value = image?.caption == null ? '' : String(image.caption);
}, { immediate: true, deep: true });

/**
 * A caption is for a FIGURE — N/037.
 *
 * `<figcaption>` is a block and cannot live inside a paragraph, so an inline
 * picture has no caption to write; offering the field there would be offering
 * to store something nothing can render.
 *
 * The field exists at all because N/033 made the caption an attribute rather
 * than editable content — which stopped a click on a picture dropping the
 * caret into a caption nobody meant to edit, and, until this, left no way to
 * write one at all.
 */
const captionable = computed(() => (props.image?.type ?? 'image') === 'image');

const alignment = computed(() => {
  const align = String(props.image?.align || '');

  return align ? `image_align_${align}` : '';
});

const altMissing = computed(() => !!props.image && props.image.alt == null);

function allowed(name?: string) {
  if (props.disabled || !name) return false;

  return !props.can || props.can[name] !== false;
}

function commit(what: 'image_width' | 'image_height', value: string | number) {
  /* `String(...)`: Vue casts an `<input type="number">` to a NUMBER
     through v-model, and a number has no `.trim`. The box is a number
     box because it takes numbers; what leaves here is text. */
  props.run?.(what, String(value ?? '').trim() || null);
}
</script>

<template>
  <div v-if="image" class="apex-objtools" :class="ui?.imageTools" role="toolbar" aria-label="Image">
    <!-- A FIELD, not a button. It was a button that emitted `edit`, so an
         author could read the description and never change it. -->
    <label class="apex-objtools__alt" :class="ui?.imageToolsAlt"
           :data-warn="altMissing ? 'true' : 'false'">
      <ApexIcon :name="altMissing ? 'warning' : 'image'" :size="15" />
      <input v-model="alt" type="text" class="apex-objtools__altinput"
             :disabled="disabled"
             placeholder="Describe this image" aria-label="Alternative description"
             :title="altMissing ? 'This image has no description' : 'Alternative description'"
             @change="run?.('image_alt', alt)" @keydown.enter.prevent="run?.('image_alt', alt)">
    </label>

    <!-- The caption, for a figure. Same shape as the description beside
         it, and deliberately not the same thing: alt is read INSTEAD of
         the picture, a caption is read WITH it. -->
    <label v-if="captionable" class="apex-objtools__alt" :class="ui?.imageToolsCaption">
      <ApexIcon name="closed_caption" :size="15" />
      <input v-model="caption" type="text" class="apex-objtools__altinput"
             :disabled="disabled"
             placeholder="Caption" aria-label="Caption"
             title="Caption shown under the picture"
             @change="run?.('image_caption', caption)"
             @keydown.enter.prevent="run?.('image_caption', caption)">
    </label>

    <span class="apex-objtools__sep" :class="ui?.imageToolsSep"></span>
    <span class="apex-objtools__group" :class="ui?.imageToolsGroup" aria-label="Alignment">
      <button v-for="it in alignItems" :key="it.command" type="button"
              class="apex-objtools__btn" :class="ui?.imageToolsButton"
              :data-cmd="it.command" :data-on="alignment === it.command ? 'true' : 'false'"
              :disabled="!allowed(it.command)" :aria-label="it.label" :title="it.label"
              @click="run?.(it.command!)">
        <ApexIcon v-if="it.icon" :name="it.icon" :size="17" />
      </button>
    </span>

    <!-- Width and height in pixels, in place of a preset list that wrote
         nothing. Both show what the picture MEASURES when it has been
         given no size, because "Original" is not something an author can
         type over. -->
    <span class="apex-objtools__sep" :class="ui?.imageToolsSep"></span>
    <span class="apex-objtools__size" :class="ui?.imageToolsSize">
      <label class="apex-objtools__field">
        <span aria-hidden="true">W</span>
        <input v-model="width" type="number" min="24" inputmode="numeric"
               :disabled="disabled" aria-label="Width in pixels"
               @change="commit('image_width', width)"
               @keydown.enter.prevent="commit('image_width', width)">
      </label>
      <label class="apex-objtools__field">
        <span aria-hidden="true">H</span>
        <input v-model="height" type="number" min="24" inputmode="numeric"
               :disabled="disabled" aria-label="Height in pixels"
               @change="commit('image_height', height)"
               @keydown.enter.prevent="commit('image_height', height)">
      </label>
    </span>

    <span class="apex-objtools__sep" :class="ui?.imageToolsSep"></span>
    <button type="button" class="apex-objtools__btn" :class="ui?.imageToolsButton"
            :disabled="disabled" aria-label="Text wrapping" title="Text wrapping"
            aria-haspopup="menu"
            @click="wrapMenu?.toggle($event, $event.currentTarget as HTMLElement)">
      <ApexIcon :name="wrapIcon" :size="17" />
      <ApexIcon name="arrow_drop_down" :size="14" />
    </button>
    <ApexMenu ref="wrapMenu" :items="wrapItems" popup side="bottom" align="start" />

    <span class="apex-objtools__sep" :class="ui?.imageToolsSep"></span>
    <button type="button" class="apex-objtools__btn" :class="ui?.imageToolsButton" data-danger="true"
            :disabled="!allowed('image_delete')" aria-label="Delete image"
            title="Delete image" @click="run?.('image_delete')">
      <ApexIcon name="delete" :size="17" />
    </button>
  </div>
</template>
