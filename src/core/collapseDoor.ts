import { nextTick, ref, watch } from 'vue';
import type { Ref } from 'vue';

/**
 * The collapse animation shared by ApexPanel and ApexFieldset.
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

/**
 * Animates `el` whenever `shut` changes.
 *
 * The returned `animating` flag must keep the `hidden` attribute OFF while the
 * door moves — bind it as `:hidden="shut && !animating"` — or the content is
 * gone before it has travelled anywhere.
 *
 * A caller whose element declares its own `display` also needs a
 * `[hidden]{display:none}` rule: an author display beats the user-agent one and
 * the attribute stops hiding anything. tests/zz-hidden-reset.spec.ts checks that.
 */
export function useCollapseDoor(shut: Ref<boolean>, el: Ref<HTMLElement | null>) {
  const animating = ref(false);
  let run = 0;

  watch(shut, async (closing) => {
    const node = el.value;
    /* No element, no Web Animations (happy-dom), or reduced motion: `hidden`
       alone still gives the correct end state. */
    if (!node || typeof node.animate !== 'function' || !wantsMotion()) return;

    const mine = ++run;
    /* Closing can measure now, while the region is still laid out. Opening has
       to wait for `hidden` to come off, which `animating` does on the next tick. */
    animating.value = true;
    if (!closing) await nextTick();
    const natural = node.scrollHeight;
    if (mine !== run) return;

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
    if (mine !== run) return;

    /* Drop `animating` first, then wait for the render that applies `hidden`,
       and only then release the held height — so nothing is ever visible at full
       height while the container is meant to be shut. */
    animating.value = false;
    await nextTick();
    if (mine !== run) return;
    anim.cancel();
    node.style.overflow = '';
  });

  return { animating };
}
