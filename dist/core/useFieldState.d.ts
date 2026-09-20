import { type ComputedRef, type Ref } from 'vue';
import type { ApexFieldProps, ApexRule, ApexTone } from '../types';
export declare const nextId: (p?: string) => string;
/**
 * Is this control's label the floating kind? — AF2-374.
 *
 * Every control that draws its own placeholder needs to know, because a
 * float label sits INSIDE the box until it rises: the two occupy the same
 * space, so a control either suppresses its placeholder or lifts its label
 * while the label is down.
 *
 * It resolves the placement the SAME WAY `useFieldState` does — the prop,
 * then the app-wide option — and that is the whole reason it exists. Ten
 * controls each computed this from `props.labelPlacement` alone, so the
 * behaviour was right when a field named the placement itself and WRONG
 * when the app set it for every field at once: ApexField drew the label
 * inside (it reads the option) while the control still drew its
 * placeholder (it did not). Both printed in the same place.
 *
 * Reported from a real screen, where "Entity Name" and "Company or person
 * name" were drawn over each other. Invisible to every test here, because
 * a test that mounts one control passes the prop.
 */
export declare function useFloatLabel(props: Pick<ApexFieldProps, 'labelPlacement'>): ComputedRef<boolean>;
/**
 * Resolves tone + message for a field.
 * Precedence: explicit `error` > `warning` > `success` > matching `rules` (last wins) > `tone` prop.
 * Rules are conditional FORMATTING, not validation — they never block submit.
 */
export declare function useFieldState(props: ApexFieldProps, value: Ref<unknown> | ComputedRef<unknown>): {
    id: ComputedRef<string>;
    tone: ComputedRef<ApexTone>;
    message: ComputedRef<string | undefined>;
    size: ComputedRef<import("..").ApexSize>;
    labelPlacement: ComputedRef<import("..").ApexLabelPlacement>;
    invalid: ComputedRef<boolean>;
    describedBy: ComputedRef<string | undefined>;
    focused: Ref<boolean, boolean>;
    ruleClass: ComputedRef<string | undefined>;
    matched: ComputedRef<ApexRule | undefined>;
};
