import type { ApexFieldClasses, ApexFieldProps } from '../types';
type __VLS_Props = ApexFieldProps & {
    /** Current value — only used to evaluate `rules`. */
    value?: unknown;
    /**
     * Off for a COMPOSITE control, whose resolved id lands on a div.
     *
     * `for` may only point at a labelable element, so on a group it names
     * nothing — the browser resolves it to no element at all. Such a control
     * takes the `labelId` this slot hands out and uses `aria-labelledby`
     * instead. AF2-280: ApexEditor is the first of ours to need it.
     */
    labelFor?: boolean;
    /** Set by controls so the floating label knows to lift. */
    filled?: boolean;
    focused?: boolean;
};
declare var __VLS_4: {
    id: string;
    describedBy: string | undefined;
    tone: import("..").ApexTone;
    invalid: boolean;
    size: import("..").ApexSize;
    disabled: boolean;
    statusGlyph: string;
    labelId: string | undefined;
    ui: ApexFieldClasses;
};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_4) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    state: {
        id: import("vue").ComputedRef<string>;
        tone: import("vue").ComputedRef<import("..").ApexTone>;
        message: import("vue").ComputedRef<string | undefined>;
        size: import("vue").ComputedRef<import("..").ApexSize>;
        labelPlacement: import("vue").ComputedRef<import("..").ApexLabelPlacement>;
        invalid: import("vue").ComputedRef<boolean>;
        describedBy: import("vue").ComputedRef<string | undefined>;
        focused: import("vue").Ref<boolean, boolean>;
        ruleClass: import("vue").ComputedRef<string | undefined>;
        matched: import("vue").ComputedRef<import("..").ApexRule | undefined>;
    };
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    statusIcon: boolean;
    labelFor: boolean;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
