<script setup lang="ts">
/**
 * The ApexHTMLEditor playground — AF2-286.
 *
 * The toolbar slot is the gallery's own: the style vocabulary is a picker,
 * so it opens on demand rather than sitting above every document, and the
 * markup toggle stays out of it because a view toggle is not a style.
 */
import { ref } from 'vue';
import { ApexHTMLEditor } from '@exorgroup/apex-ui';
import { HED_STYLES, HED_PLAYGROUND } from '../editorData';

defineProps<{ bind: Record<string, unknown> }>();

const html = ref(HED_PLAYGROUND);
const pgStylesOpen = ref(false);
</script>

<template>
  <div class="data-stage">
    <ApexHTMLEditor v-bind="bind" v-model:html="html"
                      :styles="HED_STYLES">
      <template #toolbar="{ blockStyles, apply, clear, sourceOpen, toggleSource }">
        <!-- same disclosure as the main demo: the style vocabulary is a
             picker, so it opens on demand rather than sitting above every
             document. Markup stays out, being a view toggle, not a style -->
        <div class="apex-hed__styles">
          <button type="button" class="apex-hed__style" data-scope="disclosure"
                  :data-on="pgStylesOpen ? 'true' : 'false'"
                  :aria-expanded="pgStylesOpen ? 'true' : 'false'"
                  @click="pgStylesOpen = !pgStylesOpen">
            <ApexIcon name="palette" :size="16"></ApexIcon>Styles
          </button>
          <button type="button" class="apex-hed__style"
                  @click="toggleSource()">{{ sourceOpen ? 'Page' : 'Markup' }}</button>
        </div>
        <div v-show="pgStylesOpen" class="apex-hed__styles">
          <button v-for="s in blockStyles" :key="s.className" type="button"
                  class="apex-hed__style" :style="s.preview" @click="apply(s)">{{ s.label }}</button>
          <button type="button" class="apex-hed__style" @click="clear('block')">None</button>
        </div>
      </template>
    </ApexHTMLEditor>
  </div>
</template>
