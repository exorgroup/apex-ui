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
    messages: (ToastMessage & {
        id: number | string;
    })[];
    seq: number;
}
export declare function useApexToast(): {
    state: ToastState;
    /** Queues a toast and returns its id, so it can be updated or removed later. */
    add(message: ToastMessage): number | string;
    /** Replaces a queued toast in place — a loading toast becoming a result. */
    update(id: number | string, patch: ToastMessage): void;
    remove(id: number | string): void;
    /** Clears everything, or just one group. */
    removeAll(group?: string): void;
};
/** Internal handle for ApexToast, which needs the writable queue. */
export declare const __toastState: {
    messages: {
        id: number | string;
        severity?: MessageSeverity | undefined;
        summary?: string | undefined;
        detail?: string | undefined;
        icon?: string | undefined;
        life?: number | undefined;
        sticky?: boolean | undefined;
        closable?: boolean | undefined;
        showTimer?: boolean | undefined;
        group?: string | undefined;
        data?: unknown;
    }[];
    seq: number;
};
export {};
