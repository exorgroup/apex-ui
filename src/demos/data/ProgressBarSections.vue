<template>
  <h2>Severity and thresholds</h2>
  <div class="card" style="display:flex;flex-direction:column;gap:16px;max-width:520px">
    <ApexProgressBar :value="24" show-value severity="danger" label="Storage" />
    <ApexProgressBar :value="58" show-value severity="warning" label="Bandwidth" />
    <ApexProgressBar :value="91" show-value severity="success" label="Uptime" />
    <span class="cell__tag">severity="auto" — the same three, tinted by threshold</span>
    <ApexProgressBar v-for="v in [24,58,91]" :key="v" :value="v" show-value severity="auto" />
  </div>

  <h2>Thickness, colour and readout</h2>
  <div class="card" style="display:flex;flex-direction:column;gap:18px;max-width:520px">
    <ApexProgressBar :value="72" :height="4" />
    <ApexProgressBar :value="72" :height="12" show-value />
    <ApexProgressBar :value="72" :height="22" show-value color="#0F141C" track-color="#E8ECF2" />
    <ApexProgressBar :value="8" :height="12" show-value />
    <ApexProgressBar :value="72" :height="10" show-value value-position="end" radius="2px" />
  </div>

  <h2>Dynamic</h2>
  <p style="font-size:13.5px">The value is reactive, so a bar follows whatever drives it. The width transition is on the fill, which means a jump from 10% to 90% animates rather than snapping.</p>
  <div class="card" style="max-width:520px;display:flex;flex-direction:column;gap:12px">
    <ApexProgressBar :value="pbLive" show-value />
    <div class="iconstrip">
      <ApexButton size="sm" @click="startPb">Run</ApexButton>
      <ApexButton size="sm" severity="secondary" variant="outlined" @click="pbLive = 0; stopPb()">Reset</ApexButton>
    </div>
  </div>

  <h2>Indeterminate</h2>
  <p style="font-size:13.5px"><code>mode="indeterminate"</code> sweeps left to right for work with nothing to measure. The sweep animates a margin rather than a transform, so it travels the track's own width whatever the container does; <code>sweepDuration</code> sets its pace.</p>
  <div class="card" style="max-width:520px;display:flex;flex-direction:column;gap:18px">
    <ApexProgressBar mode="indeterminate" label="Loading" />
    <ApexProgressBar mode="indeterminate" :height="6" color="var(--fg-default)" radius="2px" sweep-duration="2.4s" />
    <ApexProgressBar mode="indeterminate" :height="14" severity="success" striped animated-stripes />
  </div>

  <h2>As steps</h2>
  <p style="font-size:13.5px"><code>steps</code> with a <code>step</code> index derives the percentage from the sequence, so the caller says where it is rather than converting that to a number. The current step's name shows above the bar and doubles as the accessible name.</p>
  <div class="card" style="max-width:520px;display:flex;flex-direction:column;gap:14px">
    <ApexProgressBar :steps="PB_STEPS" :step="pbStep" show-value />
    <div class="iconstrip">
      <ApexButton size="sm" severity="secondary" variant="outlined" :disabled="pbStep === 0"
                   @click="pbStep = Math.max(0, pbStep - 1)">Back</ApexButton>
      <ApexButton size="sm" :disabled="pbStep >= PB_STEPS.length - 1"
                   @click="pbStep = Math.min(PB_STEPS.length - 1, pbStep + 1)">Next step</ApexButton>
      <span style="font-size:13px;color:var(--fg-subtle)">Step {{ pbStep + 1 }} of {{ PB_STEPS.length }}</span>
    </div>
  </div>

  <h2>Template</h2>
  <p style="font-size:13.5px">The <code>label</code> slot is a row above the bar and the <code>value</code> slot replaces the readout, so several bars can share one number and format it differently — bytes, time remaining, or a status word.</p>
  <div class="card" style="max-width:520px;display:flex;flex-direction:column;gap:20px">
    <ApexProgressBar :value="pbLive" :height="6" fill-radius="999px">
      <template #label="{ formatted }"><span>Basic percentage</span><span>{{ formatted }}</span></template>
    </ApexProgressBar>
    <ApexProgressBar :value="pbLive" :height="6" color="#10B981" fill-radius="999px">
      <template #label="{ percent }">
        <span>File size</span><span>{{ (percent * 0.05).toFixed(2) }} MB / 5.00 MB</span>
      </template>
    </ApexProgressBar>
    <ApexProgressBar :value="pbLive" :height="6" color="oklch(0.55 0.20 300)" fill-radius="999px">
      <template #label="{ percent }">
        <span>Time remaining</span><span>{{ Math.max(0, Math.round((100 - percent) / 4)) }}s left</span>
      </template>
    </ApexProgressBar>
    <ApexProgressBar :value="pbLive" :height="6" color="#F97316" fill-radius="999px">
      <template #label="{ percent }">
        <span>Upload status</span>
        <span>{{ percent >= 100 ? 'Upload complete' : (percent > 50 ? 'Uploading\u2026' : 'Starting\u2026') }}</span>
      </template>
    </ApexProgressBar>
    <ApexProgressBar :value="pbLive" :height="20" show-value value-size="12px" striped>
      <template #value="{ percent }">{{ percent.toFixed(1) }}% done</template>
    </ApexProgressBar>
  </div>
</template>

<script setup lang="ts">
/**
 * The worked examples for ApexProgressBar.
 *
 * Ported from the gallery's own section block (APEX UI Gallery.html), which is
 * what the gallery actually runs. Its state lived on one enormous Options-API
 * instance shared by every control; here each control's examples own theirs,
 * which is the point of the split — App.vue was already 10,500 lines before
 * the nine data controls had a single section between them.
 */
import { onBeforeUnmount, ref } from 'vue';

const PB_STEPS = ['Order placed', 'Payment confirmed', 'Packed', 'In transit', 'Delivered'];
const pbLive = ref(0);
const pbStep = ref(1);

/**
 * The "Dynamic" example's ticker.
 *
 * The interval is cleared on unmount as well as on stop: the docs app swaps
 * pages without reloading, so a timer left running keeps ticking against a
 * component nobody can see and the next visit starts two of them.
 */
let pbTimer: ReturnType<typeof setInterval> | null = null;

function stopPb() {
  if (pbTimer) { clearInterval(pbTimer); pbTimer = null; }
}

function startPb() {
  stopPb();
  pbLive.value = 0;
  pbTimer = setInterval(() => {
    pbLive.value = Math.min(100, pbLive.value + 4);
    if (pbLive.value >= 100) stopPb();
  }, 180);
}

onBeforeUnmount(stopPb);
</script>
