import { type ComputedRef } from 'vue';
import type { ApexOverlayTransition, ApexOverlayClasses } from '../types';
/**
 * One transition contract for every overlay in the kit — AF2-330.
 *
 * ApexDialog already had the right idea: a named preset by default, your own
 * classes when you pass them, wired through `<Transition v-bind>`. Nothing
 * else had it. ApexDrawer, ApexPopover, ApexConfirmPopup and ApexToast each
 * hard-coded a transition name; ApexForm's modal had no `<Transition>` at
 * all, so it appeared and vanished; and ApexAlert DECLARED `enterClass` and
 * `leaveClass` and applied them as static classes on the panel, so its leave
 * animation could never run.
 *
 * The classes are deliberately just strings. The library does not know that
 * animate.css exists, which is what keeps it dependency-free and lets a
 * house animation set work equally well — see the Motion & transitions page.
 *
 * Duration is the fiddly half. animate.css reads ONE custom property,
 * `--animate-duration`, shared by enter and leave, so different in/out
 * timings have to be written onto the element as each phase begins and
 * cleared as it ends — otherwise a reopened dialog inherits the leave
 * duration. `animation-duration` is set alongside it so the props work for
 * hand-written classes too.
 *
 * Not set as `!important`: animate.css's own `prefers-reduced-motion` block
 * is, so a reader who asked for less motion still gets it. That is the
 * correct precedence and it comes for free.
 */
/** What a `<Transition>` needs, plus the hooks that carry the durations. */
export interface OverlayTransitionBinding {
    name?: string;
    enterActiveClass?: string;
    leaveActiveClass?: string;
    onBeforeEnter: (el: Element) => void;
    onAfterEnter: (el: Element) => void;
    onBeforeLeave: (el: Element) => void;
    onAfterLeave: (el: Element) => void;
}
/**
 * Bind the result to a `<Transition>`: `<Transition v-bind="t">`.
 *
 * @param props    the component's own props, carrying any of the five
 * @param fallback either a PREFIX, for the components with a scale / slide /
 *                 fade preset (`'apex-dlg'` → `apex-dlg-scale`), or a getter
 *                 returning the whole name, for the ones whose built-in
 *                 animation is fixed or derived — a drawer animates by its
 *                 position, a popover has one animation and no choice.
 */
export declare function useOverlayTransition(props: ApexOverlayTransition | ApexOverlayClasses, fallback: string | (() => string)): ComputedRef<OverlayTransitionBinding>;
