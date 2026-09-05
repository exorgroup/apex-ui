<template>
  <div class="svc-stage">
    <div class="svc-buttons">
      <ApexButton @click="fire">{{ spec.trigger || 'Show' }}</ApexButton>
      <ApexButton
        v-for="[label, method] in spec.extras || []"
        :key="method"
        variant="outlined"
        severity="secondary"
        @click="call(method)"
      >{{ label }}</ApexButton>
    </div>
    <p class="svc-hint">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * The playground stage for a service-backed control.
 *
 * These have no tag to render, so there is nothing to put in the stage the way
 * a component or even a directive has. What the stage holds instead is the
 * trigger: the rail assembles an options object, this fires the call, and the
 * result appears wherever the singleton host is — which is the app root, not
 * here. That is not a shortcoming of the demo, it is how the control works,
 * and a stage that faked a contained preview would teach the wrong thing.
 *
 * The hint says so out loud, because an empty-looking stage otherwise reads as
 * a broken page.
 */
import { computed } from 'vue';
import { useApexToast, useApexAlert, useApexDialog } from '@exorgroup/apex-ui';
import type { ServiceSpec } from '../registry';

const props = defineProps<{
  /** Which composable and method to call. */
  spec: ServiceSpec;
  /** Live options from the playground rail, passed as the call's argument. */
  bind?: Record<string, unknown>;
  /** Shown under the buttons, to say where the result will appear. */
  hint?: string;
}>();

/* A fixed map rather than a dynamic import: there are three of them, the set
   is known at build time, and a string-keyed import would defeat tree-shaking
   and typechecking both. */
const SERVICES: Record<string, () => Record<string, any>> = {
  useApexToast,
  useApexAlert,
  useApexDialog,
};

const service = computed(() => {
  const factory = SERVICES[props.spec.composable];
  if (!factory) throw new Error(`unknown service ${props.spec.composable}`);
  return factory();
});

/** Fire the documented method with whatever the rail currently holds. */
function fire() {
  call(props.spec.method, { ...(props.bind ?? {}) });
}

function call(method: string, arg?: unknown) {
  const fn = service.value[method];
  if (typeof fn !== 'function') throw new Error(`${props.spec.composable} has no ${method}()`);
  fn(arg);
}
</script>
