import type { App, Directive, DirectiveBinding, Plugin } from 'vue';

/**
 * ApexRipple — a ripple spreading from the point of contact:
 * `v-apex-ripple` or `v-apex-ripple="{ color: '…' }"`.
 *
 * The ink element is created per press and removed when its animation ends,
 * rather than kept and restarted. A single reused node cannot show two
 * overlapping presses, and restarting its animation mid-flight makes a rapid
 * double click look like one interrupted ripple.
 *
 * The radius is computed from the press position to the furthest corner, so the
 * wave always reaches the whole element however off-centre the click was.
 */
export interface RippleOptions {
  disabled?: boolean;
  /** Any CSS colour. Defaults to a tint of the host's own text colour. */
  color?: string;
  opacity?: number;
  duration?: string;
  /** Start from the element's centre rather than the pointer. */
  centered?: boolean;
  /** Also ripple on keyboard activation, from the centre. */
  keyboard?: boolean;
}

interface State {
  options: RippleOptions;
  onPointerDown: (e: PointerEvent) => void;
  onKeyDown: (e: KeyboardEvent) => void;
}

const STATE = new WeakMap<HTMLElement, State>();

function parse(binding: DirectiveBinding): RippleOptions {
  const v = binding.value;
  if (v === false) return { disabled: true };
  if (typeof v === 'string') return { color: v };
  return { keyboard: true, ...(v || {}) };
}

/* The wave is clipped by a layer of our own, not by the host: forcing
   overflow:hidden on the host cut off anything meant to paint outside it — a
   button's badge, an avatar's status dot. */
function layerFor(el: HTMLElement) {
  let layer = el.querySelector<HTMLElement>(':scope > .apex-ripple__layer');
  if (!layer) {
    layer = document.createElement('span');
    layer.className = 'apex-ripple__layer';
    layer.setAttribute('aria-hidden', 'true');
    el.appendChild(layer);
  }
  return layer;
}

function spawn(el: HTMLElement, options: RippleOptions, x?: number, y?: number) {
  const rect = el.getBoundingClientRect();
  const cx = options.centered || x === undefined ? rect.width / 2 : x - rect.left;
  const cy = options.centered || y === undefined ? rect.height / 2 : y - rect.top;
  /* Furthest corner, so the wave covers the element from wherever it started. */
  const radius = Math.hypot(Math.max(cx, rect.width - cx), Math.max(cy, rect.height - cy));

  const ink = document.createElement('span');
  ink.className = 'apex-ripple__ink';
  ink.style.inlineSize = ink.style.blockSize = radius * 2 + 'px';
  ink.style.insetInlineStart = cx - radius + 'px';
  ink.style.insetBlockStart = cy - radius + 'px';
  if (options.color) ink.style.background = options.color;
  if (options.opacity !== undefined) ink.style.setProperty('--rp-opacity', String(options.opacity));
  if (options.duration) ink.style.setProperty('--rp-dur', options.duration);

  /* Removed on animationend rather than reused: one node cannot show two
     overlapping presses, and restarting it mid-flight reads as a stutter. */
  ink.addEventListener('animationend', () => ink.remove());
  layerFor(el).appendChild(ink);
}

export const apexRipple: Directive<HTMLElement> = {
  mounted(el, binding) {
    const options = parse(binding);
    el.classList.add('apex-ripple');

    function onPointerDown(e: PointerEvent) {
      const state = STATE.get(el);
      if (!state || state.options.disabled) return;
      spawn(el, state.options, e.clientX, e.clientY);
    }
    function onKeyDown(e: KeyboardEvent) {
      const state = STATE.get(el);
      if (!state || state.options.disabled || state.options.keyboard === false) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (e.repeat) return;
      spawn(el, { ...state.options, centered: true });
    }

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('keydown', onKeyDown);
    STATE.set(el, { options, onPointerDown, onKeyDown });
  },
  updated(el, binding) {
    const state = STATE.get(el);
    if (state) state.options = parse(binding);
  },
  unmounted(el) {
    const state = STATE.get(el);
    if (!state) return;
    el.removeEventListener('pointerdown', state.onPointerDown);
    el.removeEventListener('keydown', state.onKeyDown);
    el.classList.remove('apex-ripple');
    el.querySelector(':scope > .apex-ripple__layer')?.remove();
    STATE.delete(el);
  },
};

/** Registers v-apex-ripple; ApexUI's install does this for you. */
export const ApexRipplePlugin: Plugin = {
  install(app: App) { app.directive('apexRipple', apexRipple); },
};
