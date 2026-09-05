<template>
  <div class="dyn-demo">
    <p v-if="note">{{ note }}</p>
    <ul class="dyn-list">
      <li v-for="c in cities" :key="c.value">
        <button type="button" @click="pick(c)">
          <strong>{{ c.label }}</strong><em>{{ c.help }}</em>
        </button>
      </li>
    </ul>
    <ApexButton
      severity="secondary"
      variant="text"
      size="sm"
      icon="layers"
      @click="openNested"
    >Open another over this one</ApexButton>
  </div>
</template>

<script setup lang="ts">
/**
 * The component the ApexDynamicDialog examples open. Ported from the gallery's
 * CityPickerDemo, which does more than the version this replaced.
 *
 * It knows nothing about dialogs beyond the injected `dialogRef`: no visible
 * state, no header, no close button of its own. That is the point of the
 * service, and it only shows if the demo opens a real component rather than
 * inlining markup.
 *
 * Between them, the three things it does cover every option worth showing:
 *
 *   `note` arrives through contentProps — a prop of this component, distinct
 *   from the ApexDialog props that make the frame around it.
 *
 *   `cities` arrives through data, read off dialogRef.
 *
 *   openNested opens another of itself, with its own header, position and
 *   note. That is what makes the stack real: the second dialog is opened from
 *   inside the first, which is what a picker-over-a-form actually is, and each
 *   instance keeps its own options and z-index.
 *
 * Closing passes the whole city object rather than a label, so onClose shows
 * what a real caller would receive.
 */
import { inject, computed } from 'vue';
import { useApexDialog } from '@exorgroup/apex-ui';
/* Self-import: openNested opens this very component, and a <script setup>
   block has no other way to name itself. Vue resolves the cycle. */
import CityPicker from './CityPicker.vue';

defineProps<{
  /** Arrives through contentProps, not through the dialog's own props. */
  note?: string;
}>();

interface City { value: string; label: string; help: string }

/** What the service provides per dialog. `data` is whatever open() was given. */
interface DialogRef {
  data?: { cities?: City[] };
  close: (value?: unknown) => void;
}

const dialogRef = inject<DialogRef | null>('dialogRef', null);
const dlg = useApexDialog();

const cities = computed<City[]>(() => dialogRef?.data?.cities ?? []);

function pick(c: City) {
  dialogRef?.close(c);
}

function openNested() {
  dlg.open(CityPicker, {
    props: { header: 'A dialog over a dialog', position: 'topright', width: '320px' },
    contentProps: { note: 'Each instance keeps its own options and z-index.' },
    data: { cities: cities.value.slice(0, 3) },
  });
}
</script>
