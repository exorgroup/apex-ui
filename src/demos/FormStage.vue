<script setup lang="ts">
/**
 * The ApexForm playground — AF2-294.
 *
 * `shell: 'page'` is fixed rather than offered, and deliberately: a modal is
 * `position: fixed; inset: 0`, so in a docs stage it would cover the nav and
 * every section of its own page. The modal shell is shown in a worked
 * example that opens and closes it instead.
 *
 * `.data-stage`, not `.cfm-stage`: a form is full width, and the shared
 * stage caps its inner width at 420px — the defect a screenshot caught in
 * Phase A.
 */
import { ref } from 'vue';
import { ApexForm } from '@exorgroup/apex-ui';
import { FORM_SCHEMA, FORM_MODEL } from '../formData';

defineProps<{ bind: Record<string, unknown> }>();

const model = ref(JSON.parse(JSON.stringify(FORM_MODEL)));
const log = ref('');

function note(what: string, payload?: unknown) {
  const detail = payload && typeof payload === 'object' && 'key' in (payload as object)
    ? ' ' + String((payload as { key: unknown }).key)
    : '';
  log.value = what + detail;
}
</script>

<template>
  <div class="data-stage">
    <ApexForm v-bind="bind" :schema="FORM_SCHEMA" v-model="model" shell="page"
              @submit="note('submit')" @cancel="note('cancel')"
              @field-change="note('field-change', $event)" />
    <p class="cfm-log">
      {{ log || 'Clear Name and press Save changes — the section turns red, carries a count, and lists its errors.' }}
    </p>
  </div>
</template>
