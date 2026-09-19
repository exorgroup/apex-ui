<script setup lang="ts">
/**
 * ApexImageCrop — choose the part of an image that is kept, and produce it at a
 * given size.
 *
 * The problem it exists for: a field wants 480 × 300 and the operator uploads a
 * 2340 × 6500 photograph from their phone. Resizing alone would squash it;
 * cropping alone would leave it enormous. This does both, in the BROWSER, so
 * what travels to a server is the ~150 KB result rather than the 20 MB source.
 *
 * ## Why the browser
 *
 * A 2340 × 6500 image is 58 MB as a raw bitmap, and any server-side library
 * holds the source and the destination at once. That is a ~120 MB spike per
 * upload — comfortable on a developer's machine and fatal on shared hosting,
 * where it fails only for the customer with the good camera. Cropping here
 * removes the spike and the upload together.
 *
 * It does NOT remove the server's job. A browser can send anything, so whatever
 * receives this must still validate and re-encode. This makes that cheap, not
 * unnecessary.
 *
 * ## The four ways to choose a box
 *
 *   auto      centre the box on the image and trim what will not fit —
 *             top and bottom, or left and right. Needs a `target` to have a
 *             ratio to trim TO; without one there is nothing to crop to and
 *             the whole image is kept.
 *   move      drag inside the box.
 *   resize    drag a handle. Only when the ratio is unlocked — a locked box
 *             has one degree of freedom and dragging its corner would lie.
 *   draw      drag on the image OUTSIDE the box to define a new one. While the
 *             ratio is locked the drawn box SNAPS to it, so drawing and
 *             locking do not contradict each other.
 *
 * ## Two things it warns about and does not refuse
 *
 *   `below-target`    the box is smaller than the output, so the result is
 *                     upscaled and softer. The operator may be preparing
 *                     something for a smaller use elsewhere; that is their call.
 *   `source-below-target`  the image itself is smaller than the output in at
 *                     least one dimension. Same answer, noticed earlier.
 *
 * Both are emitted, never enforced. The host decides what to say and whether to
 * let the save through.
 *
 * ## EXIF orientation
 *
 * Handled by the platform rather than by a parser here. `createImageBitmap` is
 * asked for `imageOrientation: 'from-image'`, and the `<img>` fallback inherits
 * the CSS default `image-orientation: from-image`. A phone photograph therefore
 * arrives upright in both paths, and the crop box is chosen against what the
 * operator can see.
 *
 * ## What it does not do
 *
 * Upload. It has no idea where the result goes — no `route()`, no fetch, no
 * transport of any kind. That is what lets it live in the kit rather than beside
 * one screen, and it is the difference between this and a media picker.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import ApexButton from './ApexButton.vue';
import ApexIcon from './ApexIcon.vue';

type Rect = { x: number; y: number; w: number; h: number };
type WarningCode = 'below-target' | 'source-below-target';

const props = withDefaults(defineProps<{
  /** The image to crop: a File from an input, a Blob, or a URL. */
  src?: File | Blob | string | null;
  /** Output size in pixels. Omit for "resize only, keep the whole image". */
  target?: { width: number; height: number } | null;
  /** `auto` centres the box; `manual` leaves the operator to place it. */
  mode?: 'auto' | 'manual';
  /** Fix the box to the target's ratio. Meaningless without a target. */
  lockRatio?: boolean;
  /** Encoder. WebP unless a caller has a reason. */
  type?: string;
  quality?: number;
  /** Longest edge when there is no target, so "no crop" still means "not 6500px". */
  maxDim?: number | null;
  /** Hide the built-in bar when a host draws its own controls. */
  showControls?: boolean;
  /** How tall the working area may grow. */
  maxHeight?: number;
  background?: string;
  /** The dimmed area outside the box. */
  scrimColor?: string;
  handleColor?: string;
}>(), {
  src: null,
  target: null,
  mode: 'auto',
  lockRatio: true,
  type: 'image/webp',
  quality: 0.9,
  maxDim: 2000,
  showControls: true,
  maxHeight: 420,
});

const emit = defineEmits<{
  /** The image finished loading; carries its natural size. */
  (e: 'ready', v: { width: number; height: number }): void;
  /** The box moved, was resized or was redrawn. In IMAGE pixels. */
  (e: 'update:rect', v: Rect): void;
  (e: 'warning', v: { code: WarningCode; message: string }): void;
  (e: 'error', v: { message: string }): void;
}>();

/* ── the image ──────────────────────────────────────────────────────────
   Held as a bitmap when the browser will give us one, because
   `createImageBitmap` decodes off the main thread AND applies EXIF
   orientation. The `<img>` fallback gets orientation from CSS, which has
   defaulted to `from-image` for years — so neither path needs an EXIF parser,
   and writing one would be work that the platform has already done. */
const bitmap = ref<ImageBitmap | HTMLImageElement | null>(null);
const natural = ref({ width: 0, height: 0 });
const loading = ref(false);
const objectUrl = ref<string | null>(null);

/** The box, in IMAGE pixels — never in screen pixels. See `toImage()`. */
const rect = ref<Rect>({ x: 0, y: 0, w: 0, h: 0 });

const frame = ref<HTMLElement | null>(null);

/* `lockRatio` cannot mean anything without a ratio to lock to. */
const locked = computed(() => props.lockRatio && !!props.target);
const ratio = computed(() => (props.target ? props.target.width / props.target.height : 0));

function release() {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value);
    objectUrl.value = null;
  }
  if (bitmap.value && 'close' in bitmap.value) (bitmap.value as ImageBitmap).close();
  bitmap.value = null;
}

async function load(src: File | Blob | string) {
  loading.value = true;
  release();

  /* The object URL is for the PREVIEW and is made whatever happens.
   *
   * It used to be created only inside the `<img>` fallback below — so on every
   * browser that HAS `createImageBitmap`, which is all of them, `previewSrc`
   * stayed null, the `<img>` never rendered, the frame collapsed to zero height
   * and the crop dialog opened empty. The bitmap is what `render()` draws FROM;
   * this is what the operator looks at. Two jobs, and conflating them cost a
   * screen. */
  if (typeof src !== 'string') objectUrl.value = URL.createObjectURL(src);

  try {
    if (typeof src !== 'string' && 'createImageBitmap' in window) {
      /* `from-image` is the whole reason for the option: without it a phone
         photograph decodes sideways and the operator crops the wrong part. */
      bitmap.value = await createImageBitmap(src, { imageOrientation: 'from-image' });
      natural.value = { width: bitmap.value.width, height: bitmap.value.height };
    } else {
      const url = typeof src === 'string' ? src : objectUrl.value!;

      const img = new Image();
      img.decoding = 'async';
      if (typeof src === 'string') img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('The image could not be read.'));
        img.src = url;
      });
      bitmap.value = img;
      natural.value = { width: img.naturalWidth, height: img.naturalHeight };
    }

    emit('ready', { ...natural.value });
    checkSource();
    reset();
    /* A new image starts whole and centred, whatever the last one was left at.
       `measure()` first because the frame's aspect ratio only becomes known
       with `natural`, so its height a moment ago was the OLD image's. */
    await nextTick();
    measure();
    fitView();
  } catch (e) {
    emit('error', { message: e instanceof Error ? e.message : 'The image could not be read.' });
  } finally {
    loading.value = false;
  }
}

watch(() => props.src, (src) => { if (src) load(src); else release(); }, { immediate: true });
onBeforeUnmount(release);

/* ── choosing the box ───────────────────────────────────────────────────
   `auto` is the default because it is right far more often than not: the
   subject of a photograph is usually near the middle, and an operator who
   disagrees can drag. */
function reset() {
  if (!natural.value.width) return;

  rect.value = props.mode === 'auto' && props.target
    ? centred()
    : { x: 0, y: 0, w: natural.value.width, h: natural.value.height };

  announce();
}

/** The largest box of the target's ratio that fits, centred. */
function centred(): Rect {
  const { width: nw, height: nh } = natural.value;
  const r = ratio.value;

  let w = nw;
  let h = Math.round(w / r);

  if (h > nh) {
    h = nh;
    w = Math.round(h * r);
  }

  return { x: Math.round((nw - w) / 2), y: Math.round((nh - h) / 2), w, h };
}

function auto() {
  if (!props.target) return;
  rect.value = centred();
  announce();
}

/* ── screen ↔ image ─────────────────────────────────────────────────────
   Everything the operator does happens in screen pixels and everything stored
   is in image pixels. Keeping the conversion in one pair of functions is what
   stops a 6500px image and a 400px preview disagreeing.

   There are now THREE numbers between the two: the fit, the zoom and the pan.

     fit    how many screen pixels an image pixel gets when the whole image is
            shown. A contain-fit, so a tall photograph is no longer clipped by
            `max-block-size` with its bottom half unreachable.
     zoom   the operator's multiplier on top. 100% is FIT, not 1:1 — there is no
            useful 1:1 between a 6500px photograph and a 900px dialog.
     pan    where the image's top-left corner sits inside the frame, in screen
            pixels. Centred while the image fits; clamped to the edges once it
            does not, so the image can never be dragged out of its own window.

   `scale` stays the single conversion everything else uses, so the box, the
   handles, the four gestures and `render()` needed no change at all. */
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 8;
const ZOOM_STEP = 1.25;    // per button press
const ZOOM_WHEEL = 1.1;    // per wheel notch — gentler, it fires often
const PAN_KEY_STEP = 40;   // px per arrow press

const zoom = ref(1);
const pan = ref({ x: 0, y: 0 });

/* The frame's size, held reactively. `clientWidth` read inside a computed is
   NOT reactive — it happened to be right because the first render followed
   mount, and it silently stopped being right whenever the dialog resized. */
const frameSize = ref({ width: 0, height: 0 });
let frameObserver: ResizeObserver | null = null;

const measure = () => {
  const el = frame.value;
  if (!el) return;
  frameSize.value = { width: el.clientWidth, height: el.clientHeight };
  clampPan();
};

onMounted(() => {
  measure();
  if (frame.value && typeof ResizeObserver !== 'undefined') {
    frameObserver = new ResizeObserver(measure);
    frameObserver.observe(frame.value);
  }
});

onBeforeUnmount(() => {
  frameObserver?.disconnect();
  endPan();
});

const fit = computed(() => {
  const { width: fw, height: fh } = frameSize.value;
  const { width: nw, height: nh } = natural.value;
  if (!fw || !nw) return 1;

  /* Before layout the frame has no height. Width-fit is the sane answer then,
     and it is what the component did for its whole life before this. */
  return fh ? Math.min(fw / nw, fh / nh) : fw / nw;
});

const scale = computed(() => fit.value * zoom.value);

/** The image's size on screen, which is what `pan` is clamped against. */
const shown = computed(() => ({
  width: natural.value.width * scale.value,
  height: natural.value.height * scale.value,
}));

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/* Centred while it fits, pinned to the edges once it does not. The two cases
   are different on purpose: `clamp(x, fw - sw, 0)` with a POSITIVE free space
   has its bounds the wrong way round, which is how a centred image ends up
   jammed into a corner. */
const clampAxis = (v: number, frameLen: number, shownLen: number) =>
  (shownLen <= frameLen ? (frameLen - shownLen) / 2 : clamp(v, frameLen - shownLen, 0));

function clampPan() {
  pan.value = {
    x: clampAxis(pan.value.x, frameSize.value.width, shown.value.width),
    y: clampAxis(pan.value.y, frameSize.value.height, shown.value.height),
  };
}

/** Back to the whole image, centred. What the percentage button does. */
function fitView() {
  zoom.value = 1;
  pan.value = { x: 0, y: 0 };
  clampPan();
}

const zoomPercent = computed(() => Math.round(zoom.value * 100));

/**
 * Zoom about a point, so what is under the cursor stays under the cursor.
 *
 * Without the anchor the image lurches away from whatever the operator was
 * looking at on every notch, which on a crop tool is the one thing they were
 * doing. `at` is in FRAME pixels; the buttons pass the middle.
 */
function zoomTo(next: number, at?: { x: number; y: number }) {
  const before = scale.value;
  zoom.value = clamp(next, ZOOM_MIN, ZOOM_MAX);
  const after = scale.value;
  if (!before || before === after) return clampPan();

  const a = at ?? { x: frameSize.value.width / 2, y: frameSize.value.height / 2 };
  const k = after / before;
  pan.value = { x: a.x - (a.x - pan.value.x) * k, y: a.y - (a.y - pan.value.y) * k };
  clampPan();
}

const zoomIn = () => zoomTo(zoom.value * ZOOM_STEP);
const zoomOut = () => zoomTo(zoom.value / ZOOM_STEP);

function onWheel(e: WheelEvent) {
  if (!natural.value.width) return;
  const r = frame.value!.getBoundingClientRect();
  zoomTo(
    e.deltaY < 0 ? zoom.value * ZOOM_WHEEL : zoom.value / ZOOM_WHEEL,
    { x: e.clientX - r.left, y: e.clientY - r.top },
  );
}

/* ── panning ────────────────────────────────────────────────────────────
   The RIGHT button, matching the ticket designer. The left one is taken three
   times over here too — move the box, resize it, draw a new one — and a
   modifier would collide with the Shift that makes a nudge fine. */
const isPanning = ref(false);
let panFrom: { x: number; y: number; px: number; py: number } | null = null;

function panBy(dx: number, dy: number) {
  pan.value = { x: pan.value.x + dx, y: pan.value.y + dy };
  clampPan();
}

function onPanMove(e: MouseEvent) {
  if (!panFrom) return;
  pan.value = { x: panFrom.px + (e.clientX - panFrom.x), y: panFrom.py + (e.clientY - panFrom.y) };
  clampPan();
}

function endPan() {
  isPanning.value = false;
  panFrom = null;
  window.removeEventListener('mousemove', onPanMove);
  window.removeEventListener('mouseup', endPan);
}

function onMouseDown(e: MouseEvent) {
  if (e.button !== 2 || !natural.value.width) return;
  e.preventDefault();
  isPanning.value = true;
  panFrom = { x: e.clientX, y: e.clientY, px: pan.value.x, py: pan.value.y };
  /* On the WINDOW: a pan that leaves the frame has to keep working, and has to
     end wherever the button is actually released. */
  window.addEventListener('mousemove', onPanMove);
  window.addEventListener('mouseup', endPan);
}

/** Where the image is drawn, in frame pixels. */
const imgStyle = computed(() => ({
  left: `${pan.value.x}px`,
  top: `${pan.value.y}px`,
  width: `${shown.value.width}px`,
  height: `${shown.value.height}px`,
}));

const box = computed(() => ({
  left: pan.value.x + rect.value.x * scale.value,
  top: pan.value.y + rect.value.y * scale.value,
  width: rect.value.w * scale.value,
  height: rect.value.h * scale.value,
}));

function toImage(e: PointerEvent) {
  const r = frame.value!.getBoundingClientRect();

  return {
    x: (e.clientX - r.left - pan.value.x) / scale.value,
    y: (e.clientY - r.top - pan.value.y) / scale.value,
  };
}

/* ── dragging ───────────────────────────────────────────────────────────
   One pointer handler for three gestures, because they are the same gesture
   with a different anchor: where the pointer went DOWN decides which. */
type Drag =
  | { kind: 'move'; ox: number; oy: number }
  | { kind: 'resize'; handle: string }
  | { kind: 'draw'; ax: number; ay: number };

const drag = ref<Drag | null>(null);

function onDown(e: PointerEvent, handle?: string) {
  /* The right button pans the view, exactly as it does on the ticket canvas.
     Without this it would draw a box at the same time. */
  if (!natural.value.width || (e.button ?? 0) !== 0) return;
  e.preventDefault();
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

  const p = toImage(e);

  if (handle) {
    drag.value = { kind: 'resize', handle };
  } else if (inside(p) && !coversAll.value) {
    drag.value = { kind: 'move', ox: p.x - rect.value.x, oy: p.y - rect.value.y };
  } else {
    /* Drawing starts as a zero-size box anchored where the pointer went down;
       the first move gives it size. */
    drag.value = { kind: 'draw', ax: p.x, ay: p.y };
    rect.value = { x: p.x, y: p.y, w: 0, h: 0 };
  }
}

/**
 * Ctrl + arrows pan the view; bare arrows nudge the BOX.
 *
 * The same division as the ticket designer, and for the same reason: two things
 * can move here, and the modifier is what says which. Panning is in screen
 * pixels because that is what the operator is looking at; nudging is converted
 * through `scale`, so the box moves the same visible distance whether the image
 * is 400px wide or 6500. Shift makes the nudge as fine as the image allows.
 */
function onKeydown(e: KeyboardEvent) {
  const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (!keys.includes(e.key) || !natural.value.width) return;

  e.preventDefault();

  if (e.ctrlKey) {
    const d = PAN_KEY_STEP;
    panBy(
      e.key === 'ArrowLeft' ? d : e.key === 'ArrowRight' ? -d : 0,
      e.key === 'ArrowUp' ? d : e.key === 'ArrowDown' ? -d : 0,
    );
    return;
  }

  const step = e.shiftKey ? 1 : Math.max(1, Math.round(10 / scale.value));
  const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
  const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;

  rect.value = {
    ...rect.value,
    x: clamp(rect.value.x + dx, 0, natural.value.width - rect.value.w),
    y: clamp(rect.value.y + dy, 0, natural.value.height - rect.value.h),
  };
  announce();
}

const inside = (p: { x: number; y: number }) =>
  p.x >= rect.value.x && p.x <= rect.value.x + rect.value.w
  && p.y >= rect.value.y && p.y <= rect.value.y + rect.value.h;

/**
 * Is the box the whole image?
 *
 * Which is to say: has anything been chosen yet. It matters because "drag
 * inside to move, drag outside to draw" has a hole in it — when the box covers
 * everything there IS no outside, so the first thing an operator wants to do
 * (upload, then drag out the part they want) would be impossible.
 *
 * Nothing is lost by treating it as a draw: a box the size of the image cannot
 * be moved anywhere, because every move is clamped straight back. So the
 * gesture had no other meaning to take.
 *
 * The case this does not cover is redrawing INSIDE an existing smaller box.
 * That needs Reset first, or a drag starting outside it — deliberate, because
 * the alternative is a modifier key nobody would find.
 */
const coversAll = computed(() =>
  rect.value.w >= natural.value.width - 1 && rect.value.h >= natural.value.height - 1);

function onMove(e: PointerEvent) {
  const d = drag.value;
  if (!d) return;

  const p = toImage(e);
  const { width: nw, height: nh } = natural.value;

  if (d.kind === 'move') {
    rect.value = {
      ...rect.value,
      x: clamp(p.x - d.ox, 0, nw - rect.value.w),
      y: clamp(p.y - d.oy, 0, nh - rect.value.h),
    };
  } else if (d.kind === 'draw') {
    let w = Math.abs(p.x - d.ax);
    let h = Math.abs(p.y - d.ay);

    /* The snap. Drawing while locked would otherwise produce a box the lock
       then has to fight, so the drawn box takes the ratio as it is drawn —
       whichever of the two the operator dragged further decides the size. */
    if (locked.value) {
      if (w / h > ratio.value) h = w / ratio.value;
      else w = h * ratio.value;
    }

    const x = clamp(p.x < d.ax ? d.ax - w : d.ax, 0, nw);
    const y = clamp(p.y < d.ay ? d.ay - h : d.ay, 0, nh);

    rect.value = { x, y, w: Math.min(w, nw - x), h: Math.min(h, nh - y) };
  } else {
    resizeTo(d.handle, p);
  }

  announce();
}

function resizeTo(handle: string, p: { x: number; y: number }) {
  const { width: nw, height: nh } = natural.value;
  const r = { ...rect.value };
  const right = r.x + r.w;
  const bottom = r.y + r.h;

  if (handle.includes('w')) { r.x = clamp(p.x, 0, right - 20); r.w = right - r.x; }
  if (handle.includes('e')) { r.w = clamp(p.x, r.x + 20, nw) - r.x; }
  if (handle.includes('n')) { r.y = clamp(p.y, 0, bottom - 20); r.h = bottom - r.y; }
  if (handle.includes('s')) { r.h = clamp(p.y, r.y + 20, nh) - r.y; }

  rect.value = r;
}

function onUp(e: PointerEvent) {
  if (!drag.value) return;
  (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);

  /* A click that was not a drag leaves a degenerate box; put the last good one
     back rather than leaving nothing selected. */
  if (rect.value.w < 8 || rect.value.h < 8) reset();

  drag.value = null;
  announce();
}

/* ── what the host is told ──────────────────────────────────────────── */
function announce() {
  rect.value = {
    x: Math.round(rect.value.x),
    y: Math.round(rect.value.y),
    w: Math.round(rect.value.w),
    h: Math.round(rect.value.h),
  };

  emit('update:rect', { ...rect.value });
  checkBox();
}

let warned: WarningCode | null = null;

function checkBox() {
  if (!props.target) return;

  const small = rect.value.w < props.target.width || rect.value.h < props.target.height;

  /* Emitted on the EDGE, not on every pointer move — a warning repeated forty
     times while dragging is noise, and a host showing it as an alert would
     stack forty alerts. */
  if (small && warned !== 'below-target') {
    warned = 'below-target';
    emit('warning', {
      code: 'below-target',
      message: `The selected area is smaller than ${props.target.width} × ${props.target.height}px, so the result will be enlarged and a little softer.`,
    });
  } else if (!small && warned === 'below-target') {
    warned = null;
  }
}

function checkSource() {
  if (!props.target) return;

  if (natural.value.width < props.target.width || natural.value.height < props.target.height) {
    emit('warning', {
      code: 'source-below-target',
      message: `This image is ${natural.value.width} × ${natural.value.height}px, smaller than the ${props.target.width} × ${props.target.height}px wanted. It can still be used, but it will be enlarged.`,
    });
  }
}

/* ── the result ─────────────────────────────────────────────────────────
   The only place a pixel is actually written. Everything above is choosing a
   rectangle; this is the one function that produces a file. */
const output = computed(() => {
  if (props.target) return { width: props.target.width, height: props.target.height };

  const { w, h } = rect.value;
  const cap = props.maxDim;
  if (!cap || (w <= cap && h <= cap)) return { width: Math.round(w), height: Math.round(h) };

  const k = cap / Math.max(w, h);

  return { width: Math.round(w * k), height: Math.round(h * k) };
});

async function render(): Promise<{ blob: Blob; rect: Rect; width: number; height: number }> {
  if (!bitmap.value) throw new Error('There is no image to crop.');

  const { width, height } = output.value;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot render the crop.');

  /* Quality settings matter most when UPSCALING, which is exactly the case the
     `below-target` warning is about. */
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    bitmap.value as CanvasImageSource,
    rect.value.x, rect.value.y, rect.value.w, rect.value.h,
    0, 0, canvas.width, canvas.height,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, props.type, props.quality);
  });

  if (!blob) throw new Error('The cropped image could not be encoded.');

  return { blob, rect: { ...rect.value }, width: canvas.width, height: canvas.height };
}

defineExpose({ render, auto, reset, rect, natural, output });

const style = computed(() => ({
  '--ic-bg': props.background,
  '--ic-scrim': props.scrimColor,
  '--ic-handle': props.handleColor,
  '--ic-max-h': `${props.maxHeight}px`,
}));

const previewSrc = computed(() => {
  if (typeof props.src === 'string') return props.src;

  return objectUrl.value;
});

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
</script>

<template>
  <div class="apex-ic" :style="style" :data-locked="locked ? 'true' : 'false'">
    <div v-if="showControls" class="apex-ic__bar">
      <ApexButton
        v-if="target"
        icon="crop_free"
        size="sm"
        variant="outline"
        severity="secondary"
        :disabled="!natural.width"
        @click="auto"
      >Centre</ApexButton>
      <ApexButton
        icon="restart_alt"
        size="sm"
        variant="text"
        severity="secondary"
        :disabled="!natural.width"
        @click="reset"
      >Reset</ApexButton>

      <span class="apex-ic__size">
        <template v-if="natural.width">
          {{ rect.w }} × {{ rect.h }}
          <em v-if="target">&rarr; {{ output.width }} × {{ output.height }}</em>
        </template>
      </span>
    </div>

    <!-- The image is a plain <img>: it inherits `image-orientation: from-image`,
         it scales without a redraw, and the browser keeps it sharp. Only the
         RESULT is drawn on a canvas. -->
    <div
      ref="frame"
      class="apex-ic__frame"
      :class="{ 'apex-ic__frame--panning': isPanning }"
      tabindex="0"
      :style="natural.width ? { aspectRatio: `${natural.width} / ${natural.height}` } : undefined"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @mousedown="onMouseDown"
      @keydown="onKeydown"
      @wheel.prevent="onWheel"
      @contextmenu.prevent
    >
      <!-- Positioned, not in flow: `pan` is its top-left corner and `shown` is
           its size, both in frame pixels. The frame's own height comes from the
           `aspect-ratio` above, which is what the image used to give it. -->
      <img
        v-if="previewSrc"
        :src="previewSrc"
        class="apex-ic__img"
        :style="imgStyle"
        alt=""
        draggable="false"
      />

      <div v-if="loading" class="apex-ic__busy">
        <ApexIcon name="progress_activity" :size="28" spin />
      </div>

      <!-- One element for the box AND the dimmed surround: an enormous spread
           box-shadow darkens everything outside it, so there are no four
           overlay panels to keep in step with the box. -->
      <div
        v-if="natural.width"
        class="apex-ic__box"
        :style="{ left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` }"
      >
        <span
          v-for="h in HANDLES"
          :key="h"
          class="apex-ic__handle"
          :class="`apex-ic__handle--${h}`"
          :data-hidden="locked ? 'true' : 'false'"
          @pointerdown.stop="(e) => !locked && onDown(e, h)"
        />
      </div>

      <!-- After the box, so it sits over the scrim that box casts. `.stop` on
           the pointer events or a click on a button would also start a gesture
           on the image underneath. -->
      <div
        v-if="natural.width"
        class="apex-ic__zoom"
        @pointerdown.stop
        @mousedown.stop
        @wheel.stop.prevent
      >
        <button type="button" class="apex-ic__zbtn" :disabled="zoom <= 0.25" title="Zoom out" @click="zoomOut">
          <ApexIcon name="remove" :size="16" />
        </button>
        <button type="button" class="apex-ic__zval" title="Fit the whole image" @click="fitView">{{ zoomPercent }}%</button>
        <button type="button" class="apex-ic__zbtn" :disabled="zoom >= 8" title="Zoom in" @click="zoomIn">
          <ApexIcon name="add" :size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
