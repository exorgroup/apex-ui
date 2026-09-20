import type { Directive, Plugin } from 'vue';
/**
 * ApexAnimateOnScroll — plays an animation as an element enters or leaves the
 * viewport: `v-apex-animate-on-scroll="{ enterClass, leaveClass }"`.
 *
 * IntersectionObserver rather than scroll maths: it fires off the main thread and
 * costs nothing while the element is far away, so a page can carry a hundred of
 * these without a scroll handler per element.
 *
 * The element is hidden until its first entrance, otherwise an element that
 * animates in from below is fully visible before the animation ever runs.
 */
export interface AnimateOnScrollOptions {
    /** Classes applied on entry, e.g. 'apex-anim-enter apex-fade apex-from-b'. */
    enterClass?: string;
    /** Classes applied on exit; omit to leave the element as it is. */
    leaveClass?: string;
    /** A scroll container, as an element or a selector. Defaults to the viewport. */
    root?: Element | string | null;
    /** How much must be visible to count as entered. */
    threshold?: number;
    rootMargin?: string;
    /** Animate the entrance once and then stop observing. */
    once?: boolean;
}
export declare const apexAnimateOnScroll: Directive<HTMLElement>;
/** Registers v-apex-animate-on-scroll; ApexUI's install does this for you. */
export declare const ApexAnimateOnScrollPlugin: Plugin;
