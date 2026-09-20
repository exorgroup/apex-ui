import type { ApexEditorClasses } from '../types';
export interface ImageAttrs {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
}
type __VLS_Props = {
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
};
declare function show(): void;
declare function hide(): void;
declare function cancel(): void;
declare function onWidth(): void;
declare function onHeight(): void;
declare function save(): void;
declare var __VLS_8: {
    draft: {
        src: string;
        alt: string;
        width: string;
        height: string;
    };
    editing: boolean;
}, __VLS_13: {
    draft: {
        src: string;
        alt: string;
        width: string;
        height: string;
    };
    editing: boolean;
    save: typeof save;
    cancel: typeof cancel;
    canSave: boolean;
};
type __VLS_Slots = {} & {
    fields?: (props: typeof __VLS_8) => any;
} & {
    footer?: (props: typeof __VLS_13) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    show: typeof show;
    hide: typeof hide;
    save: typeof save;
    cancel: typeof cancel;
    draft: import("vue").Ref<{
        src: string;
        alt: string;
        width: string;
        height: string;
    }, {
        src: string;
        alt: string;
        width: string;
        height: string;
    } | {
        src: string;
        alt: string;
        width: string;
        height: string;
    }>;
    decorative: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string, string>;
    onWidth: typeof onWidth;
    onHeight: typeof onHeight;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    apply: (attrs: Record<string, string>) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onApply?: ((attrs: Record<string, string>) => any) | undefined;
}>, {
    attrs: ImageAttrs | null;
    upload: ((file: File) => string | Promise<string>) | null;
    openRequest: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
