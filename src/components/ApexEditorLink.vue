<script setup lang="ts">
/**
 * ApexEditorLink — the link editor.
 *
 * A popover rather than a prompt, because a link has three fields worth editing
 * and one of them — the text — is already in the document. Opening it on an
 * existing link reads that link's attributes so editing is editing rather than
 * replacing.
 */
import { computed, nextTick, ref, watch } from 'vue';
import type { ApexEditorClasses } from '../types';
import ApexIcon from './ApexIcon.vue';

const props = withDefaults(defineProps<{
  active?: { marks: Record<string, boolean> } | null;
  /** The href under the caret, when there is one. */
  href?: string | null;
  target?: string | null;
  disabled?: boolean;
  /**
   * A COUNTER, not a boolean: Insert › Link has to be able to open this a second
   * time after the author closed it, and a boolean that is already true fires no
   * watcher. Bumped by the editor's own `link` command, so the menu entry
   * reaches the same popover the toolbar button opens rather than a second link
   * editor that would drift from it.
   */
  openRequest?: number;
  /** Prefix a bare domain with this, so "example.com" is a usable link. */
  defaultScheme?: string;
  /** Class map — §4.3. Every part the template draws takes one key. */
  ui?: ApexEditorClasses;
}>(), { defaultScheme: 'https://', openRequest: 0 });

const emit = defineEmits<{
  (e: 'apply', payload: { href: string; target: string | null }): void;
  (e: 'remove'): void;
}>();

const open = ref(false);
const draft = ref('');
const newTab = ref(false);
const field = ref<HTMLInputElement | null>(null);

const isLink = computed(() => !!props.active?.marks.link);

function show() {
  draft.value = props.href || '';
  newTab.value = props.target === '_blank';
  open.value = true;
  nextTick(() => field.value?.focus());
}
function hide() { open.value = false; }

/**
 * Normalises what was typed.
 *
 * A bare domain becomes https, because that is what someone typing
 * "example.com" means. Anything already carrying a scheme is left alone —
 * including mailto: and tel:, which a naive prefix would corrupt into
 * "https://mailto:...".
 */
function normalise(value: string): string {
  const v = value.trim();
  if (!v) return '';
  if (/^(https?|mailto|tel|ftp|sms):/i.test(v)) return v;
  if (v.startsWith('/') || v.startsWith('#')) return v;
  /* An email with no scheme is a mailto, since nobody means to visit one. */
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  return props.defaultScheme + v;
}

function apply() {
  const href = normalise(draft.value);
  if (!href) return;
  emit('apply', { href, target: newTab.value ? '_blank' : null });
  hide();
}
function remove() {
  emit('remove');
  hide();
}
/* Explicit, not just Escape. An author who opened the editor and changed their
   mind needs somewhere to click; an invisible affordance is not one. The draft is
   discarded, since cancelling a link edit means the link is unchanged. */
function cancel() { hide(); }

/* A selection change while the popover is open means the target moved, so the
   draft is stale — reload it rather than applying to whatever is now selected. */
watch(() => props.href, (v) => { if (open.value) draft.value = v || ''; });
watch(() => props.openRequest, () => { if (!props.disabled) show(); });
</script>

<template>
  <span class="apex-edlink" :class="ui?.link">
    <button type="button" class="apex-edbar__btn" :data-on="isLink ? 'true' : 'false'"
            :disabled="disabled" :title="isLink ? 'Edit link' : 'Add link'"
            :aria-label="isLink ? 'Edit link' : 'Add link'" :aria-expanded="open"
            @click="open ? hide() : show()">
      <ApexIcon name="link" :size="18" />
    </button>

    <div v-if="open" class="apex-edlink__pop" :class="ui?.linkPopover" @keydown.esc.stop="hide">
      <input ref="field" v-model="draft" class="apex-edlink__input" :class="ui?.linkInput" type="url"
             placeholder="example.com" aria-label="Link address"
             @keydown.enter.prevent="apply" />
      <label class="apex-edlink__check" :class="ui?.linkCheck">
        <input v-model="newTab" type="checkbox" />
        <span>New tab</span>
      </label>
      <div class="apex-edlink__row" :class="ui?.linkRow">
        <button type="button" class="apex-edlink__go" :class="ui?.linkGo" :disabled="!draft.trim()" @click="apply">
          {{ isLink ? 'Update' : 'Add' }}
        </button>
        <button v-if="isLink" type="button" class="apex-edlink__rm" :class="ui?.linkRemove" @click="remove">Remove</button>
        <button type="button" class="apex-edlink__cancel" :class="ui?.linkCancel" @click="cancel">Cancel</button>
      </div>
    </div>
  </span>
</template>
