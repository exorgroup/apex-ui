<template>
  <div class="ovl-stage">
    <!-- A popover anchors to the event that opened it, so the trigger is the
         anchor and nothing has to hold state. -->
    <template v-if="id === 'popover'">
      <ApexButton icon="info" @click="pop?.toggle($event)">Show popover</ApexButton>
      <ApexPopover ref="pop" v-bind="bind">
        <p class="ovl-stage__text">
          The rail's props are live on this panel — change <code>side</code> or
          <code>width</code> and reopen it.
        </p>
      </ApexPopover>
    </template>

    <!-- Drawer and dialog are both v-model:visible, so one trigger and one
         binding serve them; only the tag differs. -->
    <template v-else-if="id === 'drawer'">
      <ApexButton icon="menu" @click="open = true">Open drawer</ApexButton>
      <ApexDrawer v-model:visible="open" v-bind="bind">
        <p class="ovl-stage__text">
          Close it from the header button, the mask, or Escape — whichever the
          rail leaves enabled.
        </p>
      </ApexDrawer>
    </template>

    <!-- A toast container renders an empty stack until something is queued,
         so the stage needs both a trigger and its own container. The group
         keeps these out of the app-root host and vice versa: without it the
         page would show each toast twice, once in each. -->
    <template v-else-if="id === 'toast'">
      <div class="ovl-stage__row">
        <ApexButton @click="addStageToast()">Add toast</ApexButton>
        <ApexButton
          severity="secondary"
          variant="outlined"
          @click="toast.removeAll('stage')"
        >Clear all</ApexButton>
      </div>
      <p class="ovl-stage__text">
        Toasts land in the stack this container places, which follows the rail — change
        <code>position</code> or <code>mode</code> and add another.
      </p>
      <ApexToast v-bind="bind" group="stage" />
    </template>

    <template v-else-if="id === 'dialog'">
      <ApexButton icon="open_in_new" @click="open = true">Open dialog</ApexButton>
      <ApexDialog v-model:visible="open" v-bind="bind">
        <p class="ovl-stage__text">
          Close it from the header button, the mask, or Escape — whichever the
          rail leaves enabled.
        </p>
      </ApexDialog>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for the three overlays.
 *
 * None of them renders until something opens it, so a stage that just binds
 * the rail's props to the tag would show an empty box and every control would
 * look inert. Each needs a trigger, and the popover needs its trigger to be
 * the anchor as well — which is why this is not one shared branch.
 *
 * Kept out of App.vue for the same reason ContainerStage and DirectiveStage
 * are: three host-shaped special cases, none of which is about the page.
 */
import { ref, watch } from 'vue';
import { ApexPopover, useApexToast } from '@exorgroup/apex-ui';

const props = defineProps<{
  /** The registry id, which decides which overlay is shown. */
  id: string;
  /** Live props from the playground rail, bound to the overlay. */
  bind?: Record<string, unknown>;
}>();

/** The drawer's and dialog's open state; the popover drives itself. */
const open = ref(false);

/** The popover's ref, since it is opened by calling toggle() on it. */
const pop = ref<InstanceType<typeof ApexPopover> | null>(null);

/**
 * The toast stage's own queue calls.
 *
 * Every toast carries group 'stage' so it can only land in this container,
 * and `removeAll('stage')` clears only these — a bare removeAll() would also
 * wipe whatever the app's own host is showing.
 */
const toast = useApexToast();
let stageSeq = 0;
const STAGE_TONES = ['success', 'info', 'warn', 'error'] as const;
function addStageToast() {
  stageSeq += 1;
  toast.add({
    group: 'stage',
    severity: STAGE_TONES[stageSeq % STAGE_TONES.length],
    summary: `Toast ${stageSeq}`,
    detail: 'Queued from the stage trigger.',
  });
}

/*
 * Close on the way out.
 *
 * A drawer or dialog left open while the sidebar switches pages would keep
 * its mask over the next page, which locks scroll on a page that has no way
 * to dismiss it — the trigger that opened it is gone.
 */
watch(() => props.id, () => { open.value = false; });
</script>
