<script setup lang="ts">
/** ApexErrorSummary — the top-of-form error list. Clicking an entry focuses its control. */
import ApexIcon from './ApexIcon.vue';
import { useApexI18n } from '../core/i18n';

defineProps<{ errors?: Record<string, string>; title?: string }>();
const t = useApexI18n();

function focusField(key: string) {
  const el = document.querySelector<HTMLElement>(`[name="${key}"], #${CSS.escape(key)}`);
  el?.focus();
}
</script>

<template>
  <div v-if="errors && Object.keys(errors).length" class="apex-summary" role="alert" tabindex="-1">
    <ApexIcon name="error" class="apex-summary__icon" />
    <div>
      <h3>{{ title || t('apexui.errorSummaryTitle') }}</h3>
      <ul>
        <li v-for="(msg, key) in errors" :key="key">
          <a :href="`#${key}`" @click.prevent="focusField(String(key))">{{ msg }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>
