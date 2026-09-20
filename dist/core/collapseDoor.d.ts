import type { Ref } from 'vue';
/**
 * A door for one container, driven by a single `shut` flag.
 *
 * Bind the returned flag as `:hidden="shut && !animating"`, or the content is
 * gone before it has travelled anywhere.
 *
 * A caller whose element declares its own `display` also needs a
 * `[hidden]{display:none}` rule: an author display beats the user-agent one and
 * the attribute stops hiding anything. tests/zz-hidden-reset.spec.ts checks that.
 */
export declare function useCollapseDoor(shut: Ref<boolean>, el: Ref<HTMLElement | null>): {
    animating: Ref<boolean, boolean>;
};
/**
 * Doors for a keyed set — ApexAccordion, where each panel opens on its own and
 * a single-open accordion closes one while opening another.
 *
 * Bind as `:hidden="!isOpen(panel) && !animating(panel.value)"`, and hand each
 * body element in with `setEl` so the panel can be measured when its turn comes.
 */
export declare function useCollapseDoors<K>(): {
    animating: (key: K) => boolean;
    setEl: (key: K, node: HTMLElement | null) => void;
    open: (key: K, closing: boolean) => void;
};
