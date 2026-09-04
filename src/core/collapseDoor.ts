import { nextTick, ref, shallowRef, watch } from 'vue';
import type { Ref } from 'vue';

/**
 * The collapse animation shared by ApexPanel, ApexFieldset and ApexAccordion.
 *
 * Swapping `hidden` reads as the content vanishing. This rolls it instead: the
 * region lifts a little past its own height, then runs to zero — and on the way
 * back it overshoots the same amount before settling. The lift is what makes it
 * read as a door on a track rather than a wipe.
 *
 * Heights have to be measured, not declared, because the content decides them,
 * which is why this is script and not a CSS transition.
 */

/** px past the natural height, at either end of the travel. */
const OVERSHOOT = 10;
/** ms for the whole travel. */
const DURATION = 260;
/** The library's ease-out, as a literal because WAAPI takes no variables. */
const EASING = 'cubic-bezier(.22,1,.36,1)';

/** Someone who asked for less motion gets the instant swap. */
const wantsMotion = () =>
  typeof matchMedia !== 'function' || !matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Nothing to animate against: no element, no Web Animations, or reduced motion. */
const cannotAnimate = (node: HTMLElement | null): node is null =>
  !node || typeof node.animate !== 'function' || !wantsMotion();

/**
 * One run of the door.
 *
 * `hold` keeps the `hidden` attribute off while it travels and `release` puts
 * the caller's state back; `current` says whether this run is still the latest,
 * so a faster second click cleanly abandons the first.
 */
async function travel(
  node: HTMLElement,
  closing: boolean,
  hold: () => void,
  release: () => void,
  current: () => boolean,
) {
  /* Closing can measure now, while the content is still laid out. Opening has to
     wait for `hidden` to come off, which `hold` does on the next tick. */
  hold();
  if (!closing) await nextTick();
  if (!current()) return;
  const natural = node.scrollHeight;

  const peak = `${natural + OVERSHOOT}px`;
  const frames = closing
    ? [{ height: `${natural}px` }, { height: peak, offset: 0.25 }, { height: '0px' }]
    : [{ height: '0px' }, { height: peak, offset: 0.75 }, { height: `${natural}px` }];

  /* Clipped only for the duration: a permanently hidden overflow would cut off
     a menu or date picker opening out of the content. */
  node.style.overflow = 'hidden';
  /* `forwards` keeps the last frame after it finishes. Without it the height
     springs back to natural the instant the animation ends, and the content
     flashes at full height for the frame before `hidden` lands. */
  const anim = node.animate(frames, { duration: DURATION, easing: EASING, fill: 'forwards' });
  try {
    await anim.finished;
  } catch {
    return; // superseded by a faster click; that run does the cleanup
  }
  if (!current()) return;

  /* Release first, then wait for the render that applies `hidden`, and only then
     drop the held height — so nothing is ever visible at full height while the
     container is meant to be shut. */
  release();
  await nextTick();
  if (!current()) return;
  anim.cancel();
  node.style.overflow = '';
}

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
export function useCollapseDoor(shut: Ref<boolean>, el: Ref<HTMLElement | null>) {
  const animating = ref(false);
  let run = 0;

  watch(shut, (closing) => {
    const node = el.value;
    if (cannotAnimate(node)) return; // `hidden` alone still gives the right end state
    const mine = ++run;
    return travel(
      node, closing,
      () => { animating.value = true; },
      () => { animating.value = false; },
      () => mine === run,
    );
  });

  return { animating };
}

/**
 * Doors for a keyed set — ApexAccordion, where each panel opens on its own and
 * a single-open accordion closes one while opening another.
 *
 * Bind as `:hidden="!isOpen(panel) && !animating(panel.value)"`, and hand each
 * body element in with `setEl` so the panel can be measured when its turn comes.
 */
export function useCollapseDoors<K>() {
  /* shallowRef, not ref: the Set is replaced wholesale on every change, and a
     deep ref would rewrite K as UnwrapRefSimple<K> and stop accepting the keys
     the caller actually has. */
  const moving = shallowRef<Set<K>>(new Set());
  const els = new Map<K, HTMLElement>();
  const runs = new Map<K, number>();

  const setEl = (key: K, node: HTMLElement | null) => {
    if (node) els.set(key, node);
    else els.delete(key);
  };

  const mark = (key: K, on: boolean) => {
    const next = new Set(moving.value);
    if (on) next.add(key); else next.delete(key);
    moving.value = next;
  };

  function open(key: K, closing: boolean) {
    const node = els.get(key) ?? null;
    if (cannotAnimate(node)) return;
    const mine = (runs.get(key) ?? 0) + 1;
    runs.set(key, mine);
    void travel(
      node, closing,
      () => mark(key, true),
      () => mark(key, false),
      () => runs.get(key) === mine,
    );
  }

  return { animating: (key: K) => moving.value.has(key), setEl, open };
}
