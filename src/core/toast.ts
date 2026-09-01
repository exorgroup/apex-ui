import { reactive, readonly } from 'vue';
import type { MessageSeverity } from '../components/ApexMessage.vue';

/**
 * Toast service. One <ApexToast> mounted in the app shell serves every add()
 * call, so a caller announces something without owning any visible state.
 *
 * A queue rather than a single current message: toasts stack, and a second add()
 * while one is showing must not replace it (that is the confirm dialog's rule,
 * not this one). Each toast carries its own id so a late remove() can never
 * close the wrong one.
 */
export interface ToastMessage {
  /** Assigned by add(); pass your own to update or remove a specific toast. */
  id?: number | string;
  severity?: MessageSeverity;
  summary?: string;
  detail?: string;
  icon?: string;
  /** Milliseconds before it dismisses itself. Ignored when sticky. */
  life?: number;
  /** Stays until removed — for a loading state or anything needing a decision. */
  sticky?: boolean;
  closable?: boolean;
  /** Show a bar counting the life down. */
  showTimer?: boolean;
  /** Routes a message to a named <ApexToast group="…"> container. */
  group?: string;
  /** Anything your own template needs. */
  data?: unknown;
}

interface ToastState {
  messages: (ToastMessage & { id: number | string })[];
  seq: number;
}

const state = reactive<ToastState>({ messages: [], seq: 0 });

export function useApexToast() {
  return {
    state: readonly(state) as ToastState,
    /** Queues a toast and returns its id, so it can be updated or removed later. */
    add(message: ToastMessage): number | string {
      const id = message.id ?? ++state.seq;
      state.messages.push({ life: 3000, ...message, id });
      return id;
    },
    /** Replaces a queued toast in place — a loading toast becoming a result. */
    update(id: number | string, patch: ToastMessage) {
      const i = state.messages.findIndex((m) => m.id === id);
      if (i > -1) state.messages[i] = { ...state.messages[i], ...patch, id };
    },
    remove(id: number | string) {
      const i = state.messages.findIndex((m) => m.id === id);
      if (i > -1) state.messages.splice(i, 1);
    },
    /** Clears everything, or just one group. */
    removeAll(group?: string) {
      state.messages = group
        ? state.messages.filter((m) => m.group !== group)
        : [];
    },
  };
}

/** Internal handle for ApexToast, which needs the writable queue. */
export const __toastState = state;
