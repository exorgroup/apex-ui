<script setup lang="ts">
/**
 * The ApexEditor playground — AF2-286.
 *
 * `.data-stage`, not `.cfm-stage`: the editor is a full-width writing
 * surface and the shared stage caps its inner width at 420px, which is the
 * defect the user found in a screenshot during Phase A.
 */
import { ref } from 'vue';
import { ApexEditor } from '@exorgroup/apex-ui';
import { ED_RICH } from '../editorData';

defineProps<{ bind: Record<string, unknown> }>();

const doc = ref(JSON.parse(JSON.stringify(ED_RICH)));
const text = ref('');
</script>

<template>
  <div class="data-stage">
    <ApexEditor v-bind="bind" v-model:doc="doc" style="width:100%"
                @change="text = $event.text" />
    <p class="cfm-log">{{ text ? text.length + ' characters' : 'Empty' }}</p>
  </div>
</template>
