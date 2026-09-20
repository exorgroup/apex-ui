import { type SchedulerTypeMeta, type SchedulerEvent, type SchedulerInstance, type SchedulerMode, type SchedulerResource } from '../core/scheduler';
import type { ApexSchedulerClasses } from '../types';
import { type RecurrenceScope } from '../core/recurrence';
/** An event type in the app's own vocabulary, mapped to a design-system tone. */
export type { SchedulerTypeMeta };
export interface SchedulerGroupField {
    key: string;
    label: string;
    icon?: string;
}
export interface SchedulerSavePayload {
    id?: string;
    resourceId: string;
    type: string;
    title: string;
    start: number;
    end: number;
    rrule: string | null;
}
export interface SchedulerMovePayload {
    id: string;
    resourceId?: string;
    start: number;
    end: number;
    /** Which occurrences the change applies to. `all` for a one-off. */
    scope?: RecurrenceScope;
    occurrenceStart?: number;
    /** The record to persist, and a second one when the scope split the series. */
    update?: Record<string, unknown>;
    create?: Record<string, unknown>;
}
type __VLS_Props = {
    /** Your own class on any part. See ApexSchedulerClasses. */
    ui?: ApexSchedulerClasses;
    resources?: SchedulerResource[];
    events?: SchedulerEvent[];
    mode?: SchedulerMode;
    anchor?: Date;
    /** Which resource fields to nest by, outermost first. */
    groupKeys?: string[];
    /** The fields the grouping bar offers, in master order. Empty hides the bar. */
    groupFields?: SchedulerGroupField[];
    types?: Record<string, SchedulerTypeMeta>;
    /** What one row is called, for the corner and the grouping bar. */
    leafLabel?: string;
    leafIcon?: string;
    /** The row's own label; defaults to the resource's `room`. */
    resourceName?: (r: SchedulerResource) => string;
    /** The line under it — capacity, building, whatever the app knows. */
    resourceSub?: (r: SchedulerResource) => string;
    height?: string;
    resourceWidth?: string;
    draggable?: boolean;
    /** Drag the trailing edge to change a booking's length. */
    resizable?: boolean;
    /**
     * The id given to the new series when a scoped write splits one.
     * "This and following" produces TWO records; the second needs an id.
     */
    newId?: (inst: SchedulerInstance) => string;
    creatable?: boolean;
    /** Render the built-in popover and create/edit dialog. Off: emit and nothing else. */
    inlineEditor?: boolean;
    showToolbar?: boolean;
    showGrouping?: boolean;
    showLegend?: boolean;
    /** Events drawn in a month or year cell before it reads "+N more". */
    chipsPerCell?: number;
    /** Where a continuous view starts scrolled to. */
    scrollToHour?: number;
};
interface Block {
    inst: SchedulerInstance;
    left: number;
    width: number;
    top: number;
    compact: boolean;
    showTime: boolean;
}
interface Cell {
    key: number;
    today: boolean;
    shown: SchedulerInstance[];
    more: number;
}
export interface RowModel {
    key: string;
    kind: 'group' | 'cont' | 'discrete';
    id: string;
    depth: number;
    height: number;
    name: string;
    sub?: string;
    icon: string;
    count?: string;
    open?: boolean;
    resourceId?: string;
    blocks?: Block[];
    cells?: Cell[];
}
declare function chooseScope(scope: RecurrenceScope): void;
declare function cancelScope(): void;
declare function closePop(): void;
declare function step(dir: number): void;
declare function goToday(): void;
declare function expandAll(): void;
declare function collapseAll(): void;
declare function openCreate(resourceId: string, start: number, type?: string): void;
declare var __VLS_32: {
    column: import("../index.js").AxisTier;
    label: string;
    sub: string | undefined;
    today: boolean;
}, __VLS_37: {
    resource: SchedulerResource | undefined;
    row: RowModel;
    name: string;
    sub: string | undefined;
    group: boolean;
    open: boolean | undefined;
}, __VLS_42: {
    event: SchedulerInstance;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: SchedulerMode;
    time: string;
}, __VLS_47: {
    icon: string;
    event: SchedulerInstance;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: SchedulerMode;
    time: string;
}, __VLS_59: {
    event: {
        recurring: boolean;
        instanceId: string;
        originalStart: number;
        overridden: boolean;
        id: string;
        roomId: string;
        type: string;
        title: string;
        start: number;
        end: number;
        rrule?: string | null | undefined;
        exdates?: number[] | undefined;
        overrides?: Record<string, import("../index.js").RecurrenceOverride> | undefined;
    };
    title: string;
    choose: typeof chooseScope;
    cancel: typeof cancelScope;
    options: {
        scope: RecurrenceScope;
        label: string;
    }[];
}, __VLS_61: {
    resource: string;
    close: typeof closePop;
    edit: () => void | null;
    remove: () => void | null;
    event: SchedulerInstance;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: SchedulerMode;
    time: string;
};
type __VLS_Slots = {} & {
    'column-header'?: (props: typeof __VLS_32) => any;
} & {
    resource?: (props: typeof __VLS_37) => any;
} & {
    event?: (props: typeof __VLS_42) => any;
} & {
    chip?: (props: typeof __VLS_47) => any;
} & {
    'scope-prompt'?: (props: typeof __VLS_59) => any;
} & {
    popover?: (props: typeof __VLS_61) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    openCreate: typeof openCreate;
    expandAll: typeof expandAll;
    collapseAll: typeof collapseAll;
    goToday: typeof goToday;
    step: typeof step;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "update:mode": (v: SchedulerMode) => any;
    "update:anchor": (v: Date) => any;
    "update:groupKeys": (v: string[]) => any;
    "event-move": (payload: SchedulerMovePayload) => any;
    "event-resize": (payload: SchedulerMovePayload) => any;
    "event-click": (payload: {
        instance: SchedulerInstance;
        originalEvent: PointerEvent | MouseEvent;
    }) => any;
    "event-save": (payload: SchedulerSavePayload) => any;
    "event-delete": (payload: {
        id: string;
    }) => any;
    "create-request": (payload: {
        resourceId: string;
        start: number;
        type: string;
    }) => any;
    "range-change": (payload: {
        from: number;
        to: number;
        mode: SchedulerMode;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:mode"?: ((v: SchedulerMode) => any) | undefined;
    "onUpdate:anchor"?: ((v: Date) => any) | undefined;
    "onUpdate:groupKeys"?: ((v: string[]) => any) | undefined;
    "onEvent-move"?: ((payload: SchedulerMovePayload) => any) | undefined;
    "onEvent-resize"?: ((payload: SchedulerMovePayload) => any) | undefined;
    "onEvent-click"?: ((payload: {
        instance: SchedulerInstance;
        originalEvent: PointerEvent | MouseEvent;
    }) => any) | undefined;
    "onEvent-save"?: ((payload: SchedulerSavePayload) => any) | undefined;
    "onEvent-delete"?: ((payload: {
        id: string;
    }) => any) | undefined;
    "onCreate-request"?: ((payload: {
        resourceId: string;
        start: number;
        type: string;
    }) => any) | undefined;
    "onRange-change"?: ((payload: {
        from: number;
        to: number;
        mode: SchedulerMode;
    }) => any) | undefined;
}>, {
    anchor: Date;
    draggable: boolean;
    height: string;
    mode: SchedulerMode;
    resizable: boolean;
    events: SchedulerEvent[];
    resources: SchedulerResource[];
    groupKeys: string[];
    groupFields: SchedulerGroupField[];
    types: Record<string, SchedulerTypeMeta>;
    leafLabel: string;
    leafIcon: string;
    resourceWidth: string;
    creatable: boolean;
    inlineEditor: boolean;
    showToolbar: boolean;
    showGrouping: boolean;
    showLegend: boolean;
    chipsPerCell: number;
    scrollToHour: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
