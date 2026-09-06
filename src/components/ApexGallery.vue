<script setup lang="ts">
/**
 * ApexGallery — an image viewer with zoom, rotate, flip, download and a
 * thumbnail strip.
 *
 * The transforms are one composed CSS transform on the stage image rather than
 * separate wrappers, so zoom, rotation and both flips can hold at once and every
 * combination stays predictable. Panning is only enabled once the image is
 * zoomed past its frame, since dragging an image that already fits reads as a
 * broken control.
 *
 * Two modes over one component: inline, or a full-screen overlay opened from a
 * thumbnail grid (`v-model:open` with `overlay`).
 */
import { computed, onBeforeUnmount, ref, watch, Teleport } from 'vue';
import ApexIcon from './ApexIcon.vue';
import type { ApexMediaProps } from '../types';

export interface GalleryImage {
  src?: string;
  thumbnail?: string;
  alt?: string;
  /** Overrides the filename the download is saved under. */
  filename?: string;
  /** A CSS background, for a placeholder standing in for artwork. */
  background?: string;
  caption?: string;
}

export type GalleryAction =
  | 'rotate-left' | 'rotate-right' | 'zoom-in' | 'zoom-out' | 'zoom-reset'
  | 'flip-h' | 'flip-v' | 'download' | 'fullscreen' | 'close';

const props = withDefaults(defineProps<ApexMediaProps & {
  images?: GalleryImage[];
  /** v-model — the active index. */
  modelValue?: number;
  /** v-model:open — only meaningful with overlay. */
  open?: boolean;
  /** Render as a full-screen overlay instead of in the page. */
  overlay?: boolean;
  /** Which toolbar buttons appear, in this order. */
  actions?: GalleryAction[];
  /**
   * Per-button switches. Each overrides `actions` for that one button —
   * undefined leaves the array in charge, so the two can be mixed.
   */
  rotateLeft?: boolean;
  rotateRight?: boolean;
  zoomIn?: boolean;
  zoomOut?: boolean;
  zoomReset?: boolean;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  downloadable?: boolean;
  fullscreen?: boolean;
  closable?: boolean;
  /** Reveal the toolbar only while the stage is hovered. */
  hoverToolbar?: boolean;
  showNav?: boolean;
  /** Show the arrows only on hover. */
  hoverNav?: boolean;
  showThumbnails?: boolean;
  thumbnailsPosition?: 'bottom' | 'top';
  showCounter?: boolean;
  /** Wrap past the ends. */
  loop?: boolean;
  zoomStep?: number;
  maxZoom?: number;
  /* frame */
  width?: string;
  height?: string;
  aspectRatio?: string;
  radius?: string;
  stageBackground?: string;
  padding?: string;
  /* toolbar */
  toolbarBackground?: string;
  toolbarColor?: string;
  toolbarRadius?: string;
  toolbarPosition?: 'top' | 'bottom';
  /* nav */
  navBackground?: string;
  navColor?: string;
  navSize?: string;
  navRadius?: string;
  /* thumbnails */
  thumbSize?: string;
  thumbGap?: string;
  thumbRadius?: string;
  thumbActiveColor?: string;
  thumbInactiveOpacity?: number;
}>(), {
  modelValue: 0, open: false,
  /* Absent means "the array decides", so these have to arrive undefined:
     Vue casts an absent boolean to false, which switched every button off
     and left the toolbar v-if'd away. Same trap as AF2-167, reached here
     through props[SWITCHES[a]] rather than a named read. */
  rotateLeft: undefined, rotateRight: undefined, zoomIn: undefined, zoomOut: undefined,
  zoomReset: undefined, flipHorizontal: undefined, flipVertical: undefined,
  downloadable: undefined, fullscreen: undefined, closable: undefined,
  actions: () => ['rotate-left', 'rotate-right', 'zoom-in', 'zoom-out', 'flip-h', 'flip-v', 'download', 'fullscreen'],
  showNav: true, showThumbnails: true, thumbnailsPosition: 'bottom', showCounter: false,
  zoomStep: 0.25, maxZoom: 4, radius: 'var(--r-md)', toolbarPosition: 'top',
  thumbSize: '72px', thumbGap: '8px', thumbInactiveOpacity: 0.55,
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: number): void;
  (e: 'update:open', v: boolean): void;
  (e: 'change', v: number): void;
}>();

const root = ref<HTMLElement | null>(null);
const stage = ref<HTMLElement | null>(null);

const ACTION_ORDER: GalleryAction[] = ['rotate-left','rotate-right','zoom-in','zoom-out','zoom-reset','flip-h','flip-v','download','fullscreen','close'];
const SWITCHES: Record<GalleryAction, keyof typeof props> = {
  'rotate-left': 'rotateLeft', 'rotate-right': 'rotateRight',
  'zoom-in': 'zoomIn', 'zoom-out': 'zoomOut', 'zoom-reset': 'zoomReset',
  'flip-h': 'flipHorizontal', 'flip-v': 'flipVertical',
  download: 'downloadable', fullscreen: 'fullscreen', close: 'closable',
};
/* A per-button switch wins over the array for that button; anything it does not
   mention keeps the array's decision and the array's order. */
const shownActions = computed<GalleryAction[]>(() => {
  const listed = props.actions || [];
  const on = (a: GalleryAction) => {
    const v = props[SWITCHES[a]] as boolean | undefined;
    return v === undefined ? listed.includes(a) : v;
  };
  const kept = listed.filter(on);
  const added = ACTION_ORDER.filter((a) => !listed.includes(a) && on(a));
  return [...kept, ...added];
});
const index = computed(() => Math.min(Math.max(0, props.modelValue), Math.max(0, list.value.length - 1)));
const list = computed(() => props.images || []);
const active = computed(() => list.value[index.value] || {});

const zoom = ref(1);
const rotation = ref(0);
const flipH = ref(false);
const flipV = ref(false);
const pan = ref({ x: 0, y: 0 });

function reset() {
  zoom.value = 1; rotation.value = 0; flipH.value = false; flipV.value = false;
  pan.value = { x: 0, y: 0 };
}
function go(i: number) {
  const n = list.value.length;
  if (!n) return;
  const next = props.loop ? (i < 0 ? n - 1 : i >= n ? 0 : i) : Math.min(n - 1, Math.max(0, i));
  reset();
  emit('update:modelValue', next);
  emit('change', next);
}
const canPrev = computed(() => props.loop || index.value > 0);
const canNext = computed(() => props.loop || index.value < list.value.length - 1);

function act(a: GalleryAction) {
  if (a === 'rotate-left') rotation.value -= 90;
  else if (a === 'rotate-right') rotation.value += 90;
  else if (a === 'zoom-in') zoom.value = Math.min(props.maxZoom, zoom.value + props.zoomStep);
  else if (a === 'zoom-out') zoom.value = Math.max(0.25, zoom.value - props.zoomStep);
  else if (a === 'zoom-reset') reset();
  else if (a === 'flip-h') flipH.value = !flipH.value;
  else if (a === 'flip-v') flipV.value = !flipV.value;
  else if (a === 'download') download();
  else if (a === 'fullscreen') toggleFullscreen();
  else if (a === 'close') emit('update:open', false);
}

const ACTION_ICONS: Record<GalleryAction, string> = {
  'rotate-left': 'rotate_left', 'rotate-right': 'rotate_right',
  'zoom-in': 'zoom_in', 'zoom-out': 'zoom_out', 'zoom-reset': 'restart_alt',
  'flip-h': 'swap_horiz', 'flip-v': 'swap_vert',
  download: 'download', fullscreen: 'fullscreen', close: 'close',
};
const ACTION_LABELS: Record<GalleryAction, string> = {
  'rotate-left': 'Rotate left', 'rotate-right': 'Rotate right',
  'zoom-in': 'Zoom in', 'zoom-out': 'Zoom out', 'zoom-reset': 'Reset view',
  'flip-h': 'Flip horizontally', 'flip-v': 'Flip vertically',
  download: 'Download', fullscreen: 'Full screen', close: 'Close',
};

/* Exiting is a different action from entering, so the button has to say which
   one it now offers. */
function iconFor(a: GalleryAction) {
  return a === 'fullscreen' && faux.value ? 'fullscreen_exit' : ACTION_ICONS[a];
}
function labelFor(a: GalleryAction) {
  return a === 'fullscreen' && faux.value ? 'Exit full screen' : ACTION_LABELS[a];
}

function saveAs(href: string, name: string, newTab = false) {
  const a = document.createElement('a');
  a.href = href;
  if (!newTab) a.download = name;
  else { a.target = '_blank'; a.rel = 'noopener'; }
  document.body.appendChild(a);
  a.click();
  a.remove();
}
/* A cross-origin URL ignores the download attribute and navigates instead, so
   fetch the bytes and save the blob when the server allows it; only fall back to
   opening the image when it does not. */
async function download() {
  const src = active.value.src;
  if (!src || typeof document === 'undefined') return;
  const name = active.value.filename || src.split('/').pop()?.split('?')[0] || 'image';
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (!res.ok) throw new Error(String(res.status));
    const url = URL.createObjectURL(await res.blob());
    saveAs(url, name);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch {
    saveAs(src, name, true);
  }
}
/* The Fullscreen API is refused in a sandboxed or permission-less frame, and a
   rejected promise left the button doing nothing at all. So: try the real thing,
   and fall back to filling the viewport ourselves — the user asked for the image
   to take the page, not specifically for browser chrome to disappear. */
const faux = ref(false);
function toggleFullscreen() {
  const el = root.value;
  if (!el || typeof document === 'undefined') return;
  if (document.fullscreenElement) { document.exitFullscreen?.(); faux.value = false; return; }
  if (faux.value) { faux.value = false; return; }
  const req = el.requestFullscreen?.();
  if (req && typeof req.catch === 'function') req.catch(() => { faux.value = true; });
  else faux.value = true;
}

/* Panning only once the image outgrows its frame. */
const pannable = computed(() => zoom.value > 1);
const dragging = ref(false);
let from = { x: 0, y: 0, px: 0, py: 0 };
function onPointerDown(e: PointerEvent) {
  if (!pannable.value) return;
  dragging.value = true;
  from = { x: e.clientX, y: e.clientY, px: pan.value.x, py: pan.value.y };
  try { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); } catch { /* optional */ }
}
function onPointerMove(e: PointerEvent) {
  if (!dragging.value) return;
  pan.value = { x: from.px + (e.clientX - from.x), y: from.py + (e.clientY - from.y) };
}
function onPointerUp() { dragging.value = false; }

function onWheel(e: WheelEvent) {
  if (!e.ctrlKey && !e.metaKey) return;
  e.preventDefault();
  act(e.deltaY < 0 ? 'zoom-in' : 'zoom-out');
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(index.value - 1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); go(index.value + 1); }
  else if (e.key === 'Escape' && faux.value) { e.preventDefault(); faux.value = false; }
  else if (e.key === 'Escape' && props.overlay && props.open) emit('update:open', false);
  else if (e.key === '+' || e.key === '=') act('zoom-in');
  else if (e.key === '-') act('zoom-out');
  else if (e.key === '0') reset();
}

watch(faux, (v) => {
  if (typeof document === 'undefined') return;
  if (v) document.addEventListener('keydown', onKey, true);
  else if (!(props.overlay && props.open)) document.removeEventListener('keydown', onKey, true);
});

watch(() => props.open, (v) => {
  if (!props.overlay || typeof document === 'undefined') return;
  if (v) {
    reset();
    document.addEventListener('keydown', onKey, true);
    document.documentElement.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', onKey, true);
    document.documentElement.style.overflow = '';
  }
});
onBeforeUnmount(() => {
  if (typeof document === 'undefined') return;
  document.removeEventListener('keydown', onKey, true);
  if (props.overlay && props.open) document.documentElement.style.overflow = '';
});

const imageStyle = computed(() => ({
  transform: `translate(${pan.value.x}px, ${pan.value.y}px) rotate(${rotation.value}deg) `
    + `scale(${zoom.value * (flipH.value ? -1 : 1)}, ${zoom.value * (flipV.value ? -1 : 1)})`,
}));

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.width) s.inlineSize = props.width;
  if (props.height) s['--apex-gal-height'] = props.height;
  if (props.aspectRatio) s['--apex-gal-ratio'] = props.aspectRatio;
  if (props.radius) s['--apex-gal-radius'] = props.radius;
  if (props.stageBackground) s['--apex-gal-stage-bg'] = props.stageBackground;
  if (props.padding) s['--apex-gal-pad'] = props.padding;
  if (props.toolbarBackground) s['--apex-gal-bar-bg'] = props.toolbarBackground;
  if (props.toolbarColor) s['--apex-gal-bar-fg'] = props.toolbarColor;
  if (props.toolbarRadius) s['--apex-gal-bar-radius'] = props.toolbarRadius;
  if (props.navBackground) s['--apex-gal-nav-bg'] = props.navBackground;
  if (props.navColor) s['--apex-gal-nav-fg'] = props.navColor;
  if (props.navSize) s['--apex-gal-nav-size'] = props.navSize;
  if (props.navRadius) s['--apex-gal-nav-radius'] = props.navRadius;
  if (props.thumbSize) s['--apex-gal-thumb-size'] = props.thumbSize;
  if (props.thumbGap) s['--apex-gal-thumb-gap'] = props.thumbGap;
  if (props.thumbRadius) s['--apex-gal-thumb-radius'] = props.thumbRadius;
  if (props.thumbActiveColor) s['--apex-gal-thumb-active'] = props.thumbActiveColor;
  s['--apex-gal-thumb-dim'] = String(props.thumbInactiveOpacity);
  return s;
});

defineExpose({ act, go, reset, zoom, rotation, fullscreen: faux });
</script>

<template>
  <component :is="overlay ? Teleport : 'div'" :to="overlay ? 'body' : undefined">
    <Transition :name="overlay ? 'apex-gal-fade' : 'apex-none'">
      <div v-if="!overlay || open" ref="root" class="apex-gal" :style="rootStyle" :class="ui?.root"
           :data-overlay="overlay ? 'true' : 'false'" :data-fullscreen="faux ? 'true' : 'false'"
           :data-hover-bar="hoverToolbar ? 'true' : 'false'"
           :data-hover-nav="hoverNav ? 'true' : 'false'"
           :data-thumbs="thumbnailsPosition" :data-bar="toolbarPosition"
           role="group" aria-label="Image gallery" tabindex="-1" @keydown="onKey">
        <div ref="stage" class="apex-gal__stage" :class="ui?.stage" :data-pannable="pannable ? 'true' : 'false'"
             :data-dragging="dragging ? 'true' : 'false'"
             @pointerdown="onPointerDown" @pointermove="onPointerMove"
             @pointerup="onPointerUp" @pointercancel="onPointerUp" @wheel="onWheel">
          <div v-if="shownActions.length" class="apex-gal__bar" :class="ui?.bar">
            <slot name="toolbar" :act="act">
              <button v-for="a in shownActions" :key="a" type="button" class="apex-gal__act" :class="ui?.act"
                      :disabled="a === 'download' && !active.src"
                      :aria-label="labelFor(a)" :title="labelFor(a)" :aria-pressed="a === 'fullscreen' ? faux : undefined"
                      @click.stop="act(a)">
                <ApexIcon :name="iconFor(a)" :size="19" />
              </button>
            </slot>
          </div>
          <slot name="image" :image="active" :index="index" :style="imageStyle">
            <img v-if="active.src" class="apex-gal__img" :class="ui?.img" :src="active.src" :alt="active.alt || ''"
                 :style="imageStyle" draggable="false" />
            <div v-else class="apex-gal__img apex-gal__ph" :class="ui?.img" :style="[imageStyle, { background: active.background }]">
              {{ active.caption || active.alt || '' }}
            </div>
          </slot>
          <template v-if="showNav && list.length > 1">
            <button type="button" class="apex-gal__nav" :class="ui?.nav" data-dir="prev" aria-label="Previous image"
                    :disabled="!canPrev" @click.stop="go(index - 1)">
              <ApexIcon name="chevron_left" :size="22" />
            </button>
            <button type="button" class="apex-gal__nav" :class="ui?.nav" data-dir="next" aria-label="Next image"
                    :disabled="!canNext" @click.stop="go(index + 1)">
              <ApexIcon name="chevron_right" :size="22" />
            </button>
          </template>
          <span v-if="showCounter" class="apex-gal__count" :class="ui?.count">{{ index + 1 }} / {{ list.length }}</span>
        </div>
        <div v-if="showThumbnails && list.length > 1" class="apex-gal__thumbs" :class="ui?.thumbs">
          <button v-for="(im, i) in list" :key="i" type="button" class="apex-gal__thumb" :class="ui?.thumb"
                  :data-active="i === index ? 'true' : 'false'" :aria-label="`Image ${i + 1}`"
                  @click="go(i)">
            <img v-if="im.thumbnail || im.src" :src="im.thumbnail || im.src" :alt="im.alt || ''" />
            <span v-else class="apex-gal__thumbph" :style="{ background: im.background }"></span>
          </button>
        </div>
      </div>
    </Transition>
  </component>
</template>
