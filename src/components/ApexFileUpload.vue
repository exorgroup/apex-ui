<script setup lang="ts">
/**
 * ApexFileUpload — file selection and upload, with drag and drop, per-file
 * progress and validation.
 *
 * Two modes from one implementation: `basic` is a single button (optionally
 * auto-uploading), `advanced` adds the button row, the drop area and the file
 * list. Every region is a slot, so a custom dropzone or an image grid is a
 * template rather than a different component.
 *
 * Uploading uses XMLHttpRequest rather than fetch, because progress events are
 * the point of this control and fetch cannot report upload progress.
 */
import { computed, ref, watch } from 'vue';
import ApexButton from './ApexButton.vue';
import ApexIcon from './ApexIcon.vue';
import ApexProgressBar from './ApexProgressBar.vue';

export interface UploadFile {
  /** The browser File. */
  file: File;
  /** Object URL for an image, revoked when the file is removed. */
  preview?: string;
  /** 0–100 while uploading. */
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

const props = withDefaults(defineProps<{
  /** Bindable list of selected Files. */
  modelValue?: File[];
  /** basic is one button; advanced adds the drop area and the file list. */
  mode?: 'basic' | 'advanced';
  /** Field name in the multipart request. */
  name?: string;
  /** Endpoint. Omit with customUpload, or to keep the files client-side. */
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  multiple?: boolean;
  /** Same syntax as the native input: 'image/*', '.pdf,.docx'. */
  accept?: string;
  /** Size limit per file, in bytes. A file over it is rejected with a message. */
  maxFileSize?: number;
  /** Size limit across the whole selection, in bytes. */
  maxTotalSize?: number;
  /** How many files may be selected at once. */
  maxFiles?: number;
  /** Upload as soon as files are chosen. */
  auto?: boolean;
  /** Emits `uploader` instead of sending the request yourself. */
  customUpload?: boolean;
  disabled?: boolean;
  /** Show the file list as rows, or as a thumbnail grid. */
  layout?: 'list' | 'grid';
  /** Thumbnail size in pixels — row height in list layout, cell width in grid. */
  previewSize?: number;
  /** Hide the built-in button row, e.g. when the header slot replaces it. */
  showButtons?: boolean;
  /** Drop area in advanced mode. */
  dropzone?: boolean;
  chooseLabel?: string;
  uploadLabel?: string;
  cancelLabel?: string;
  chooseIcon?: string;
  uploadIcon?: string;
  cancelIcon?: string;
  /** Colour and weight of each built-in button, straight through to ApexButton. */
  chooseSeverity?: string;
  uploadSeverity?: string;
  cancelSeverity?: string;
  chooseVariant?: 'solid' | 'outlined' | 'text';
  uploadVariant?: 'solid' | 'outlined' | 'text';
  cancelVariant?: 'solid' | 'outlined' | 'text';
  /** Size for all three, and rounded corners. */
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonsRounded?: boolean;
  /** Drop area copy. The hint defaults to the size limit, when there is one. */
  emptyLabel?: string;
  hint?: string;
  invalidTypeMessage?: string;
  invalidSizeMessage?: string;
  invalidLimitMessage?: string;
  /* chrome */
  width?: string;
  background?: string;
  borderColor?: string;
  radius?: string;
}>(), {
  mode: 'advanced', name: 'files', method: 'POST', layout: 'list', previewSize: 44,
  showButtons: true, dropzone: true,
  chooseLabel: 'Choose', uploadLabel: 'Upload', cancelLabel: 'Cancel',
  chooseIcon: 'add', uploadIcon: 'upload', cancelIcon: 'close',
  chooseSeverity: 'primary', uploadSeverity: 'secondary', cancelSeverity: 'secondary',
  chooseVariant: 'solid', uploadVariant: 'outlined', cancelVariant: 'text',
  emptyLabel: 'Drop files or click to browse',
  invalidTypeMessage: '{name}: this file type is not allowed',
  invalidSizeMessage: '{name}: larger than the {limit} limit',
  invalidLimitMessage: 'At most {max} files',
});

const emit = defineEmits<{
  (e: 'update:modelValue', v: File[]): void;
  (e: 'select' | 'remove' | 'clear', payload?: unknown): void;
  (e: 'before-upload', payload: { formData: FormData; xhr: XMLHttpRequest }): void;
  (e: 'progress', payload: { progress: number; file?: File }): void;
  (e: 'upload', payload: { files: File[]; response?: unknown }): void;
  (e: 'error', payload: { files?: File[]; message: string; xhr?: XMLHttpRequest }): void;
  (e: 'uploader', payload: { files: File[]; clear: () => void; setProgress: (n: number) => void }): void;
}>();

const input = ref<HTMLInputElement | null>(null);
const items = ref<UploadFile[]>([]);
const uploaded = ref<UploadFile[]>([]);
const messages = ref<string[]>([]);
const dragging = ref(false);
const total = ref(0);

/* ── formatting ─────────────────────────────────────────── */
const UNITS = ['B', 'KB', 'MB', 'GB'];
function formatSize(bytes: number) {
  let n = bytes, i = 0;
  while (n >= 1024 && i < UNITS.length - 1) { n /= 1024; i += 1; }
  return (i === 0 ? n : n.toFixed(n < 10 ? 1 : 0)) + ' ' + UNITS[i];
}
const hintText = computed(() => props.hint
  ?? (props.maxFileSize ? `Up to ${formatSize(props.maxFileSize)} each` : ''));

const isImage = (f: File) => f.type.startsWith('image/');

/* ── validation ─────────────────────────────────────────── */
function typeAllowed(file: File) {
  if (!props.accept) return true;
  return props.accept.split(',').map((s) => s.trim().toLowerCase()).some((rule) => {
    if (!rule) return false;
    if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith('/*')) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}
const fill = (tpl: string, vars: Record<string, string>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');

/* ── selection ──────────────────────────────────────────── */
function add(list: FileList | File[]) {
  const incoming = [...list];
  const errs: string[] = [];
  const accepted: UploadFile[] = [];
  let running = items.value.reduce((s, i) => s + i.file.size, 0);

  incoming.forEach((file) => {
    if (!typeAllowed(file)) { errs.push(fill(props.invalidTypeMessage, { name: file.name })); return; }
    if (props.maxFileSize && file.size > props.maxFileSize) {
      errs.push(fill(props.invalidSizeMessage, { name: file.name, limit: formatSize(props.maxFileSize) }));
      return;
    }
    if (props.maxTotalSize && running + file.size > props.maxTotalSize) {
      errs.push(fill(props.invalidSizeMessage, { name: file.name, limit: formatSize(props.maxTotalSize) }));
      return;
    }
    const count = (props.multiple ? items.value.length + accepted.length : 0);
    if (props.maxFiles && count >= props.maxFiles) {
      errs.push(fill(props.invalidLimitMessage, { max: String(props.maxFiles) }));
      return;
    }
    running += file.size;
    accepted.push({
      file,
      preview: isImage(file) ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'pending',
    });
  });

  /* Deduped: the count limit is about the selection, not each file, so eight
     files over a six-file limit is one message, not eight. */
  messages.value = [...new Set(errs)];
  if (errs.length) emit('error', { message: errs[0] });
  if (!accepted.length) return;

  /* Without `multiple` a new pick replaces the old one, so the control never
     holds more files than it can send. */
  if (props.multiple) items.value = items.value.concat(accepted);
  else { revokeAll(items.value); items.value = accepted.slice(0, 1); }

  syncModel();
  emit('select', { files: items.value.map((i) => i.file) });
  if (props.auto) upload();
}

function revokeAll(list: UploadFile[]) {
  list.forEach((i) => { if (i.preview) URL.revokeObjectURL(i.preview); });
}
const syncModel = () => emit('update:modelValue', items.value.map((i) => i.file));

function onPick(e: Event) {
  const el = e.target as HTMLInputElement;
  if (el.files?.length) add(el.files);
  // reset, or picking the same file twice fires nothing
  el.value = '';
}
function choose() { if (!props.disabled) input.value?.click(); }

function removeFile(index: number) {
  const [gone] = items.value.splice(index, 1);
  if (gone?.preview) URL.revokeObjectURL(gone.preview);
  syncModel();
  emit('remove', { file: gone?.file, files: items.value.map((i) => i.file) });
}
function removeUploaded(index: number) {
  const [gone] = uploaded.value.splice(index, 1);
  if (gone?.preview) URL.revokeObjectURL(gone.preview);
}
function clear() {
  revokeAll(items.value);
  items.value = [];
  messages.value = [];
  total.value = 0;
  syncModel();
  emit('clear');
}

/* ── uploading ──────────────────────────────────────────── */
function setProgress(n: number) {
  total.value = n;
  items.value.forEach((i) => { i.progress = n; });
}

function upload() {
  if (!items.value.length) return;
  const files = items.value.map((i) => i.file);

  if (props.customUpload) {
    items.value.forEach((i) => { i.status = 'uploading'; });
    emit('uploader', { files, clear, setProgress });
    return;
  }
  if (!props.url) {
    /* No endpoint: the selection itself is the result, which is what a form
       posting the files with the rest of its fields wants. */
    items.value.forEach((i) => { i.status = 'complete'; i.progress = 100; });
    uploaded.value = uploaded.value.concat(items.value);
    items.value = [];
    total.value = 100;
    syncModel();
    emit('upload', { files });
    return;
  }

  const xhr = new XMLHttpRequest();
  const form = new FormData();
  files.forEach((f) => form.append(props.name + (props.multiple ? '[]' : ''), f, f.name));
  items.value.forEach((i) => { i.status = 'uploading'; i.progress = 0; });
  emit('before-upload', { formData: form, xhr });

  xhr.upload.addEventListener('progress', (e) => {
    if (!e.lengthComputable) return;
    const pct = Math.round((e.loaded * 100) / e.total);
    setProgress(pct);
    emit('progress', { progress: pct });
  });
  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      items.value.forEach((i) => { i.status = 'complete'; i.progress = 100; });
      uploaded.value = uploaded.value.concat(items.value);
      items.value = [];
      syncModel();
      emit('upload', { files, response: xhr.response });
    } else {
      items.value.forEach((i) => { i.status = 'error'; });
      const message = 'Upload failed (' + xhr.status + ')';
      messages.value = [message];
      emit('error', { files, message, xhr });
    }
  });
  xhr.addEventListener('error', () => {
    items.value.forEach((i) => { i.status = 'error'; });
    const message = 'Upload failed';
    messages.value = [message];
    emit('error', { files, message, xhr });
  });

  xhr.open(props.method, props.url, true);
  xhr.withCredentials = !!props.withCredentials;
  Object.entries(props.headers || {}).forEach(([k, v]) => xhr.setRequestHeader(k, v));
  xhr.send(form);
}

/* ── drag and drop ──────────────────────────────────────── */
function onDrop(e: DragEvent) {
  dragging.value = false;
  if (props.disabled) return;
  const files = e.dataTransfer?.files;
  if (files?.length) add(files);
}
function onDragOver(e: DragEvent) {
  if (props.disabled) return;
  // without this the browser navigates to the dropped file
  e.preventDefault();
  dragging.value = true;
}

watch(() => props.modelValue, (v) => {
  if (!v) return;
  const same = v.length === items.value.length && v.every((f, i) => items.value[i]?.file === f);
  if (same) return;
  revokeAll(items.value);
  items.value = v.map((file) => ({
    file, preview: isImage(file) ? URL.createObjectURL(file) : undefined,
    progress: 0, status: 'pending' as const,
  }));
});

const rootStyle = computed(() => {
  const s: Record<string, string> = {};
  if (props.width) s['--fu-w'] = props.width;
  if (props.background) s['--fu-bg'] = props.background;
  if (props.borderColor) s['--fu-border'] = props.borderColor;
  if (props.radius) s['--fu-radius'] = props.radius;
  s['--fu-thumb'] = props.previewSize + 'px';
  return s;
});

const callbacks = computed(() => ({
  files: items.value,
  uploadedFiles: uploaded.value,
  chooseCallback: choose,
  uploadCallback: upload,
  clearCallback: clear,
  removeFileCallback: removeFile,
  removeUploadedFileCallback: removeUploaded,
  progress: total.value,
  messages: messages.value,
  formatSize,
}));

defineExpose({ choose, upload, clear, removeFile, files: items, uploadedFiles: uploaded, formatSize });
</script>

<template>
  <div class="apex-fu" :style="rootStyle" :data-mode="mode" :data-disabled="disabled ? 'true' : 'false'"
       :data-drag="dragging ? 'true' : 'false'"
       @dragover="onDragOver" @dragleave="dragging = false" @drop.prevent="onDrop">
    <input ref="input" type="file" class="apex-fu__input" :accept="accept" :multiple="multiple"
           :disabled="disabled" tabindex="-1" @change="onPick" />

    <!-- basic: one button, and the chosen name beside it -->
    <template v-if="mode === 'basic'">
      <div class="apex-fu__basic">
        <ApexButton :icon="items.length ? uploadIcon : chooseIcon" :disabled="disabled"
                    :severity="items.length && !auto ? uploadSeverity : chooseSeverity"
                    :variant="items.length && !auto ? uploadVariant : chooseVariant"
                    :size="buttonSize" :rounded="buttonsRounded"
                    @click="items.length && !auto ? upload() : choose()">
          {{ items.length && !auto ? uploadLabel : chooseLabel }}
        </ApexButton>
        <span v-if="items.length" class="apex-fu__basicname">
          {{ items[0].file.name }}<em>{{ formatSize(items[0].file.size) }}</em>
        </span>
        <span v-else-if="hintText" class="apex-fu__hint">{{ hintText }}</span>
      </div>
    </template>

    <template v-else>
      <slot name="header" v-bind="callbacks">
        <div v-if="showButtons" class="apex-fu__bar">
          <ApexButton :icon="chooseIcon" :severity="chooseSeverity" :variant="chooseVariant"
                      :size="buttonSize" :rounded="buttonsRounded"
                      :disabled="disabled" @click="choose">{{ chooseLabel }}</ApexButton>
          <ApexButton :icon="uploadIcon" :severity="uploadSeverity" :variant="uploadVariant"
                      :size="buttonSize" :rounded="buttonsRounded"
                      :disabled="disabled || !items.length" @click="upload">{{ uploadLabel }}</ApexButton>
          <ApexButton :icon="cancelIcon" :severity="cancelSeverity" :variant="cancelVariant"
                      :size="buttonSize" :rounded="buttonsRounded"
                      :disabled="disabled || !items.length" @click="clear">{{ cancelLabel }}</ApexButton>
        </div>
      </slot>

      <ApexProgressBar v-if="total > 0 && total < 100" :value="total" class="apex-fu__progress" />

      <p v-for="(m, mi) in messages" :key="mi" class="apex-fu__error">
        <ApexIcon name="error" :size="16" />{{ m }}
      </p>

      <slot name="content" v-bind="callbacks">
        <div v-if="items.length || uploaded.length" class="apex-fu__list" :data-layout="layout">
          <div v-for="(item, i) in items" :key="item.file.name + i" class="apex-fu__file"
               :data-status="item.status">
            <slot name="file" :file="item" :index="i" :remove-file-callback="removeFile" :format-size="formatSize">
              <span class="apex-fu__thumb">
                <img v-if="item.preview" :src="item.preview" :alt="item.file.name" />
                <ApexIcon v-else name="description" :size="20" />
              </span>
              <span class="apex-fu__meta">
                <strong>{{ item.file.name }}</strong>
                <em>{{ formatSize(item.file.size) }}</em>
                <ApexProgressBar v-if="item.status === 'uploading'" :value="item.progress" :height="3" />
              </span>
              <span class="apex-fu__status" :data-status="item.status">{{
                item.status === 'complete' ? 'Complete' : item.status === 'uploading' ? 'Uploading' :
                item.status === 'error' ? 'Failed' : 'Pending' }}</span>
              <button type="button" class="apex-fu__x" aria-label="Remove" @click="removeFile(i)">
                <ApexIcon name="close" :size="17" />
              </button>
            </slot>
          </div>
          <div v-for="(item, i) in uploaded" :key="'up' + i" class="apex-fu__file" data-status="complete">
            <span class="apex-fu__thumb">
              <img v-if="item.preview" :src="item.preview" :alt="item.file.name" />
              <ApexIcon v-else name="description" :size="20" />
            </span>
            <span class="apex-fu__meta">
              <strong>{{ item.file.name }}</strong>
              <em>{{ formatSize(item.file.size) }}</em>
            </span>
            <span class="apex-fu__status" data-status="complete">Complete</span>
            <button type="button" class="apex-fu__x" aria-label="Remove" @click="removeUploaded(i)">
              <ApexIcon name="close" :size="17" />
            </button>
          </div>
        </div>

        <div v-else-if="dropzone" class="apex-fu__drop" role="button" tabindex="0"
             @click="choose" @keydown.enter.prevent="choose" @keydown.space.prevent="choose">
          <slot name="empty">
            <ApexIcon name="cloud_upload" :size="34" class="apex-fu__dropicon" />
            <strong>{{ emptyLabel }}</strong>
            <em v-if="hintText">{{ hintText }}</em>
          </slot>
        </div>
      </slot>

      <slot name="footer" v-bind="callbacks" />
    </template>
  </div>
</template>
