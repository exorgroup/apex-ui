<template>
  <h2>Basic</h2>
  <p style="font-size:13.5px">The model is <code>[source, target]</code>. Click a row to pick it, Cmd-click to add to the pick, then use the centre arrows — or drag a row into the other list.</p>
  <div class="card" style="max-width:none;margin-top:12px">
    <ApexPickList v-model="pick2" data-key="id" source-header="Roster" target-header="On call">
      <template #option="{ item }">
        <span class="pl-row">
          <ApexIcon :name="item.icon" :size="18" />
          <span class="pl-row__text"><strong>{{ item.name }}</strong><em>{{ item.role }}</em></span>
        </span>
      </template>
    </ApexPickList>
  </div>

  <h2>Checkbox, filter and custom headers</h2>
  <p style="font-size:13.5px"><code>checkbox</code> adds a box per row and a select-all in the header, and still allows dragging. <code>filter</code> gives each list its own search. The <code>sourceheader</code> and <code>targetheader</code> slots replace the header content entirely.</p>
  <div class="card" style="max-width:none;margin-top:12px">
    <ApexPickList v-model="pick3" data-key="id" checkbox filter :scroll-height="240"
                    @move-to-target="onPickMove($event, 'team')">
      <template #sourceheader>
        <span class="pl-head"><ApexIcon name="group" :size="17" /> Candidates
          <span class="apex-dt__badge" data-tone="neutral">{{ pick3[0].length }}</span></span>
      </template>
      <template #targetheader>
        <span class="pl-head"><ApexIcon name="verified" :size="17" /> Approved
          <span class="apex-dt__badge" data-tone="success">{{ pick3[1].length }}</span></span>
      </template>
      <template #option="{ item }">
        <span class="pl-row">
          <ApexIcon :name="item.icon" :size="18" />
          <span class="pl-row__text"><strong>{{ item.name }}</strong><em>{{ item.role }}</em></span>
        </span>
      </template>
    </ApexPickList>
  </div>
  <p style="font-size:13px;margin-top:8px">Last move: <code>{{ pickLog || 'none yet' }}</code></p>

  <h2>Layout and colours</h2>
  <p style="font-size:13.5px">Reorder controls are opt-in with <code>showSourceControls</code> and <code>showTargetControls</code>. <code>controlsPosition="outside"</code> keeps each stack clear of the centre — source on the left, target on the right; <code>start</code> or <code>end</code> puts both on one side. The transfer stack can sit between the lists or after both, and the panels can stack vertically.</p>
  <div class="card" style="max-width:none;margin-top:12px">
    <ApexPickList v-model="pick4" data-key="id" show-source-controls show-target-controls
                    controls-position="outside" :scroll-height="200"
                    border-color="#0F141C" :border-width="2" radius="16px"
                    header-background="#0F141C" header-color="#ECEFF4"
                    selected-background="#FFF1E5" selected-color="#6F2A03" selected-border-color="#C24A06"
                    source-header="Warehouse" target-header="Deployed" no-drag>
      <template #option="{ item }"><span class="pl-row"><strong>{{ item.name }}</strong></span></template>
    </ApexPickList>
  </div>
  <div class="card" style="max-width:none;margin-top:18px">
    <span class="cell__tag">stacked</span>
    <ApexPickList v-model="pick5" data-key="id" stacked
                    :scroll-height="150" source-header="Unassigned" target-header="Assigned">
      <template #option="{ item }"><span class="pl-row"><strong>{{ item.name }}</strong></span></template>
    </ApexPickList>
  </div>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexPickList.
 *
 * Ported from the gallery's own section block (APEX UI Gallery.html), which is
 * what the gallery actually runs. Its state lived on one enormous Options-API
 * instance shared by every control; here each control's examples own theirs,
 * which is the point of the split — App.vue was already 10,500 lines before
 * the nine data controls had a single section between them.
 */
import { ref } from 'vue';
import { TEAM } from '../../registry';

/* Four independent models: an example that shared one with the stage would
   have the reader's drag on this page move rows in the playground above. */
const pick2 = ref<unknown[][]>([TEAM.slice(0, 5), []]);
const pick3 = ref<unknown[][]>([TEAM.slice(0, 6), TEAM.slice(6, 8)]);
const pick4 = ref<unknown[][]>([TEAM.slice(0, 4), TEAM.slice(4, 7)]);
const pick5 = ref<unknown[][]>([TEAM.slice(0, 4), TEAM.slice(4, 6)]);
const pickLog = ref('');

function onPickMove(payload: { items: { name: string }[] }, where: string) {
  pickLog.value = payload.items.map((i) => i.name).join(', ') + ' → ' + where;
}
</script>
