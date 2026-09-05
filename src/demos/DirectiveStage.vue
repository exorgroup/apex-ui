<template>
  <!-- One branch per directive, because a Vue template cannot take a dynamic
       directive name. The alternative — a render function with
       withDirectives() and a lookup — buys nothing at four of them and hides
       what each host actually is. -->
  <div class="dir-stage">
    <button
      v-if="id === 'ripple'"
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

    <!-- AnimateOnScroll needs somewhere to scroll from, so the card starts
         below the fold of its own scroller rather than already in view. -->
    <div v-else-if="id === 'animateonscroll'" class="dir-scroller">
      <p class="dir-hint">Scroll down ↓</p>
      <div class="dir-gap"></div>
      <div v-apex-animate-on-scroll="bind" class="dir-host dir-host--card">{{ label }}</div>
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
defineProps<{
  /** The registry id, which decides which directive is applied. */
  id: string;
  /** Live options from the playground rail, passed as the binding value. */
  bind?: Record<string, unknown>;
  /** Text for the host element. */
  label?: string;
}>();
</script>
