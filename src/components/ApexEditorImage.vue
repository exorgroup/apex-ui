<script setup lang="ts">
/**
 * ApexEditorImage — insert or edit an image.
 *
 * ONE dialog with two tabs rather than a three-way split button, because the
 * same fields that insert an image also EDIT one — two surfaces would have to
 * agree about alt text, dimensions and the ratio lock, and two declarations of
 * one shape always diverge.
 *
 * Modal rather than a popover: there are five fields and a drop zone, which is
 * more than a bubble can hold without becoming a small window anyway.
 */
import { computed, nextTick, ref, watch } from 'vue';
import type { ApexEditorClasses } from '../types';
import ApexIcon from './ApexIcon.vue';
import { safeUrlValue } from '../core/editor/htmlSchema';

export interface ImageAttrs { src?: string; alt?: string; width?: string; height?: string }

const props = withDefaults(defineProps<{
  /**
   * A COUNTER, for the same reason as the link editor's: the menu has to reopen
   * this after the author closed it, and an already-true boolean fires no
   * watcher.
   */
  openRequest?: number;
  /** The selected image's attributes when editing, null when inserting. */
  attrs?: ImageAttrs | null;
  /**
   * Where an uploaded file goes. Takes a File, returns a URL (or a promise of
   * one). Absent means inline it as a `data:` URL — which keeps the component
   * usable with no backend, at the cost of putting the bytes in the markup, so a
   * real application supplies this.
   */
  upload?: ((file: File) => string | Promise<string>) | null;
  disabled?: boolean;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), { openRequest: 0, attrs: null, upload: null });

const emit = defineEmits<{ (e: 'apply', attrs: Record<string, string>): void }>();

const open = ref(false);
const tab = ref<'general' | 'upload'>('general');
const over = ref(false);
const busy = ref(false);
const error = ref('');
const decorative = ref(false);
const lock = ref(true);
const ratio = ref<number | null>(null);
const draft = ref({ src: '', alt: '', width: '', height: '' });
const srcField = ref<HTMLInputElement | null>(null);
const fileField = ref<HTMLInputElement | null>(null);

const editing = computed(() => !!props.attrs?.src);

function show() {
  const a = props.attrs || {};
  draft.value = {
    src: a.src || '',
    alt: a.alt || '',
    width: a.width == null ? '' : String(a.width),
    height: a.height == null ? '' : String(a.height),
  };
  /* An empty alt on an EXISTING image is a decorative image, not a forgotten
     description — the attribute is present and blank on purpose. A new image
     starts undeclared so the author is asked. */
  decorative.value = editing.value && a.alt === '';
  ratio.value = aspectOf(draft.value);
  tab.value = 'general';
  error.value = '';
  open.value = true;
  nextTick(() => srcField.value?.focus());
}
function hide() { open.value = false; busy.value = false; over.value = false; }
function cancel() { hide(); }

watch(() => props.openRequest, () => { if (!props.disabled) show(); });

function aspectOf(d: { width: string; height: string }) {
  const w = parseFloat(d.width); const h = parseFloat(d.height);
  return w > 0 && h > 0 ? w / h : null;
}

/* The lock drives the OTHER field, so an author who types a width gets a
   proportional height rather than a stretched image. */
function onWidth() {
  if (!lock.value || !ratio.value) return;
  const w = parseFloat(draft.value.width);
  draft.value.height = w > 0 ? String(Math.round(w / ratio.value)) : '';
}
function onHeight() {
  if (!lock.value || !ratio.value) return;
  const h = parseFloat(draft.value.height);
  draft.value.width = h > 0 ? String(Math.round(h * ratio.value)) : '';
}

function onDrop(e: DragEvent) {
  over.value = false;
  take(e.dataTransfer?.files?.[0]);
}
function onPick(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  take(file);
}

function take(file?: File | null) {
  if (!file) return;
  if (!/^image\//.test(file.type)) { error.value = 'That file is not an image.'; return; }
  /* Refused HERE rather than silently losing the src later: an SVG can carry
     script, so the schema rejects a data: URL of one — and an author who dropped
     a file deserves to be told why, not to watch it vanish. */
  if (/svg/i.test(file.type) && !props.upload) {
    error.value = 'SVG files cannot be inlined. Supply an upload handler, or use a URL.';
    return;
  }
  error.value = '';
  busy.value = true;
  const done = (url: string) => {
    draft.value.src = url;
    measureNatural(url);
    busy.value = false;
    tab.value = 'general';
  };
  const fail = (e: unknown) => {
    busy.value = false;
    const msg = (e as { message?: string } | null)?.message;
    error.value = `That image could not be read${msg ? `: ${msg}` : '.'}`;
  };
  try {
    Promise.resolve(props.upload ? props.upload(file) : readDataUrl(file)).then(done, fail);
  } catch (e) { fail(e); }
}

function readDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('unreadable'));
    reader.readAsDataURL(file);
  });
}

/* The image's own pixel size, so the dimension fields and the ratio lock start
   from something true rather than empty. */
function measureNatural(url: string) {
  const probe = new Image();
  probe.onload = () => {
    if (!probe.naturalWidth) return;
    ratio.value = probe.naturalWidth / probe.naturalHeight;
    if (!draft.value.width && !draft.value.height) {
      draft.value.width = String(probe.naturalWidth);
      draft.value.height = String(probe.naturalHeight);
    }
  };
  probe.src = url;
}

function save() {
  const src = String(draft.value.src || '').trim();
  if (!src) return;
  /* The same guard the parser applies. Attributes typed into a dialog reach the
     document WITHOUT going through parseDOM, so without this the one path that
     sanitises would be the one an attacker does not use. */
  if (!safeUrlValue('src', src)) {
    error.value = 'That address is not allowed as an image source.';
    return;
  }
  const out: Record<string, string> = { src };
  if (decorative.value) out.alt = '';
  else if (draft.value.alt.trim()) out.alt = draft.value.alt.trim();
  if (draft.value.width.trim()) out.width = draft.value.width.trim();
  if (draft.value.height.trim()) out.height = draft.value.height.trim();
  emit('apply', out);
  hide();
}

defineExpose({ show, hide, save, cancel, draft, decorative, error, onWidth, onHeight });
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="apex-edimg__scrim" :class="ui?.imageScrim" @pointerdown.self="cancel">
      <div class="apex-edimg" :class="ui?.image" role="dialog" aria-modal="true"
           :aria-label="editing ? 'Edit image' : 'Insert image'" @keydown.esc.stop="cancel">
        <header class="apex-edimg__head" :class="ui?.imageHead">
          <h2 class="apex-edimg__title" :class="ui?.imageTitle">{{ editing ? 'Edit image' : 'Insert image' }}</h2>
          <button type="button" class="apex-edimg__x" :class="ui?.imageClose" aria-label="Close" @click="cancel">
            <ApexIcon name="close" :size="18" />
          </button>
        </header>
        <div class="apex-edimg__tabs" :class="ui?.imageTabs" role="tablist">
          <button type="button" role="tab" class="apex-edimg__tab" :class="ui?.imageTab"
                  :aria-selected="tab === 'general'" :data-on="tab === 'general' ? 'true' : 'false'"
                  @click="tab = 'general'">General</button>
          <button type="button" role="tab" class="apex-edimg__tab" :class="ui?.imageTab"
                  :aria-selected="tab === 'upload'" :data-on="tab === 'upload' ? 'true' : 'false'"
                  @click="tab = 'upload'">Upload</button>
        </div>

        <div v-if="tab === 'general'" class="apex-edimg__pane" :class="ui?.imagePane">
          <label class="apex-edimg__field" :class="ui?.imageField">
            <span>Source</span>
            <input ref="srcField" v-model="draft.src" type="url" class="apex-edimg__input" :class="ui?.imageInput"
                   placeholder="https://example.com/image.png" @change="measureNatural(draft.src)" />
          </label>
          <label class="apex-edimg__field" :class="ui?.imageField">
            <span>Alternative description</span>
            <input v-model="draft.alt" type="text" class="apex-edimg__input" :class="ui?.imageInput"
                   :disabled="decorative" placeholder="What the image shows" />
          </label>
          <!-- an explicit decorative flag rather than leaving alt optional:
               omitting it quietly produces inaccessible markup, where alt=""
               states that the image carries no meaning -->
          <label class="apex-edimg__check" :class="ui?.imageCheck">
            <input v-model="decorative" type="checkbox" />
            <span>Decorative — no description needed</span>
          </label>
          <!-- Additive, not a replacement: the whole dialog is already opt-out
               (the HOST mounts it), so the case worth serving is a CMS that wants
               our fields plus a caption, a credit or a licence. -->
          <slot name="fields" :draft="draft" :editing="editing" />
          <div class="apex-edimg__dims" :class="ui?.imageDims">
            <label class="apex-edimg__field" :class="ui?.imageField">
              <span>Width</span>
              <input v-model="draft.width" class="apex-edimg__input" :class="ui?.imageInput" inputmode="numeric"
                     @input="onWidth" />
            </label>
            <label class="apex-edimg__field" :class="ui?.imageField">
              <span>Height</span>
              <input v-model="draft.height" class="apex-edimg__input" :class="ui?.imageInput" inputmode="numeric"
                     @input="onHeight" />
            </label>
            <button type="button" class="apex-edimg__lock" :class="ui?.imageLock" :data-on="lock ? 'true' : 'false'"
                    :aria-pressed="lock" aria-label="Lock aspect ratio" @click="lock = !lock">
              <ApexIcon :name="lock ? 'lock' : 'lock_open'" :size="16" />
            </button>
          </div>
        </div>

        <div v-else class="apex-edimg__pane" :class="ui?.imagePane">
          <div class="apex-edimg__drop" :class="ui?.imageDrop" :data-over="over ? 'true' : 'false'"
               @dragover.prevent="over = true" @dragleave="over = false" @drop.prevent="onDrop">
            <p class="apex-edimg__dropmsg" :class="ui?.imageDropMessage">{{ busy ? 'Reading…' : 'Drop an image here' }}</p>
            <button type="button" class="apex-edimg__browse" :class="ui?.imageBrowse" :disabled="busy"
                    @click="fileField?.click()">Browse for an image</button>
            <input ref="fileField" type="file" accept="image/*" class="apex-edimg__file" :class="ui?.imageFile"
                   @change="onPick" />
          </div>
          <p v-if="!upload" class="apex-edimg__note" :class="ui?.imageNote">
            No upload handler is set, so the file is inlined into the markup.
          </p>
        </div>

        <p v-if="error" class="apex-edimg__err" :class="ui?.imageError" role="alert">{{ error }}</p>
        <figure v-if="draft.src && !error" class="apex-edimg__preview" :class="ui?.imagePreview">
          <img :src="draft.src" alt="" />
        </figure>

        <slot name="footer" :draft="draft" :editing="editing" :save="save" :cancel="cancel"
              :can-save="!!draft.src.trim() && !busy">
          <footer class="apex-edimg__foot" :class="ui?.imageFoot">
            <button type="button" class="apex-edimg__cancel" :class="ui?.imageCancel" @click="cancel">Cancel</button>
            <button type="button" class="apex-edimg__save" :class="ui?.imageSave" :disabled="!draft.src.trim() || busy"
                    @click="save">{{ editing ? 'Save' : 'Insert' }}</button>
          </footer>
        </slot>
      </div>
    </div>
  </Teleport>
</template>
