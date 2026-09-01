import type { Directive, DirectiveBinding, Plugin, App } from 'vue';
import { anchorPosition, type AnchorSide } from './anchor';

/**
 * ApexTooltip directive — `v-apex-tooltip="'Save changes'"`.
 *
 * Written against the DOM rather than as a component, because a tooltip attaches
 * to elements the kit does not own (a table cell, a bare button) and mounting a
 * component per hover would cost far more than one shared node. Positioning is
 * the shared core/anchor, so a tooltip flips and shifts exactly like a popover.
 */
export interface TooltipOptions {
  /** The text, or HTML when `escape` is false. */
  value?: string;
  position?: AnchorSide;
  /** Milliseconds before it appears and before it goes. */
  showDelay?: number;
  hideDelay?: number;
  /** hover (default) shows on pointer enter; focus shows on focus. */
  event?: 'hover' | 'focus' | 'both';
  /** false keeps the tooltip while the pointer is over it, so links inside are reachable. */
  autoHide?: boolean;
  /** false renders `value` as HTML. */
  escape?: boolean;
  disabled?: boolean;
  /** Distance from the target, in pixels. */
  gap?: number;
  showArrow?: boolean;
  maxWidth?: string;
  background?: string;
  color?: string;
  /** Your own class on the tooltip node. */
  class?: string;
  /** Stack order; above a dialog by default. */
  zIndex?: number;
}

interface TipState {
  opts: TooltipOptions;
  node: HTMLElement | null;
  showTimer: number | null;
  hideTimer: number | null;
  /** true while the pointer is inside the tooltip and autoHide is off. */
  hovering: boolean;
  cleanup: (() => void) | null;
}

const store = new WeakMap<HTMLElement, TipState>();

const DEFAULTS: Required<Pick<TooltipOptions, 'position' | 'showDelay' | 'hideDelay' | 'event' | 'autoHide' | 'escape' | 'gap' | 'showArrow' | 'zIndex'>> = {
  position: 'right', showDelay: 0, hideDelay: 0, event: 'hover',
  autoHide: true, escape: true, gap: 8, showArrow: true, zIndex: 1200,
};

function normalise(binding: DirectiveBinding): TooltipOptions {
  const v = binding.value;
  const base: TooltipOptions = typeof v === 'string' || typeof v === 'number'
    ? { value: String(v) }
    : { ...(v || {}) };
  /* A modifier is the shorthand for position — v-apex-tooltip.top="'…'" — and loses to
     an explicit position in an options object. */
  const mod = (['top', 'bottom', 'left', 'right'] as AnchorSide[]).find((s) => binding.modifiers[s]);
  if (mod && !base.position) base.position = mod;
  return { ...DEFAULTS, ...base };
}

function place(el: HTMLElement, node: HTMLElement, opts: TooltipOptions) {
  const r = node.getBoundingClientRect();
  const pos = anchorPosition(el.getBoundingClientRect(), { width: r.width, height: r.height }, {
    side: opts.position, align: 'center', gap: opts.gap,
  });
  node.style.insetInlineStart = pos.x + 'px';
  node.style.insetBlockStart = pos.y + 'px';
  node.dataset.side = pos.side;
  node.style.setProperty('--tip-arrow', pos.arrow + 'px');
  node.style.visibility = 'visible';
}

function build(el: HTMLElement, state: TipState) {
  const opts = state.opts;
  const node = document.createElement('div');
  node.className = 'apex-tip' + (opts.class ? ' ' + opts.class : '');
  node.setAttribute('role', 'tooltip');
  node.dataset.arrow = opts.showArrow ? 'true' : 'false';
  node.style.zIndex = String(opts.zIndex);
  // hidden until measured, so it never flashes at the wrong place
  node.style.visibility = 'hidden';
  if (opts.maxWidth) node.style.setProperty('--tip-maxw', opts.maxWidth);
  if (opts.background) node.style.setProperty('--tip-bg', opts.background);
  if (opts.color) node.style.setProperty('--tip-fg', opts.color);

  const body = document.createElement('div');
  body.className = 'apex-tip__body';
  if (opts.escape === false) body.innerHTML = opts.value || '';
  else body.textContent = opts.value || '';
  node.appendChild(body);

  if (opts.showArrow) {
    const tip = document.createElement('span');
    tip.className = 'apex-tip__arrow';
    tip.setAttribute('aria-hidden', 'true');
    node.appendChild(tip);
  }

  document.body.appendChild(node);
  state.node = node;
  requestAnimationFrame(() => {
    place(el, node, opts);
    node.dataset.open = 'true';
  });

  const reposition = () => { if (state.node) place(el, state.node, opts); };
  window.addEventListener('resize', reposition);
  window.addEventListener('scroll', reposition, true);

  /* With autoHide off the tooltip is interactive, so it keeps itself alive while
     the pointer is inside it. */
  const onEnter = () => { if (!opts.autoHide) { state.hovering = true; clearHide(state); } };
  const onLeave = () => { if (!opts.autoHide) { state.hovering = false; hide(el, state); } };
  node.addEventListener('pointerenter', onEnter);
  node.addEventListener('pointerleave', onLeave);

  state.cleanup = () => {
    window.removeEventListener('resize', reposition);
    window.removeEventListener('scroll', reposition, true);
    node.removeEventListener('pointerenter', onEnter);
    node.removeEventListener('pointerleave', onLeave);
  };
}

function clearShow(state: TipState) {
  if (state.showTimer) { clearTimeout(state.showTimer); state.showTimer = null; }
}
function clearHide(state: TipState) {
  if (state.hideTimer) { clearTimeout(state.hideTimer); state.hideTimer = null; }
}

function destroy(state: TipState) {
  state.cleanup?.();
  state.cleanup = null;
  const node = state.node;
  state.node = null;
  if (!node) return;
  node.dataset.open = 'false';
  // let the fade finish before the node goes
  setTimeout(() => node.remove(), 140);
}

function show(el: HTMLElement, state: TipState) {
  clearHide(state);
  if (state.node || state.opts.disabled || !state.opts.value) return;
  const run = () => { state.showTimer = null; build(el, state); };
  if (state.opts.showDelay) state.showTimer = window.setTimeout(run, state.opts.showDelay);
  else run();
}

function hide(el: HTMLElement, state: TipState) {
  clearShow(state);
  if (!state.node || state.hovering) return;
  const run = () => { state.hideTimer = null; if (!state.hovering) destroy(state); };
  /* Interactive tooltips need a grace period, or the pointer can never cross the
     gap between the target and the panel. */
  const delay = state.opts.hideDelay || (state.opts.autoHide === false ? 120 : 0);
  if (delay) state.hideTimer = window.setTimeout(run, delay);
  else run();
}

export const apexTooltip: Directive<HTMLElement, string | TooltipOptions> = {
  mounted(el, binding) {
    const state: TipState = {
      opts: normalise(binding), node: null, showTimer: null, hideTimer: null,
      hovering: false, cleanup: null,
    };
    store.set(el, state);

    const onEnter = () => show(el, state);
    const onLeave = () => hide(el, state);
    const onFocus = () => show(el, state);
    const onBlur = () => { state.hovering = false; hide(el, state); };
    const onDown = () => { state.hovering = false; hide(el, state); };

    const ev = state.opts.event;
    if (ev === 'hover' || ev === 'both') {
      el.addEventListener('pointerenter', onEnter);
      el.addEventListener('pointerleave', onLeave);
      // a tap should not leave a tooltip stranded on a touch device
      el.addEventListener('pointerdown', onDown);
    }
    if (ev === 'focus' || ev === 'both') {
      /* focusin/focusout rather than focus/blur: they bubble, so a directive on a
         composite control (the ApexInput root, not its inner <input>) still sees
         focus landing on a descendant. */
      el.addEventListener('focusin', onFocus);
      el.addEventListener('focusout', onBlur);
    }
    (el as HTMLElement & { __apexTipOff?: () => void }).__apexTipOff = () => {
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('focusin', onFocus);
      el.removeEventListener('focusout', onBlur);
    };
  },
  updated(el, binding) {
    const state = store.get(el);
    if (!state) return;
    state.opts = normalise(binding);
    if (state.opts.disabled) { clearShow(state); destroy(state); return; }
    // a live tooltip picks up new text without a re-hover
    const body = state.node?.querySelector<HTMLElement>('.apex-tip__body');
    if (!body) return;
    if (state.opts.escape === false) body.innerHTML = state.opts.value || '';
    else body.textContent = state.opts.value || '';
    place(el, state.node as HTMLElement, state.opts);
  },
  unmounted(el) {
    const state = store.get(el);
    (el as HTMLElement & { __apexTipOff?: () => void }).__apexTipOff?.();
    if (!state) return;
    clearShow(state);
    clearHide(state);
    destroy(state);
    store.delete(el);
  },
};

/** Registers v-apex-tooltip; ApexUI's install does this for you. */
export const ApexTooltipPlugin: Plugin = {
  install(app: App) { app.directive('apexTooltip', apexTooltip); },
};
