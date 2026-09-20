import { type ApexDateLocale } from '../core/dates';
import type { ApexFieldProps } from '../types';
type DateValue = Date | string | null;
type __VLS_Props = ApexFieldProps & {
    modelValue?: DateValue | DateValue[];
    /** jQuery-UI style tokens: d dd o oo D DD m mm M MM y yy @ ! '…' */
    dateFormat?: string;
    /** What v-model holds. */
    modelType?: 'date' | 'string';
    selectionMode?: 'single' | 'multiple' | 'range';
    locale?: Partial<ApexDateLocale>;
    placeholder?: string;
    /** Calendar button beside the field. */
    showIcon?: boolean;
    icon?: string;
    clearable?: boolean;
    /** Render the calendar in place instead of a popup. */
    inline?: boolean;
    /** date | month | year — the level the picker selects at. */
    view?: 'date' | 'month' | 'year';
    numberOfMonths?: number;
    minDate?: Date;
    maxDate?: Date;
    disabledDates?: Date[];
    /** Day indexes to disable, 0 = Sunday. */
    disabledDays?: number[];
    showButtonBar?: boolean;
    showTime?: boolean;
    timeOnly?: boolean;
    hourFormat?: '12' | '24';
    showSeconds?: boolean;
    stepMinute?: number;
    /** Block typing and only allow the calendar. */
    readonlyInput?: boolean;
    /** Show the week's ISO number down the side. */
    showWeek?: boolean;
    /** The popover: its surface, edge, corner and lift. */
    calendarBackground?: string;
    calendarBorderColor?: string;
    calendarRadius?: string;
    calendarShadow?: string;
    /** A day at rest, and its corner. */
    dayColor?: string;
    dayRadius?: string;
    /** Under the pointer. */
    dayHoverBackground?: string;
    /** The selected day. Set both — the text is #fff by default, which a light
        background leaves unreadable. */
    daySelectedBackground?: string;
    daySelectedColor?: string;
    /** Today's ring, a day spilling in from the neighbouring month, and the
        band between the two ends of a range. */
    dayTodayRing?: string;
    dayOutsideColor?: string;
    dayRangeBackground?: string;
};
declare var __VLS_22: {
    date: Date;
    outside: boolean;
    selected: boolean;
};
type __VLS_Slots = {} & {
    date?: (props: typeof __VLS_22) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {} & {
    change: () => any;
    "update:modelValue": (v: DateValue | DateValue[]) => any;
    "month-change": (payload: {
        month: number;
        year: number;
    }) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onChange?: (() => any) | undefined;
    "onUpdate:modelValue"?: ((v: DateValue | DateValue[]) => any) | undefined;
    "onMonth-change"?: ((payload: {
        month: number;
        year: number;
    }) => any) | undefined;
}>, {
    view: "date" | "month" | "year";
    statusIcon: boolean;
    icon: string;
    dateFormat: string;
    modelType: "date" | "string";
    selectionMode: "single" | "multiple" | "range";
    numberOfMonths: number;
    hourFormat: "12" | "24";
    stepMinute: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
