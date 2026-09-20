import { type CalendarConstraint, type CalendarEvent, type ConstraintCandidate, type DayCell, type ResolvedEvent } from '../core/calendar';
import { type ApexLocalePack } from '../core/locale';
import { type RecurrenceOverride, type RecurrenceScope } from '../core/recurrence';
import type { ApexCalendarClasses } from '../types';
export interface CalendarTypeMeta {
    label?: string;
    tone?: 'info' | 'success' | 'warn' | 'danger' | 'help' | 'neutral';
}
export type CalendarView = 'month' | 'week' | 'day' | 'list' | 'year';
export type YearLayout = 'grid' | 'stack' | 'continuous';
export interface CalendarResource {
    id: string;
    title?: string;
    [key: string]: unknown;
}
type __VLS_Props = {
    /** Your own class on any part. See ApexCalendarClasses. */
    ui?: ApexCalendarClasses;
    view?: CalendarView;
    /** Which views the switcher offers. One view hides it. */
    views?: CalendarView[];
    events?: CalendarEvent[];
    /**
     * Resources as COLUMNS, for the day view.
     *
     * The transpose of ApexScheduler, which puts resources down the side and time
     * across. Only the day view uses them: a week of seven days times N resources
     * is a nested header the grid does not draw, and pretending otherwise would
     * show one resource's bookings under another's column.
     */
    resources?: CalendarResource[];
    /** Tinted regions. Kept separate from `events`: a background event is a
        RENDERING, a constraint is a rule, and an app often wants one without the
        other. */
    backgroundEvents?: CalendarEvent[];
    /** The month shown. Works controlled (bind it) or uncontrolled (pass one). */
    anchor?: Date | number;
    /** An IANA zone. Omitted: the browser's. */
    timeZone?: string;
    /** A locale-pack code, a pack, or an inline override. */
    locale?: string | Partial<ApexLocalePack>;
    /** Overrides the locale's own first day. 0 = Sunday. */
    firstDay?: number;
    /** The app's event types, each mapped to a design-system tone. */
    types?: Record<string, CalendarTypeMeta>;
    /**
     * How an event is PAINTED, not how it is structured.
     *
     * `soft` is a tone-tinted wash with a coloured inline-start edge and dark text;
     * `outline` is a bordered card with an accent rule. Both render the same two
     * lines as `solid`, so the common case of "we want the softer look" needs no
     * template — and therefore does not re-implement the compact rule, the
     * recurring icon, the clipped dashes or the invalid stripes.
     */
    eventVariant?: 'solid' | 'soft' | 'outline';
    /** Lanes drawn before a cell reads "+N more". */
    maxEventsPerDay?: number;
    /** Always six rows, so the grid does not resize as months change. */
    fixedWeeks?: boolean;
    showWeekNumbers?: boolean;
    /** The zone's short offset in the axis corner — "GMT+2". */
    showZoneLabel?: boolean;
    showToolbar?: boolean;
    /** Minutes per slot on the time grid. */
    slotDuration?: number;
    /** Minutes from midnight the grid starts and ends at. */
    slotMinTime?: number;
    slotMaxTime?: number;
    /** Pixels per slot — the axis is a fixed height, not a fraction of the box. */
    slotHeight?: number;
    /** Minutes from midnight the grid scrolls to on open. */
    scrollToTime?: number;
    /** Lanes in the all-day strip before it reports "+N more". */
    maxAllDay?: number;
    /** Days the agenda covers, and the step its nav takes. */
    listDays?: number;
    /**
     * How the twelve months are arranged: wrapped into a grid, one per row, or a
     * single continuous run of weeks.
     */
    yearLayout?: YearLayout;
    /** Drag an event to move it, and click empty space to create one. */
    editable?: boolean;
    /**
     * Render the built-in create/edit dialog. Off, the same gestures report and
     * draw nothing — for a host whose booking form already exists, and whose
     * validation and pricing belong to it rather than to a component.
     */
    inlineEditor?: boolean;
    /** Durations the editor offers, in minutes. */
    durations?: number[];
    /** Drag its trailing edge to change its length. Off with `editable` off. */
    resizable?: boolean;
    /**
     * The id given to the new series when a scoped write splits one.
     * "This and following" produces TWO records; the second needs an id, and only
     * the app knows what its ids look like.
     */
    newId?: (event: ResolvedEvent) => string;
    height?: string;
    /** Row height floor; rows grow past it when a week is busy. */
    rowHeight?: string;
    /**
     * Declarative rules a move or resize must satisfy. Checked before `validate`
     * because they are the cheap half and answer most refusals.
     *
     * Neither this nor `validate` was declared in the source — `constraints` had
     * a default in `withDefaults` for a prop that did not exist, and `validate`
     * was called and never mentioned. Declared at AF2-268.
     */
    constraints?: CalendarConstraint[];
    /**
     * The host's own last word on a candidate. Return `true`/`null` to allow, a
     * string to refuse with a reason, `false` to refuse without one.
     */
    validate?: (cand: ConstraintCandidate) => boolean | string | null | void;
};
export interface EditPayload {
    event: ResolvedEvent;
    start: number;
    end: number;
    scope: RecurrenceScope;
    occurrenceStart: number;
    update: Record<string, unknown>;
    create?: Record<string, unknown>;
}
export interface SavePayload {
    id?: string;
    /** Present for a NEW event: the record to insert. */
    record?: Record<string, unknown>;
    scope: RecurrenceScope;
    occurrenceStart?: number;
    update?: Record<string, unknown>;
    create?: Record<string, unknown>;
}
export interface DeletePayload {
    id: string;
    scope: RecurrenceScope;
    occurrenceStart?: number;
    /** Either the record to persist (an EXDATE or a closed series) … */
    update?: Record<string, unknown>;
    /** … or the instruction to drop it entirely. */
    remove?: boolean;
}
declare function chooseScope(scope: RecurrenceScope): void;
declare function cancelScope(): void;
declare function setView(v: CalendarView): void;
declare function step(dir: number): void;
declare function goToday(): void;
declare function closePop(): void;
declare var __VLS_1: {
    view: CalendarView;
    anchor: Date;
}, __VLS_9: {}, __VLS_11: {
    label: string;
    weekday: number;
    index: number;
    view: "month";
}, __VLS_13: {
    day: DayCell;
    number: string;
    today: boolean;
    outside: boolean;
    hidden: number;
    events: ResolvedEvent[];
    view: CalendarView;
}, __VLS_15: {
    event: ResolvedEvent;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: CalendarView;
    time: string;
}, __VLS_20: {
    event: ResolvedEvent;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: CalendarView;
    time: string;
}, __VLS_22: {
    event: ResolvedEvent;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: CalendarView;
    time: string;
}, __VLS_27: {
    event: ResolvedEvent;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: CalendarView;
    time: string;
}, __VLS_29: {
    event: ResolvedEvent;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: CalendarView;
    time: string;
}, __VLS_31: {
    day: string;
    event: ResolvedEvent;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: CalendarView;
    time: string;
}, __VLS_36: {
    label: string;
    weekday: number;
    index: number;
    view: string;
}, __VLS_38: {
    day: DayCell;
    number: string;
    today: boolean;
    outside: boolean;
    hidden: number;
    events: ResolvedEvent[];
    view: CalendarView;
}, __VLS_40: {
    event: ResolvedEvent;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: CalendarView;
    time: string;
}, __VLS_46: {
    event: {
        source: {
            [x: string]: unknown;
            allDay?: false | undefined;
            start: number;
            end: number;
            id: string;
            title?: string | undefined;
            type?: string | undefined;
            background?: boolean | undefined;
            resourceId?: string | undefined;
            rrule?: string | null | undefined;
            exdates?: number[] | undefined;
            overrides?: Record<string, RecurrenceOverride> | undefined;
        } | {
            [x: string]: unknown;
            allDay: true;
            startDate: string;
            endDate?: string | undefined;
            start?: number | undefined;
            end?: number | undefined;
            id: string;
            title?: string | undefined;
            type?: string | undefined;
            background?: boolean | undefined;
            resourceId?: string | undefined;
            rrule?: string | null | undefined;
            exdates?: number[] | undefined;
            overrides?: Record<string, RecurrenceOverride> | undefined;
        };
        id: string;
        instanceId: string;
        title: string;
        type?: string | undefined;
        allDay: boolean;
        background: boolean;
        resourceId?: string | undefined;
        start: number;
        end: number;
        startKey: string;
        endKey: string;
        dayCount: number;
        recurring: boolean;
        originalStart: number;
        overridden: boolean;
    };
    title: string;
    choose: typeof chooseScope;
    cancel: typeof cancelScope;
    options: {
        scope: RecurrenceScope;
        label: string;
    }[];
}, __VLS_48: {
    events: {
        source: {
            [x: string]: unknown;
            allDay?: false | undefined;
            start: number;
            end: number;
            id: string;
            title?: string | undefined;
            type?: string | undefined;
            background?: boolean | undefined;
            resourceId?: string | undefined;
            rrule?: string | null | undefined;
            exdates?: number[] | undefined;
            overrides?: Record<string, RecurrenceOverride> | undefined;
        } | {
            [x: string]: unknown;
            allDay: true;
            startDate: string;
            endDate?: string | undefined;
            start?: number | undefined;
            end?: number | undefined;
            id: string;
            title?: string | undefined;
            type?: string | undefined;
            background?: boolean | undefined;
            resourceId?: string | undefined;
            rrule?: string | null | undefined;
            exdates?: number[] | undefined;
            overrides?: Record<string, RecurrenceOverride> | undefined;
        };
        id: string;
        instanceId: string;
        title: string;
        type?: string | undefined;
        allDay: boolean;
        background: boolean;
        resourceId?: string | undefined;
        start: number;
        end: number;
        startKey: string;
        endKey: string;
        dayCount: number;
        recurring: boolean;
        originalStart: number;
        overridden: boolean;
    }[];
    day: string;
    title: string;
    close: typeof closePop;
}, __VLS_50: {
    event: ResolvedEvent;
    compact: boolean;
    clipped: {
        start: boolean;
        end: boolean;
    };
    tone: "danger" | "success" | "help" | "info" | "neutral" | "warn";
    view: CalendarView;
    time: string;
};
type __VLS_Slots = {} & {
    'toolbar-start'?: (props: typeof __VLS_1) => any;
} & {
    'toolbar-end'?: (props: typeof __VLS_9) => any;
} & {
    'day-header'?: (props: typeof __VLS_11) => any;
} & {
    'day-cell'?: (props: typeof __VLS_13) => any;
} & {
    event?: (props: typeof __VLS_15) => any;
} & {
    event?: (props: typeof __VLS_20) => any;
} & {
    event?: (props: typeof __VLS_22) => any;
} & {
    event?: (props: typeof __VLS_27) => any;
} & {
    event?: (props: typeof __VLS_29) => any;
} & {
    'list-item'?: (props: typeof __VLS_31) => any;
} & {
    'day-header'?: (props: typeof __VLS_36) => any;
} & {
    'day-cell'?: (props: typeof __VLS_38) => any;
} & {
    event?: (props: typeof __VLS_40) => any;
} & {
    'scope-prompt'?: (props: typeof __VLS_46) => any;
} & {
    'more-popover'?: (props: typeof __VLS_48) => any;
} & {
    event?: (props: typeof __VLS_50) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    step: typeof step;
    goToday: typeof goToday;
    setView: typeof setView;
    dayKeyAt: (ms: number) => string;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    "update:anchor": (v: Date) => any;
    "event-move": (payload: EditPayload) => any;
    "event-resize": (payload: EditPayload) => any;
    "event-click": (payload: {
        event: ResolvedEvent;
        originalEvent: MouseEvent;
    }) => any;
    "event-save": (payload: SavePayload) => any;
    "event-delete": (payload: DeletePayload) => any;
    "range-change": (payload: {
        from: number;
        to: number;
        view: CalendarView;
    }) => any;
    "update:view": (v: CalendarView) => any;
    "slot-click": (payload: {
        start: number;
        end: number;
        date: Date;
        resourceId?: string;
        originalEvent: MouseEvent;
    }) => any;
    "date-click": (payload: {
        date: Date;
        key: string;
        originalEvent: MouseEvent;
    }) => any;
    "more-click": (payload: {
        key: string;
        events: ResolvedEvent[];
    }) => any;
    "edit-refused": (payload: {
        event?: ResolvedEvent;
        start: number;
        end: number;
        resourceId?: string;
        reason: string;
        constraint?: CalendarConstraint;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:anchor"?: ((v: Date) => any) | undefined;
    "onEvent-move"?: ((payload: EditPayload) => any) | undefined;
    "onEvent-resize"?: ((payload: EditPayload) => any) | undefined;
    "onEvent-click"?: ((payload: {
        event: ResolvedEvent;
        originalEvent: MouseEvent;
    }) => any) | undefined;
    "onEvent-save"?: ((payload: SavePayload) => any) | undefined;
    "onEvent-delete"?: ((payload: DeletePayload) => any) | undefined;
    "onRange-change"?: ((payload: {
        from: number;
        to: number;
        view: CalendarView;
    }) => any) | undefined;
    "onUpdate:view"?: ((v: CalendarView) => any) | undefined;
    "onSlot-click"?: ((payload: {
        start: number;
        end: number;
        date: Date;
        resourceId?: string;
        originalEvent: MouseEvent;
    }) => any) | undefined;
    "onDate-click"?: ((payload: {
        date: Date;
        key: string;
        originalEvent: MouseEvent;
    }) => any) | undefined;
    "onMore-click"?: ((payload: {
        key: string;
        events: ResolvedEvent[];
    }) => any) | undefined;
    "onEdit-refused"?: ((payload: {
        event?: ResolvedEvent;
        start: number;
        end: number;
        resourceId?: string;
        reason: string;
        constraint?: CalendarConstraint;
    }) => any) | undefined;
}>, {
    view: CalendarView;
    constraints: CalendarConstraint[];
    resizable: boolean;
    editable: boolean;
    events: CalendarEvent[];
    resources: CalendarResource[];
    types: Record<string, CalendarTypeMeta>;
    inlineEditor: boolean;
    showToolbar: boolean;
    fixedWeeks: boolean;
    views: CalendarView[];
    backgroundEvents: CalendarEvent[];
    eventVariant: "solid" | "soft" | "outline";
    maxEventsPerDay: number;
    showWeekNumbers: boolean;
    showZoneLabel: boolean;
    slotDuration: number;
    slotMinTime: number;
    slotMaxTime: number;
    slotHeight: number;
    scrollToTime: number;
    maxAllDay: number;
    listDays: number;
    yearLayout: YearLayout;
    durations: number[];
    rowHeight: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
