import type { ApexOverlayTransition } from '../types';
import { type FormField, type FormSchema } from '../core/form';
import type { ApexFormClasses } from '../types';
type __VLS_Props = ApexOverlayTransition & {
    schema: FormSchema;
    /**
     * Modal visibility. Bind it (v-model:open) and the HOST owns dismissal — it
     * may want to hold the panel up while a save fails. Leave it unbound and
     * ApexForm owns it, because nobody else can close it.
     *
     * Named `open` rather than `visible`: `visible(field)` already means field
     * visibility here, and one word with two meanings in one component is a
     * defect waiting to happen.
     */
    open?: boolean | null;
    /** The footer with Cancel/Save. Off for an embedded form whose host owns saving. */
    actions?: boolean;
    /** Initial values, when no host form is supplied. */
    modelValue?: Record<string, unknown>;
    /**
     * An Inertia or Precognition form. Given one, IT holds the values and
     * ApexForm reads and writes through it; given nothing, ApexForm keeps its
     * own. Never both.
     */
    form?: Record<string, unknown> | null;
    /** Overrides the schema's own choice, for a host that offers a switcher. */
    layout?: string;
    shell?: string;
    /** Values are shown as text and no control is rendered. */
    readonly?: boolean;
    /** Ripple Save and Cancel. Defaults to the plugin's `ripple` option. */
    ripple?: boolean;
    /** Validate a field as soon as it changes, rather than only once touched. */
    eager?: boolean;
    /** Class map — §4.3. Every part of the shell takes one key. */
    ui?: ApexFormClasses;
};
/**
 * Forget what the last editing session decided.
 *
 * `localErrors`, `submitted`, `touched` and `dirty` describe **this** visit:
 * what the user typed, what they were told, and whether they have pressed
 * Save. Opening the dialog again, or pointing it at a different record, is a
 * new visit, and carrying any of it across is asserting something untrue.
 *
 * The defect this closes (AF2-306, found on the first migrated screen): a
 * modal's PANEL unmounts when it closes — `v-if="!isModal || isOpen()"` —
 * but the COMPONENT does not, so every one of these refs survived. Reopening
 * showed the previous session's messages against the new record's values,
 * and a freshly opened Add dialog said "Unsaved changes". The host could not
 * help: nothing was exposed to clear it.
 */
declare function reset(): void;
declare function focusField(key?: string): void;
/** Uncontrolled falls back to the component's own flag. */
declare function isOpen(): boolean;
declare function cancel(): void;
declare function submit(): void;
declare var __VLS_12: {}, __VLS_47: string, __VLS_48: {
    field: FormField;
    value: unknown;
    error: string[];
    update: (v: unknown) => void;
    blur: () => void;
}, __VLS_64: {
    submit: typeof submit;
    cancel: typeof cancel;
    processing: boolean;
};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_47>]?: (props: typeof __VLS_48) => any;
} & {
    'head-end'?: (props: typeof __VLS_12) => any;
} & {
    actions?: (props: typeof __VLS_64) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    submit: typeof submit;
    cancel: typeof cancel;
    focusField: typeof focusField;
    isOpen: typeof isOpen;
    reset: typeof reset;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    cancel: () => any;
    change: (v: unknown) => any;
    submit: (v: unknown) => any;
    "update:modelValue": (v: Record<string, unknown>) => any;
    "update:open": (v: boolean) => any;
    "field-change": (payload: {
        key?: string;
        value: unknown;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onCancel?: (() => any) | undefined;
    onChange?: ((v: unknown) => any) | undefined;
    onSubmit?: ((v: unknown) => any) | undefined;
    "onUpdate:modelValue"?: ((v: Record<string, unknown>) => any) | undefined;
    "onUpdate:open"?: ((v: boolean) => any) | undefined;
    "onField-change"?: ((payload: {
        key?: string;
        value: unknown;
    }) => any) | undefined;
}>, {
    form: Record<string, unknown> | null;
    readonly: boolean;
    modelValue: Record<string, unknown>;
    open: boolean | null;
    actions: boolean;
    ripple: boolean;
    eager: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
