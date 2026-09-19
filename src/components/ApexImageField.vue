<script setup lang="ts">
/**
 * ApexImageField — the whole of "this record has a picture", as one control.
 *
 * Choose, crop, preview, replace, remove. A screen binds this and gets the four
 * behaviours that every image field in an admin has had to reinvent:
 *
 *   - what is stored now, shown as a picture rather than a path
 *   - a new file cropped to the size the field actually wants, before it is
 *     uploaded rather than after
 *   - "picked but not saved yet" looking different from "stored"
 *   - a way to clear it, because **empty means keep** on every server that
 *     handles optional images, so removal needs its own instruction
 *
 * ## Two models, and they are not the same question
 *
 *   `v-model`          the File the operator has chosen and cropped, or null
 *   `v-model:removed`  an instruction to clear what is stored
 *
 * They look like one boolean and are not. "I picked a new picture" and "I want
 * no picture" are different sentences, a server reads them differently, and
 * collapsing them means an operator can never clear an image — because a form
 * with nothing in the file box is indistinguishable from a form nobody touched.
 *
 * ## Where the crop happens
 *
 * In a dialog over the field, not inline. A cropper needs room — four hundred
 * pixels of it — and a form row that suddenly grows that tall pushes everything
 * the operator was reading off the screen. The dialog also gives Cancel a clear
 * meaning: the file is discarded and the field is as it was.
 *
 * With no `target` the dialog still opens, because the operator may still want
 * to choose part of the image; the cropper simply starts on the whole of it and
 * `maxDim` is all that limits the result.
 *
 * ## What it does not do
 *
 * Upload. It hands the host a File and the host decides where files go — which
 * is the same line `ApexImageCrop` draws, and for the same reason: a control
 * that knew about `route()` could not live in the kit.
 */
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import ApexField from './ApexField.vue';
import ApexButton from './ApexButton.vue';
import ApexIcon from './ApexIcon.vue';
import ApexDialog from './ApexDialog.vue';
import ApexImageCrop from './ApexImageCrop.vue';
import { pickFieldProps } from '../core/utils';
import type { ApexFieldProps } from '../types';

const props = withDefaults(defineProps<ApexFieldProps & {
  /** The chosen, cropped file — or null when nothing has been chosen. */
  modelValue?: File | null;
  /** An instruction to clear what is stored. See the docblock. */
  removed?: boolean;
  /** What is stored now. A url the host resolved; this control never builds one. */
  previewUrl?: string | null;
  /** Output size. Omit and the crop is optional and the result merely capped. */
  target?: { width: number; height: number } | null;
  lockRatio?: boolean;
  accept?: string;
  /** Refused before the cropper opens, so a 40 MB file never reaches a canvas. */
  maxFileSize?: number;
  type?: string;
  quality?: number;
  maxDim?: number | null;
  /** Width of the preview box. The height follows the target's ratio. */
  previewWidth?: number;
  chooseLabel?: string;
  replaceLabel?: string;
  removeLabel?: string;
  /** Shown under the preview when nothing is stored and nothing is picked. */
  emptyLabel?: string;
  hint?: string;
}>(), {
  modelValue: null,
  removed: false,
  previewUrl: null,
  target: null,
  lockRatio: true,
  accept: 'image/*',
  maxFileSize: 40 * 1024 * 1024,
  type: 'image/webp',
  quality: 0.9,
  maxDim: 2000,
  previewWidth: 280,
  chooseLabel: 'Choose image',
  replaceLabel: 'Replace',
  removeLabel: 'Remove',
  emptyLabel: 'No image',
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: File | null): void;
  (e: 'update:removed', v: boolean): void;
  /** Whatever the cropper said. The host decides whether to show it. */
  (e: 'warning', v: { code: string; message: string }): void;
  (e: 'error', v: { message: string }): void;
}>();

const input = ref<HTMLInputElement | null>(null);
const cropper = ref<InstanceType<typeof ApexImageCrop> | null>(null);

/** The file as CHOSEN — before the crop. Never leaves this component. */
const pending = ref<File | null>(null);
const open = ref(false);
const busy = ref(false);
const notice = ref<string | null>(null);

/* The preview of what has been picked. Revoked when it changes, because an
   object URL the browser is never told to release lives as long as the tab. */
const pickedUrl = ref<string | null>(null);

watch(() => props.modelValue, (file) => {
  if (pickedUrl.value) URL.revokeObjectURL(pickedUrl.value);
  pickedUrl.value = file ? URL.createObjectURL(file) : null;
}, { immediate: true });

onBeforeUnmount(() => {
  if (pickedUrl.value) URL.revokeObjectURL(pickedUrl.value);
});

/**
 * What the box shows, in priority order.
 *
 * A picked file wins over a stored one — it is what saving would keep. And a
 * pressed Remove hides the stored image, so the field reflects what saving
 * would DO rather than what the record currently holds.
 */
const shown = computed(() => {
  if (pickedUrl.value) return { url: pickedUrl.value, state: 'picked' as const };
  if (props.previewUrl && !props.removed) return { url: props.previewUrl, state: 'stored' as const };
  if (props.removed) return { url: null, state: 'removing' as const };

  return { url: null, state: 'empty' as const };
});

const editable = computed(() => !props.disabled && !props.readonly);

/* A target gives the preview the shape the result will actually be, so the
   operator is not judging a 16:9 crop inside a 4:3 box. */
const previewStyle = computed(() => ({
  inlineSize: `${props.previewWidth}px`,
  aspectRatio: props.target ? `${props.target.width} / ${props.target.height}` : '3 / 2',
}));

/**
 * A limit said in units a person would use.
 *
 * `Math.round(bytes / 1MB)` was the first version, and a 512 KB limit came out
 * as "larger than 0 MB" — true, unhelpful, and the kind of message that makes
 * an operator think the control is broken rather than that their file is big.
 */
function size(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);

    return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function choose() {
  if (editable.value) input.value?.click();
}

function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  /* Cleared straight away so choosing the SAME file twice still fires change —
     without it, cancelling a crop and re-choosing that file does nothing. */
  (e.target as HTMLInputElement).value = '';
  if (!file) return;

  notice.value = null;

  if (props.maxFileSize && file.size > props.maxFileSize) {
    emit('error', { message: `That image is larger than ${size(props.maxFileSize)}. Please choose a smaller one.` });

    return;
  }

  if (!file.type.startsWith('image/')) {
    emit('error', { message: 'That file is not an image.' });

    return;
  }

  pending.value = file;
  open.value = true;
}

/**
 * Keep the crop.
 *
 * The blob becomes a File so the server sees a name and an extension. The name
 * is derived from the original's, with the extension replaced — an operator who
 * later finds `poster.webp` in a folder can still tell what it was.
 */
async function confirm() {
  if (!cropper.value || !pending.value) return;

  busy.value = true;

  try {
    const { blob } = await cropper.value.render();
    const ext = (props.type.split('/')[1] || 'webp').replace('jpeg', 'jpg');
    const stem = pending.value.name.replace(/\.[^.]+$/, '') || 'image';
    const file = new File([blob], `${stem}.${ext}`, { type: blob.type });

    emit('update:modelValue', file);
    /* Choosing a picture is not a removal. Leaving both set would post an
       instruction and its opposite. */
    if (props.removed) emit('update:removed', false);

    open.value = false;
    pending.value = null;
  } catch (e) {
    emit('error', { message: e instanceof Error ? e.message : 'The image could not be prepared.' });
  } finally {
    busy.value = false;
  }
}

function cancel() {
  open.value = false;
  pending.value = null;
  notice.value = null;
}

/** Discard a picked file without touching what is stored. */
function discard() {
  emit('update:modelValue', null);
}

function remove() {
  emit('update:modelValue', null);
  emit('update:removed', true);
}

/** Undo a Remove. Without it the only way back is Cancel on the whole form. */
function keep() {
  emit('update:removed', false);
}

function onWarning(w: { code: string; message: string }) {
  notice.value = w.message;
  emit('warning', w);
}

const fieldProps = computed(() => pickFieldProps(props));
</script>

<template>
  <ApexField v-bind="fieldProps" :label-for="false" filled>
    <div class="apex-imf">
      <input
        ref="input"
        type="file"
        class="apex-imf__input"
        :accept="accept"
        @change="onPick"
      />

      <div
        class="apex-imf__preview"
        :style="previewStyle"
        :data-state="shown.state"
        :data-clickable="editable && !shown.url ? 'true' : 'false'"
        @click="!shown.url && choose()"
      >
        <img v-if="shown.url" :src="shown.url" class="apex-imf__img" alt="" />

        <div v-else class="apex-imf__empty">
          <ApexIcon :name="shown.state === 'removing' ? 'delete' : 'image'" :size="28" />
          <strong>{{ shown.state === 'removing' ? 'Will be removed when you save' : emptyLabel }}</strong>
          <em v-if="hint && shown.state !== 'removing'">{{ hint }}</em>
        </div>
      </div>

      <div class="apex-imf__actions">
        <!-- "Not saved yet" is the caption, not a colour: a picked file and a
             stored one are the same size on purpose, so the words carry the
             difference. -->
        <span v-if="shown.state === 'picked'" class="apex-imf__pending">Not saved yet</span>

        <template v-if="editable">
          <ApexButton
            v-if="shown.state !== 'removing'"
            size="sm"
            variant="outline"
            severity="secondary"
            icon="upload"
            @click="choose"
          >{{ shown.url ? replaceLabel : chooseLabel }}</ApexButton>

          <ApexButton
            v-if="shown.state === 'picked'"
            size="sm"
            variant="text"
            severity="danger"
            icon="close"
            @click="discard"
          >Discard</ApexButton>

          <ApexButton
            v-else-if="shown.state === 'stored'"
            size="sm"
            variant="text"
            severity="danger"
            icon="delete"
            @click="remove"
          >{{ removeLabel }}</ApexButton>

          <ApexButton
            v-else-if="shown.state === 'removing'"
            size="sm"
            variant="text"
            severity="secondary"
            icon="undo"
            @click="keep"
          >Keep it</ApexButton>
        </template>
      </div>
    </div>

    <!-- Over the field, not inline: a cropper needs four hundred pixels and a
         form row that grows that tall pushes everything off the screen. -->
    <ApexDialog
      v-model:visible="open"
      header="Crop image"
      :subtitle="target ? `The result will be ${target.width} × ${target.height}px` : undefined"
      icon="crop"
      modal
      width="min(900px, 94vw)"
      @hide="cancel"
    >
      <ApexImageCrop
        ref="cropper"
        :src="pending"
        :target="target"
        :lock-ratio="lockRatio"
        :type="type"
        :quality="quality"
        :max-dim="maxDim"
        @warning="onWarning"
        @error="(e) => emit('error', e)"
      />

      <p v-if="notice" class="apex-imf__notice">
        <ApexIcon name="info" :size="15" />{{ notice }}
      </p>

      <template #footer>
        <ApexButton variant="text" severity="secondary" size="sm" @click="cancel">Cancel</ApexButton>
        <ApexButton severity="success" size="sm" icon="check" :disabled="busy" @click="confirm">
          Use this crop
        </ApexButton>
      </template>
    </ApexDialog>
  </ApexField>
</template>
