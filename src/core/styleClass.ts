import type { App, Directive, DirectiveBinding, Plugin } from 'vue';

/**
 * ApexStyleClass — toggles classes on another element declaratively:
 * `v-apex-style-class="{ selector: '@next', toggleClass: 'open' }"`.
 *
 * Two modes over one directive. `toggleClass` adds and removes a single class;
 * the enter/leave triple runs an animation and reads its real duration from the
 * element, so a class whose animation length changes needs no matching timeout
 * here — a fixed delay is the usual reason these break.
 *
 * The target is resolved at click time, not at mount: `@next` on an element
 * whose sibling is rendered conditionally would otherwise bind to nothing.
 */
export interface StyleClassOptions {
  /** '@next', '@prev', '@parent', '@grandparent', or any CSS selector. */
  selector?: string;
  /** Simple add/remove mode. */
  toggleClass?: string;
  /* enter */
  enterFromClass?: string;
  enterActiveClass?: string;
  enterToClass?: string;
  /* leave */
  leaveFromClass?: string;
  leaveActiveClass?: string;
  leaveToClass?: string;
  /** Run the leave sequence when a click lands outside the target. */
  hideOnOutsideClick?: boolean;
  /** Run the leave sequence on Escape. */
  hideOnEscape?: boolean;
  /** Run the leave sequence when something resizes. */
  hideOnResize?: boolean;
  /** 'window' | 'document' | a CSS selector observed for size changes. */
  resizeSelector?: string;
}

interface State {
  options: StyleClassOptions;
  entered: boolean;
  onClick: (e: MouseEvent) => void;
  onOutside?: (e: PointerEvent) => void;
  onKey?: (e: KeyboardEvent) => void;
  onResize?: () => void;
  observer?: ResizeObserver;
}

const STATE = new WeakMap<HTMLElement, State>();

function classes(s?: string) {
  return (s || '').split(/\s+/).filter(Boolean);
}
function add(el: Element, s?: string) { classes(s).forEach((c) => el.classList.add(c)); }
function remove(el: Element, s?: string) { classes(s).forEach((c) => el.classList.remove(c)); }

/** Resolved per click: a conditionally rendered sibling does not exist at mount. */
function resolve(host: HTMLElement, selector?: string): HTMLElement | null {
  if (!selector) return null;
  if (selector === '@next') return host.nextElementSibling as HTMLElement | null;
  if (selector === '@prev') return host.previousElementSibling as HTMLElement | null;
  if (selector === '@parent') return host.parentElement;
  if (selector === '@grandparent') return host.parentElement?.parentElement ?? null;
  return document.querySelector<HTMLElement>(selector);
}

/** The element's own animation or transition length, so nothing is guessed. */
function durationOf(el: Element) {
  const cs = getComputedStyle(el);
  const ms = (v: string) => v.split(',').reduce((max, part) => {
    const t = part.trim();
    const n = t.endsWith('ms') ? parseFloat(t) : parseFloat(t) * 1000;
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  return Math.max(ms(cs.animationDuration), ms(cs.transitionDuration)) || 0;
}

function parse(binding: DirectiveBinding): StyleClassOptions {
  const v = binding.value;
  if (typeof v === 'string') return { selector: '@next', toggleClass: v };
  return v || {};
}

function enter(el: HTMLElement, target: HTMLElement, o: StyleClassOptions) {
  remove(target, o.leaveToClass);
  remove(target, o.enterFromClass);
  add(target, o.enterActiveClass);
  const state = STATE.get(el);
  if (state) state.entered = true;
  window.setTimeout(() => {
    remove(target, o.enterActiveClass);
    add(target, o.enterToClass);
  }, durationOf(target));
}

function leave(el: HTMLElement, target: HTMLElement, o: StyleClassOptions) {
  remove(target, o.enterToClass);
  remove(target, o.leaveFromClass);
  add(target, o.leaveActiveClass);
  const state = STATE.get(el);
  if (state) state.entered = false;
  window.setTimeout(() => {
    remove(target, o.leaveActiveClass);
    add(target, o.leaveToClass);
  }, durationOf(target));
}

export const apexStyleClass: Directive<HTMLElement> = {
  mounted(el, binding) {
    const options = parse(binding);

    function teardownListeners() {
      const s = STATE.get(el);
      if (!s) return;
      if (s.onOutside) document.removeEventListener('pointerdown', s.onOutside, true);
      if (s.onKey) document.removeEventListener('keydown', s.onKey, true);
      if (s.onResize) {
        window.removeEventListener('resize', s.onResize);
        s.observer?.disconnect();
      }
      s.onOutside = undefined;
      s.onKey = undefined;
      s.onResize = undefined;
      s.observer = undefined;
    }

    function armDismiss(target: HTMLElement, o: StyleClassOptions) {
      const s = STATE.get(el);
      if (!s) return;
      teardownListeners();
      const close = () => { leave(el, target, o); teardownListeners(); };
      if (o.hideOnOutsideClick) {
        s.onOutside = (e: PointerEvent) => {
          const node = e.target as Node;
          if (target.contains(node) || el.contains(node)) return;
          close();
        };
        document.addEventListener('pointerdown', s.onOutside, true);
      }
      if (o.hideOnEscape) {
        s.onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', s.onKey, true);
      }
      if (o.hideOnResize) {
        s.onResize = close;
        const which = o.resizeSelector || 'window';
        if (which === 'window' || which === 'document') {
          window.addEventListener('resize', s.onResize);
        } else if ('ResizeObserver' in window) {
          const watched = document.querySelector(which);
          if (watched) {
            /* skip the observer's initial call, which fires on observe() */
            let first = true;
            s.observer = new ResizeObserver(() => {
              if (first) { first = false; return; }
              close();
            });
            s.observer.observe(watched);
          }
        }
      }
    }

    function onClick(e: MouseEvent) {
      const state = STATE.get(el);
      if (!state) return;
      const o = state.options;
      const target = resolve(el, o.selector);
      if (!target) return;
      e.preventDefault();
      if (o.toggleClass) {
        classes(o.toggleClass).forEach((c) => target.classList.toggle(c));
        state.entered = target.classList.contains(classes(o.toggleClass)[0]);
        if (state.entered) armDismiss(target, o);
        else teardownListeners();
        return;
      }
      /* Direction comes from the configuration and the TARGET, never from this
         instance's own history: two buttons driving one panel (a Show and a Hide)
         each kept their own drifting flag, so the first press of Hide revealed. */
      const canEnter = !!(o.enterFromClass || o.enterActiveClass || o.enterToClass);
      const canLeave = !!(o.leaveFromClass || o.leaveActiveClass || o.leaveToClass);
      const hidden = classes(o.enterFromClass).concat(classes(o.leaveToClass))
        .some((c) => target.classList.contains(c));
      const goEnter = canEnter && canLeave ? hidden : canEnter;
      if (goEnter) { enter(el, target, o); armDismiss(target, o); }
      else if (canLeave) { leave(el, target, o); teardownListeners(); }
    }

    el.addEventListener('click', onClick);
    STATE.set(el, { options, entered: false, onClick });
  },
  updated(el, binding) {
    const state = STATE.get(el);
    if (state) state.options = parse(binding);
  },
  unmounted(el) {
    const state = STATE.get(el);
    if (!state) return;
    el.removeEventListener('click', state.onClick);
    if (state.onOutside) document.removeEventListener('pointerdown', state.onOutside, true);
    if (state.onKey) document.removeEventListener('keydown', state.onKey, true);
    if (state.onResize) window.removeEventListener('resize', state.onResize);
    state.observer?.disconnect();
    STATE.delete(el);
  },
};

/** Registers v-apex-style-class; ApexUI's install does this for you. */
export const ApexStyleClassPlugin: Plugin = {
  install(app: App) { app.directive('apexStyleClass', apexStyleClass); },
};
