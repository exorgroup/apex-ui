import type { Component } from 'vue';
import type { DialogPosition } from '../components/ApexDialog.vue';
/**
 * Dialog service. One <ApexDynamicDialog> mounted anywhere in the tree renders
 * every dialog opened with `open()`, so a component can be shown in a dialog
 * without the caller keeping visible state or importing a dialog anywhere.
 *
 * Unlike the confirm service this holds a STACK: opening a second dialog over
 * the first is normal (a picker over a form), so each instance keeps its own
 * options and z-index and closes independently.
 */
export interface DynamicDialogOptions {
    /** ApexDialog props — header, width, position, modal, draggable and the rest. */
    props?: Record<string, unknown>;
    /** Props passed to the loaded component itself. */
    contentProps?: Record<string, unknown>;
    /** Read by the loaded component through its injected dialogRef. */
    data?: unknown;
    /** Handlers for events the loaded component emits. */
    emits?: Record<string, (...args: unknown[]) => void>;
    /** Components rendered into the dialog's header and footer slots. */
    templates?: {
        header?: Component;
        footer?: Component;
    };
    /** Receives whatever the component passed to dialogRef.close(). */
    onClose?: (result: {
        data?: unknown;
    }) => void;
}
export interface DynamicDialogInstance {
    id: number;
    component: Component;
    options: DynamicDialogOptions;
    visible: boolean;
    /** Result held from close() until the leave transition ends. */
    result?: {
        data?: unknown;
    };
}
export interface DynamicDialogHandle {
    id: number;
    /** Closes from the caller's side; the data reaches onClose. */
    close: (data?: unknown) => void;
}
interface DialogState {
    instances: DynamicDialogInstance[];
    seq: number;
}
/** Each dialog sits above the one it was opened from. */
export declare const DIALOG_BASE_Z = 1000;
export declare const dialogZ: (index: number) => number;
declare function hide(id: number, data?: unknown): void;
/** Called once the leave transition ends, so onClose fires after the animation. */
declare function destroy(id: number): void;
export declare function useApexDialog(): {
    state: DialogState;
    /** Opens `component` in a dialog and returns a handle that can close it. */
    open(component: Component, options?: DynamicDialogOptions): DynamicDialogHandle;
    close(id: number, data?: unknown): void;
    /** Closes every open dialog, e.g. on a route change. */
    closeAll(): void;
};
/** Internal handles for ApexDynamicDialog, which needs the writable state. */
export declare const __dialogState: {
    instances: {
        id: number;
        component: import("vue").FunctionalComponent<any, {}, any, {}> | {
            new (...args: any[]): any;
            __isFragment?: never;
            __isTeleport?: never;
            __isSuspense?: never;
        } | {
            [x: string]: any;
            setup?: ((this: void, props: import("@vue/shared").LooseRequired<any>, ctx: {
                attrs: import("vue").Attrs;
                slots: Readonly<{
                    [name: string]: import("vue").Slot<any> | undefined;
                }>;
                emit: ((event: unknown, ...args: any[]) => void) | ((event: string, ...args: any[]) => void);
                expose: <Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed) => void;
            }) => any) | undefined;
            name?: string | undefined;
            template?: string | object | undefined;
            render?: Function | undefined;
            components?: Record<string, Component<any, any, any, import("vue").ComputedOptions, import("vue").MethodOptions, {}, any>> | undefined;
            directives?: Record<string, import("vue").Directive<any, any, string, any>> | undefined;
            inheritAttrs?: boolean | undefined;
            emits?: any;
            slots?: {} | undefined;
            expose?: string[] | undefined;
            serverPrefetch?: (() => void | Promise<any>) | undefined;
            compilerOptions?: {
                isCustomElement?: ((tag: string) => boolean) | undefined;
                whitespace?: "preserve" | "condense" | undefined;
                comments?: boolean | undefined;
                delimiters?: [string, string] | undefined;
            } | undefined;
            call?: ((this: unknown, ...args: unknown[]) => never) | undefined;
            __isFragment?: never | undefined;
            __isTeleport?: never | undefined;
            __isSuspense?: never | undefined;
            __defaults?: {} | undefined;
            compatConfig?: {
                GLOBAL_MOUNT?: boolean | "suppress-warning" | undefined;
                GLOBAL_MOUNT_CONTAINER?: boolean | "suppress-warning" | undefined;
                GLOBAL_EXTEND?: boolean | "suppress-warning" | undefined;
                GLOBAL_PROTOTYPE?: boolean | "suppress-warning" | undefined;
                GLOBAL_SET?: boolean | "suppress-warning" | undefined;
                GLOBAL_DELETE?: boolean | "suppress-warning" | undefined;
                GLOBAL_OBSERVABLE?: boolean | "suppress-warning" | undefined;
                GLOBAL_PRIVATE_UTIL?: boolean | "suppress-warning" | undefined;
                CONFIG_SILENT?: boolean | "suppress-warning" | undefined;
                CONFIG_DEVTOOLS?: boolean | "suppress-warning" | undefined;
                CONFIG_KEY_CODES?: boolean | "suppress-warning" | undefined;
                CONFIG_PRODUCTION_TIP?: boolean | "suppress-warning" | undefined;
                CONFIG_IGNORED_ELEMENTS?: boolean | "suppress-warning" | undefined;
                CONFIG_WHITESPACE?: boolean | "suppress-warning" | undefined;
                CONFIG_OPTION_MERGE_STRATS?: boolean | "suppress-warning" | undefined;
                INSTANCE_SET?: boolean | "suppress-warning" | undefined;
                INSTANCE_DELETE?: boolean | "suppress-warning" | undefined;
                INSTANCE_DESTROY?: boolean | "suppress-warning" | undefined;
                INSTANCE_EVENT_EMITTER?: boolean | "suppress-warning" | undefined;
                INSTANCE_EVENT_HOOKS?: boolean | "suppress-warning" | undefined;
                INSTANCE_CHILDREN?: boolean | "suppress-warning" | undefined;
                INSTANCE_LISTENERS?: boolean | "suppress-warning" | undefined;
                INSTANCE_SCOPED_SLOTS?: boolean | "suppress-warning" | undefined;
                INSTANCE_ATTRS_CLASS_STYLE?: boolean | "suppress-warning" | undefined;
                OPTIONS_DATA_FN?: boolean | "suppress-warning" | undefined;
                OPTIONS_DATA_MERGE?: boolean | "suppress-warning" | undefined;
                OPTIONS_BEFORE_DESTROY?: boolean | "suppress-warning" | undefined;
                OPTIONS_DESTROYED?: boolean | "suppress-warning" | undefined;
                WATCH_ARRAY?: boolean | "suppress-warning" | undefined;
                PROPS_DEFAULT_THIS?: boolean | "suppress-warning" | undefined;
                V_ON_KEYCODE_MODIFIER?: boolean | "suppress-warning" | undefined;
                CUSTOM_DIR?: boolean | "suppress-warning" | undefined;
                ATTR_FALSE_VALUE?: boolean | "suppress-warning" | undefined;
                ATTR_ENUMERATED_COERCION?: boolean | "suppress-warning" | undefined;
                TRANSITION_CLASSES?: boolean | "suppress-warning" | undefined;
                TRANSITION_GROUP_ROOT?: boolean | "suppress-warning" | undefined;
                COMPONENT_ASYNC?: boolean | "suppress-warning" | undefined;
                COMPONENT_FUNCTIONAL?: boolean | "suppress-warning" | undefined;
                COMPONENT_V_MODEL?: boolean | "suppress-warning" | undefined;
                RENDER_FUNCTION?: boolean | "suppress-warning" | undefined;
                FILTERS?: boolean | "suppress-warning" | undefined;
                PRIVATE_APIS?: boolean | "suppress-warning" | undefined;
                MODE?: 2 | 3 | ((comp: Component | null) => 2 | 3) | undefined;
            } | undefined;
            data?: ((this: any, vm: any) => any) | undefined;
            computed?: import("vue").ComputedOptions | undefined;
            methods?: import("vue").MethodOptions | undefined;
            watch?: {
                [x: string]: (string | import("vue").WatchCallback | ({
                    handler: import("vue").WatchCallback | string;
                } & import("vue").WatchOptions<boolean>)) | (string | import("vue").WatchCallback | ({
                    handler: import("vue").WatchCallback | string;
                } & import("vue").WatchOptions<boolean>))[];
            } | undefined;
            provide?: import("vue").ComponentProvideOptions | undefined;
            inject?: {} | string[] | undefined;
            filters?: Record<string, Function> | undefined;
            mixins?: any[] | undefined;
            extends?: any;
            beforeCreate?: (() => any) | undefined;
            created?: (() => any) | undefined;
            beforeMount?: (() => any) | undefined;
            mounted?: (() => any) | undefined;
            beforeUpdate?: (() => any) | undefined;
            updated?: (() => any) | undefined;
            activated?: (() => any) | undefined;
            deactivated?: (() => any) | undefined;
            beforeDestroy?: (() => any) | undefined;
            beforeUnmount?: (() => any) | undefined;
            destroyed?: (() => any) | undefined;
            unmounted?: (() => any) | undefined;
            renderTracked?: ((e: import("vue").DebuggerEvent) => void) | undefined;
            renderTriggered?: ((e: import("vue").DebuggerEvent) => void) | undefined;
            errorCaptured?: ((err: unknown, instance: import("vue").ComponentPublicInstance | null, info: string) => boolean | void) | undefined;
            delimiters?: [string, string] | undefined;
            __differentiator?: string | number | symbol | undefined;
            __isBuiltIn?: boolean | undefined;
            __file?: string | undefined;
            __name?: string | undefined;
        };
        options: {
            props?: Record<string, unknown> | undefined;
            contentProps?: Record<string, unknown> | undefined;
            data?: unknown;
            emits?: Record<string, (...args: unknown[]) => void> | undefined;
            templates?: {
                header?: import("vue").FunctionalComponent<any, {}, any, {}> | {
                    new (...args: any[]): any;
                    __isFragment?: never;
                    __isTeleport?: never;
                    __isSuspense?: never;
                } | {
                    [x: string]: any;
                    setup?: ((this: void, props: import("@vue/shared").LooseRequired<any>, ctx: {
                        attrs: import("vue").Attrs;
                        slots: Readonly<{
                            [name: string]: import("vue").Slot<any> | undefined;
                        }>;
                        emit: ((event: unknown, ...args: any[]) => void) | ((event: string, ...args: any[]) => void);
                        expose: <Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed) => void;
                    }) => any) | undefined;
                    name?: string | undefined;
                    template?: string | object | undefined;
                    render?: Function | undefined;
                    components?: Record<string, Component<any, any, any, import("vue").ComputedOptions, import("vue").MethodOptions, {}, any>> | undefined;
                    directives?: Record<string, import("vue").Directive<any, any, string, any>> | undefined;
                    inheritAttrs?: boolean | undefined;
                    emits?: any;
                    slots?: {} | undefined;
                    expose?: string[] | undefined;
                    serverPrefetch?: (() => void | Promise<any>) | undefined;
                    compilerOptions?: {
                        isCustomElement?: ((tag: string) => boolean) | undefined;
                        whitespace?: "preserve" | "condense" | undefined;
                        comments?: boolean | undefined;
                        delimiters?: [string, string] | undefined;
                    } | undefined;
                    call?: ((this: unknown, ...args: unknown[]) => never) | undefined;
                    __isFragment?: never | undefined;
                    __isTeleport?: never | undefined;
                    __isSuspense?: never | undefined;
                    __defaults?: {} | undefined;
                    compatConfig?: {
                        GLOBAL_MOUNT?: boolean | "suppress-warning" | undefined;
                        GLOBAL_MOUNT_CONTAINER?: boolean | "suppress-warning" | undefined;
                        GLOBAL_EXTEND?: boolean | "suppress-warning" | undefined;
                        GLOBAL_PROTOTYPE?: boolean | "suppress-warning" | undefined;
                        GLOBAL_SET?: boolean | "suppress-warning" | undefined;
                        GLOBAL_DELETE?: boolean | "suppress-warning" | undefined;
                        GLOBAL_OBSERVABLE?: boolean | "suppress-warning" | undefined;
                        GLOBAL_PRIVATE_UTIL?: boolean | "suppress-warning" | undefined;
                        CONFIG_SILENT?: boolean | "suppress-warning" | undefined;
                        CONFIG_DEVTOOLS?: boolean | "suppress-warning" | undefined;
                        CONFIG_KEY_CODES?: boolean | "suppress-warning" | undefined;
                        CONFIG_PRODUCTION_TIP?: boolean | "suppress-warning" | undefined;
                        CONFIG_IGNORED_ELEMENTS?: boolean | "suppress-warning" | undefined;
                        CONFIG_WHITESPACE?: boolean | "suppress-warning" | undefined;
                        CONFIG_OPTION_MERGE_STRATS?: boolean | "suppress-warning" | undefined;
                        INSTANCE_SET?: boolean | "suppress-warning" | undefined;
                        INSTANCE_DELETE?: boolean | "suppress-warning" | undefined;
                        INSTANCE_DESTROY?: boolean | "suppress-warning" | undefined;
                        INSTANCE_EVENT_EMITTER?: boolean | "suppress-warning" | undefined;
                        INSTANCE_EVENT_HOOKS?: boolean | "suppress-warning" | undefined;
                        INSTANCE_CHILDREN?: boolean | "suppress-warning" | undefined;
                        INSTANCE_LISTENERS?: boolean | "suppress-warning" | undefined;
                        INSTANCE_SCOPED_SLOTS?: boolean | "suppress-warning" | undefined;
                        INSTANCE_ATTRS_CLASS_STYLE?: boolean | "suppress-warning" | undefined;
                        OPTIONS_DATA_FN?: boolean | "suppress-warning" | undefined;
                        OPTIONS_DATA_MERGE?: boolean | "suppress-warning" | undefined;
                        OPTIONS_BEFORE_DESTROY?: boolean | "suppress-warning" | undefined;
                        OPTIONS_DESTROYED?: boolean | "suppress-warning" | undefined;
                        WATCH_ARRAY?: boolean | "suppress-warning" | undefined;
                        PROPS_DEFAULT_THIS?: boolean | "suppress-warning" | undefined;
                        V_ON_KEYCODE_MODIFIER?: boolean | "suppress-warning" | undefined;
                        CUSTOM_DIR?: boolean | "suppress-warning" | undefined;
                        ATTR_FALSE_VALUE?: boolean | "suppress-warning" | undefined;
                        ATTR_ENUMERATED_COERCION?: boolean | "suppress-warning" | undefined;
                        TRANSITION_CLASSES?: boolean | "suppress-warning" | undefined;
                        TRANSITION_GROUP_ROOT?: boolean | "suppress-warning" | undefined;
                        COMPONENT_ASYNC?: boolean | "suppress-warning" | undefined;
                        COMPONENT_FUNCTIONAL?: boolean | "suppress-warning" | undefined;
                        COMPONENT_V_MODEL?: boolean | "suppress-warning" | undefined;
                        RENDER_FUNCTION?: boolean | "suppress-warning" | undefined;
                        FILTERS?: boolean | "suppress-warning" | undefined;
                        PRIVATE_APIS?: boolean | "suppress-warning" | undefined;
                        MODE?: 2 | 3 | ((comp: Component | null) => 2 | 3) | undefined;
                    } | undefined;
                    data?: ((this: any, vm: any) => any) | undefined;
                    computed?: import("vue").ComputedOptions | undefined;
                    methods?: import("vue").MethodOptions | undefined;
                    watch?: {
                        [x: string]: (string | import("vue").WatchCallback | ({
                            handler: import("vue").WatchCallback | string;
                        } & import("vue").WatchOptions<boolean>)) | (string | import("vue").WatchCallback | ({
                            handler: import("vue").WatchCallback | string;
                        } & import("vue").WatchOptions<boolean>))[];
                    } | undefined;
                    provide?: import("vue").ComponentProvideOptions | undefined;
                    inject?: {} | string[] | undefined;
                    filters?: Record<string, Function> | undefined;
                    mixins?: any[] | undefined;
                    extends?: any;
                    beforeCreate?: (() => any) | undefined;
                    created?: (() => any) | undefined;
                    beforeMount?: (() => any) | undefined;
                    mounted?: (() => any) | undefined;
                    beforeUpdate?: (() => any) | undefined;
                    updated?: (() => any) | undefined;
                    activated?: (() => any) | undefined;
                    deactivated?: (() => any) | undefined;
                    beforeDestroy?: (() => any) | undefined;
                    beforeUnmount?: (() => any) | undefined;
                    destroyed?: (() => any) | undefined;
                    unmounted?: (() => any) | undefined;
                    renderTracked?: ((e: import("vue").DebuggerEvent) => void) | undefined;
                    renderTriggered?: ((e: import("vue").DebuggerEvent) => void) | undefined;
                    errorCaptured?: ((err: unknown, instance: import("vue").ComponentPublicInstance | null, info: string) => boolean | void) | undefined;
                    delimiters?: [string, string] | undefined;
                    __differentiator?: string | number | symbol | undefined;
                    __isBuiltIn?: boolean | undefined;
                    __file?: string | undefined;
                    __name?: string | undefined;
                } | undefined;
                footer?: import("vue").FunctionalComponent<any, {}, any, {}> | {
                    new (...args: any[]): any;
                    __isFragment?: never;
                    __isTeleport?: never;
                    __isSuspense?: never;
                } | {
                    [x: string]: any;
                    setup?: ((this: void, props: import("@vue/shared").LooseRequired<any>, ctx: {
                        attrs: import("vue").Attrs;
                        slots: Readonly<{
                            [name: string]: import("vue").Slot<any> | undefined;
                        }>;
                        emit: ((event: unknown, ...args: any[]) => void) | ((event: string, ...args: any[]) => void);
                        expose: <Exposed extends Record<string, any> = Record<string, any>>(exposed?: Exposed) => void;
                    }) => any) | undefined;
                    name?: string | undefined;
                    template?: string | object | undefined;
                    render?: Function | undefined;
                    components?: Record<string, Component<any, any, any, import("vue").ComputedOptions, import("vue").MethodOptions, {}, any>> | undefined;
                    directives?: Record<string, import("vue").Directive<any, any, string, any>> | undefined;
                    inheritAttrs?: boolean | undefined;
                    emits?: any;
                    slots?: {} | undefined;
                    expose?: string[] | undefined;
                    serverPrefetch?: (() => void | Promise<any>) | undefined;
                    compilerOptions?: {
                        isCustomElement?: ((tag: string) => boolean) | undefined;
                        whitespace?: "preserve" | "condense" | undefined;
                        comments?: boolean | undefined;
                        delimiters?: [string, string] | undefined;
                    } | undefined;
                    call?: ((this: unknown, ...args: unknown[]) => never) | undefined;
                    __isFragment?: never | undefined;
                    __isTeleport?: never | undefined;
                    __isSuspense?: never | undefined;
                    __defaults?: {} | undefined;
                    compatConfig?: {
                        GLOBAL_MOUNT?: boolean | "suppress-warning" | undefined;
                        GLOBAL_MOUNT_CONTAINER?: boolean | "suppress-warning" | undefined;
                        GLOBAL_EXTEND?: boolean | "suppress-warning" | undefined;
                        GLOBAL_PROTOTYPE?: boolean | "suppress-warning" | undefined;
                        GLOBAL_SET?: boolean | "suppress-warning" | undefined;
                        GLOBAL_DELETE?: boolean | "suppress-warning" | undefined;
                        GLOBAL_OBSERVABLE?: boolean | "suppress-warning" | undefined;
                        GLOBAL_PRIVATE_UTIL?: boolean | "suppress-warning" | undefined;
                        CONFIG_SILENT?: boolean | "suppress-warning" | undefined;
                        CONFIG_DEVTOOLS?: boolean | "suppress-warning" | undefined;
                        CONFIG_KEY_CODES?: boolean | "suppress-warning" | undefined;
                        CONFIG_PRODUCTION_TIP?: boolean | "suppress-warning" | undefined;
                        CONFIG_IGNORED_ELEMENTS?: boolean | "suppress-warning" | undefined;
                        CONFIG_WHITESPACE?: boolean | "suppress-warning" | undefined;
                        CONFIG_OPTION_MERGE_STRATS?: boolean | "suppress-warning" | undefined;
                        INSTANCE_SET?: boolean | "suppress-warning" | undefined;
                        INSTANCE_DELETE?: boolean | "suppress-warning" | undefined;
                        INSTANCE_DESTROY?: boolean | "suppress-warning" | undefined;
                        INSTANCE_EVENT_EMITTER?: boolean | "suppress-warning" | undefined;
                        INSTANCE_EVENT_HOOKS?: boolean | "suppress-warning" | undefined;
                        INSTANCE_CHILDREN?: boolean | "suppress-warning" | undefined;
                        INSTANCE_LISTENERS?: boolean | "suppress-warning" | undefined;
                        INSTANCE_SCOPED_SLOTS?: boolean | "suppress-warning" | undefined;
                        INSTANCE_ATTRS_CLASS_STYLE?: boolean | "suppress-warning" | undefined;
                        OPTIONS_DATA_FN?: boolean | "suppress-warning" | undefined;
                        OPTIONS_DATA_MERGE?: boolean | "suppress-warning" | undefined;
                        OPTIONS_BEFORE_DESTROY?: boolean | "suppress-warning" | undefined;
                        OPTIONS_DESTROYED?: boolean | "suppress-warning" | undefined;
                        WATCH_ARRAY?: boolean | "suppress-warning" | undefined;
                        PROPS_DEFAULT_THIS?: boolean | "suppress-warning" | undefined;
                        V_ON_KEYCODE_MODIFIER?: boolean | "suppress-warning" | undefined;
                        CUSTOM_DIR?: boolean | "suppress-warning" | undefined;
                        ATTR_FALSE_VALUE?: boolean | "suppress-warning" | undefined;
                        ATTR_ENUMERATED_COERCION?: boolean | "suppress-warning" | undefined;
                        TRANSITION_CLASSES?: boolean | "suppress-warning" | undefined;
                        TRANSITION_GROUP_ROOT?: boolean | "suppress-warning" | undefined;
                        COMPONENT_ASYNC?: boolean | "suppress-warning" | undefined;
                        COMPONENT_FUNCTIONAL?: boolean | "suppress-warning" | undefined;
                        COMPONENT_V_MODEL?: boolean | "suppress-warning" | undefined;
                        RENDER_FUNCTION?: boolean | "suppress-warning" | undefined;
                        FILTERS?: boolean | "suppress-warning" | undefined;
                        PRIVATE_APIS?: boolean | "suppress-warning" | undefined;
                        MODE?: 2 | 3 | ((comp: Component | null) => 2 | 3) | undefined;
                    } | undefined;
                    data?: ((this: any, vm: any) => any) | undefined;
                    computed?: import("vue").ComputedOptions | undefined;
                    methods?: import("vue").MethodOptions | undefined;
                    watch?: {
                        [x: string]: (string | import("vue").WatchCallback | ({
                            handler: import("vue").WatchCallback | string;
                        } & import("vue").WatchOptions<boolean>)) | (string | import("vue").WatchCallback | ({
                            handler: import("vue").WatchCallback | string;
                        } & import("vue").WatchOptions<boolean>))[];
                    } | undefined;
                    provide?: import("vue").ComponentProvideOptions | undefined;
                    inject?: {} | string[] | undefined;
                    filters?: Record<string, Function> | undefined;
                    mixins?: any[] | undefined;
                    extends?: any;
                    beforeCreate?: (() => any) | undefined;
                    created?: (() => any) | undefined;
                    beforeMount?: (() => any) | undefined;
                    mounted?: (() => any) | undefined;
                    beforeUpdate?: (() => any) | undefined;
                    updated?: (() => any) | undefined;
                    activated?: (() => any) | undefined;
                    deactivated?: (() => any) | undefined;
                    beforeDestroy?: (() => any) | undefined;
                    beforeUnmount?: (() => any) | undefined;
                    destroyed?: (() => any) | undefined;
                    unmounted?: (() => any) | undefined;
                    renderTracked?: ((e: import("vue").DebuggerEvent) => void) | undefined;
                    renderTriggered?: ((e: import("vue").DebuggerEvent) => void) | undefined;
                    errorCaptured?: ((err: unknown, instance: import("vue").ComponentPublicInstance | null, info: string) => boolean | void) | undefined;
                    delimiters?: [string, string] | undefined;
                    __differentiator?: string | number | symbol | undefined;
                    __isBuiltIn?: boolean | undefined;
                    __file?: string | undefined;
                    __name?: string | undefined;
                } | undefined;
            } | undefined;
            onClose?: ((result: {
                data?: unknown;
            }) => void) | undefined;
        };
        visible: boolean;
        result?: {
            data?: unknown;
        } | undefined;
    }[];
    seq: number;
};
export declare const __dialogHide: typeof hide;
export declare const __dialogDestroy: typeof destroy;
export type { DialogPosition };
