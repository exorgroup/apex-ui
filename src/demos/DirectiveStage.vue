<template>
  <!-- One branch per directive, because a Vue template cannot take a dynamic
       directive name. The alternative — a render function with
       withDirectives() and a lookup — buys nothing at four of them and hides
       what each host actually is. -->
  <div class="dir-stage">
    <!-- A tooltip needs something to point at and a reason to hover it. -->
    <ApexButton
      v-if="id === 'tooltip'"
      v-apex-tooltip="bind"
      severity="secondary"
      variant="outlined"
    >{{ label }}</ApexButton>

    <button
      v-else-if="id === 'ripple'"
      v-apex-ripple="bind"
      type="button"
      class="dir-host dir-host--press"
    >{{ label }}</button>

    <!-- StyleClass acts on a target elsewhere in the page, so the stage needs
         both halves: the trigger carrying the directive, and the panel it
         toggles. Without the panel the directive has nothing to point at. -->
    <template v-else-if="id === 'styleclass'">
      <button
        v-apex-style-class="{ ...bind, selector: '#dir-target' }"
        type="button"
        class="dir-host dir-host--press"
      >{{ label }}</button>
      <div id="dir-target" class="dir-target">The target element</div>
    </template>

    <!-- A trap is only observable if there is more than one thing to tab
         between, so the host holds three. -->
    <div v-else-if="id === 'focustrap'" v-apex-focus-trap="bind" class="dir-host dir-host--panel">
      <ApexInput model-value="" placeholder="First field" />
      <ApexInput model-value="" placeholder="Second field" />
      <ApexButton size="sm">Submit</ApexButton>
    </div>

    <!-- AnimateOnScroll needs somewhere to scroll from, so the cards start
         below the fold of their own scroller rather than already in view, with
         empty space after them too — otherwise they can be scrolled into view
         but never back out, and the leave animation never plays.

         Three things here are the stage's business rather than the rail's:

         `root` pins the observer to this scroller. Left off, it observes the
         viewport, and then `threshold` and `rootMargin` are measured against
         the window rather than the panel being scrolled — the two controls
         would appear to do nothing.

         `key` rebuilds the cards when an option changes. A threshold lives
         inside the IntersectionObserver, which is constructed once on mount;
         the directive's `updated` hook can swap the classes but cannot change
         the observer. Without a remount those two controls really are inert. -->
    <div v-else-if="id === 'animateonscroll'" id="dir-scroller" class="dir-scroller">
      <p class="dir-hint">Scroll down ↓</p>
      <div class="dir-gap"></div>
      <div class="dir-row">
        <div
          v-for="n in 3"
          :key="`${optionKey}-${n}`"
          v-apex-animate-on-scroll="{ ...bind, root: '#dir-scroller' }"
          class="dir-host dir-host--card"
        >
          <strong>{{ label }} {{ n }}</strong>
          <span class="dir-note">Enters on scroll</span>
        </div>
      </div>
      <div class="dir-gap"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for the four directives.
 *
 * A directive has no tag of its own: it needs a host element to sit on, and in
 * two cases something more than that — StyleClass needs a target to act upon,
 * and AnimateOnScroll needs a scroller to be scrolled within. Putting those
 * here keeps four host-shaped special cases out of App.vue, the same way
 * ContainerStage keeps the nine containers' sample content out of it.
 *
 * `bind` is the live options object from the playground rail, handed straight
 * to the directive — which is how a directive is used in practice, so the demo
 * and the usage snippet above it agree.
 */
import { computed } from 'vue';

const props = defineProps<{
  /** The registry id, which decides which directive is applied. */
  id: string;
  /** Live options from the playground rail, passed as the binding value. */
  bind?: Record<string, unknown>;
  /** Text for the host element. */
  label?: string;
}>();

/**
 * Changes to any AnimateOnScroll option, as a string — used as a :key so the
 * cards remount and the directive runs again from scratch.
 *
 * Needed because the observer is built once, in the directive's `mounted`
 * hook. `updated` can replace the stored classes, so enterClass, leaveClass
 * and once take effect live; threshold and rootMargin cannot, because both are
 * arguments to the IntersectionObserver constructor and are fixed for its
 * lifetime. Remounting is the honest way to show a new threshold, and is
 * cheap for three cards.
 */
const optionKey = computed(() => JSON.stringify(props.bind ?? {}));
</script>
