import type { App, Directive, DirectiveBinding, Plugin } from 'vue';

/**
 * ApexFocusTrap — keeps Tab inside a container: `v-apex-focus-trap`.
 *
 * Implemented with a keydown handler on the container rather than sentinel
 * elements at its edges, because the tabbable set is read at the moment Tab is
 * pressed. A trap that captured its boundaries on mount would leak as soon as a
 * field was disabled, revealed or added.
 */
export interface FocusTrapOptions {
  /** Turn the trap off without removing the directive. */
  disabled?: boolean;
  /** Focus the first tabbable element on mount. An [autofocus] element wins. */
  autoFocus?: boolean;
  /** A selector inside the container to focus instead of the first tabbable. */
  initialFocus?: string;
  /** Return focus to whatever was focused before, on unmount. */
  restoreFocus?: boolean;
}

const SELECTOR = [
  'a[href]', 'area[href]', 'button', 'input', 'select', 'textarea',
  'iframe', 'object', 'embed', 'audio[controls]', 'video[controls]',
  '[contenteditable]', '[tabindex]',
].join(',');

interface State {
  options: FocusTrapOptions;
  previous: Element | null;
  onKey: (e: KeyboardEvent) => void;
}

const STATE = new WeakMap<HTMLElement, State>();

/** Read at Tab time, not at mount: the set changes as the UI does. */
function tabbable(root: HTMLElement) {
  return (Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)) as HTMLElement[]).filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false;
    if (Number(el.getAttribute('tabindex')) < 0) return false;
    if (el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return false;
    return true;
  });
}

function parse(binding: DirectiveBinding): FocusTrapOptions {
  const v = binding.value;
  if (v === false) return { disabled: true };
  return { autoFocus: true, restoreFocus: true, ...(v || {}) };
}

export const apexFocusTrap: Directive<HTMLElement> = {
  mounted(el, binding) {
    const options = parse(binding);

    function onKey(e: KeyboardEvent) {
      const state = STATE.get(el);
      if (!state || state.options.disabled || e.key !== 'Tab') return;
      const list = tabbable(el);
      if (!list.length) { e.preventDefault(); return; }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      /* Focus outside the container at all — a programmatic move, say — comes
         back to the edge rather than continuing out of the trap. */
      if (!active || !el.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }

    el.addEventListener('keydown', onKey);
    STATE.set(el, { options, previous: document.activeElement, onKey });

    if (options.disabled || !options.autoFocus) return;
    /* A selector that matches nothing must not leave a modal-intent panel with
       focus on the body: fall back to the documented autoFocus path. */
    const wanted = (options.initialFocus && el.querySelector<HTMLElement>(options.initialFocus))
      || el.querySelector<HTMLElement>('[autofocus]')
      || tabbable(el)[0];
    wanted?.focus();
  },
  updated(el, binding) {
    const state = STATE.get(el);
    if (state) state.options = parse(binding);
  },
  unmounted(el) {
    const state = STATE.get(el);
    if (!state) return;
    el.removeEventListener('keydown', state.onKey);
    if (state.options.restoreFocus && state.previous instanceof HTMLElement) state.previous.focus();
    STATE.delete(el);
  },
};

/** Registers v-apex-focus-trap; ApexUI's install does this for you. */
export const ApexFocusTrapPlugin: Plugin = {
  install(app: App) { app.directive('apexFocusTrap', apexFocusTrap); },
};
