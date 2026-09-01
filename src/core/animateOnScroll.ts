import type { App, Directive, DirectiveBinding, Plugin } from 'vue';

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

interface State {
  observer: IntersectionObserver;
  options: AnimateOnScrollOptions;
  entered: boolean;
}

const STATE = new WeakMap<HTMLElement, State>();

function parse(binding: DirectiveBinding): AnimateOnScrollOptions {
  const v = binding.value;
  if (typeof v === 'string') return { enterClass: v };
  return v || {};
}

function classes(s?: string) {
  return (s || '').split(/\s+/).filter(Boolean);
}

function apply(el: HTMLElement, add?: string, remove?: string) {
  classes(remove).forEach((c) => el.classList.remove(c));
  /* Force a reflow between removing and adding, or re-entering an element that
     still carries the class restarts nothing. */
  void el.offsetWidth;
  classes(add).forEach((c) => el.classList.add(c));
}

function mount(el: HTMLElement, binding: DirectiveBinding) {
  const options = parse(binding);
  const root = typeof options.root === 'string'
    ? document.querySelector(options.root)
    : options.root || null;

  el.classList.add('apex-anim');
  if (!options.enterClass) el.classList.add('apex-anim--seen');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const state = STATE.get(el);
      if (!state) return;
      if (entry.isIntersecting) {
        el.classList.add('apex-anim--seen');
        apply(el, state.options.enterClass, state.options.leaveClass);
        state.entered = true;
        if (state.options.once) observer.unobserve(el);
      } else if (state.entered && state.options.leaveClass) {
        apply(el, state.options.leaveClass, state.options.enterClass);
      }
    });
  }, {
    root,
    threshold: options.threshold ?? 0.15,
    rootMargin: options.rootMargin ?? '0px',
  });

  STATE.set(el, { observer, options, entered: false });
  observer.observe(el);
}

function unmount(el: HTMLElement) {
  const state = STATE.get(el);
  state?.observer.disconnect();
  STATE.delete(el);
}

export const apexAnimateOnScroll: Directive<HTMLElement> = {
  mounted(el, binding) {
    if (typeof IntersectionObserver === 'undefined') { el.classList.add('apex-anim--seen'); return; }
    mount(el, binding);
  },
  updated(el, binding) {
    const state = STATE.get(el);
    if (state) state.options = parse(binding);
  },
  unmounted: unmount,
};

/** Registers v-apex-animate-on-scroll; ApexUI's install does this for you. */
export const ApexAnimateOnScrollPlugin: Plugin = {
  install(app: App) { app.directive('apexAnimateOnScroll', apexAnimateOnScroll); },
};
