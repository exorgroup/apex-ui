<script setup lang="ts">
/**
 * The form the locality chooser opens.
 *
 * It contains a chooser of its own — countries — which also offers Add new.
 * Using it opens a SECOND dialog above this one, which is the whole cascaded
 * case: nothing here manages z-index or stacking, because useApexDialog
 * already does.
 */
import { inject, reactive, ref } from 'vue';
import { useApexDialog } from '@exorgroup/apex-ui';
import CountryForm from './CountryForm.vue';

const props = defineProps<{ name?: string; parent?: string }>();

/* Plain object, not a ref: dialogRef.close(), no .value. */
const dialogRef = inject<{ close: (data?: unknown) => void }>('dialogRef');
const dialog = useApexDialog();

const countries = ref([
  { value: 'mt', label: 'Malta' },
  { value: 'it', label: 'Italy' },
]);
const form = reactive({ label: props.name ?? '', country: null as string | null });

/** The same handler shape as the outer chooser — this is the cascade. */
function createCountry({ query }: { query: string }) {
  dialog.open(CountryForm, {
    props: { header: 'New country', width: '380px', modal: true },
    contentProps: { name: query },
    onClose: ({ data }) => {
      const rec = data as { value: string; label: string } | undefined;
      if (!rec) return;
      countries.value.push(rec);
      form.country = rec.value;
    },
  });
}

function save() {
  if (!form.label.trim()) return;
  dialogRef?.close({
    value: form.label.toLowerCase().replace(/\s+/g, '-'),
    label: form.label.trim(),
  });
}
</script>

<template>
  <div class="demo-form">
    <p v-if="parent" class="demo-form__hint">
      Adding under <strong>{{ parent }}</strong> — the cascade told the handler
      which branch its row came from.
    </p>
    <ApexInput v-model="form.label" label="Locality" placeholder="e.g. Sliema" />

    <!-- A chooser inside the dialog, offering Add new of its own. -->
    <ApexSelect v-model="form.country" :options="countries" label="Country"
                placeholder="Choose a country" filter add-new
                add-new-label="Add a country" @add-new="createCountry" />

    <p class="demo-form__hint">
      Try Add a country — the second dialog opens above this one, and its record
      comes back here.
    </p>

    <div class="demo-form__actions">
      <ApexButton severity="secondary" variant="text" @click="dialogRef?.close()">Cancel</ApexButton>
      <ApexButton :disabled="!form.label.trim()" @click="save">Save locality</ApexButton>
    </div>
  </div>
</template>
