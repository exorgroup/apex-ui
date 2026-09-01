<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { ENTRIES, LABEL_PLACEMENTS, SIZES, TONE_CASES } from './registry';

const current = ref('input');
const theme = ref<'light' | 'dark'>('light');
const rtl = ref(false);
const model = reactive<Record<string, unknown>>({});

const entry = computed(() => ENTRIES.find((e) => e.id === current.value)!);
const groups = computed(() => {
  const out: Array<{ name: string; items: typeof ENTRIES }> = [];
  ENTRIES.forEach((e) => {
    let g = out.find((x) => x.name === e.group);
    if (!g) { g = { name: e.group, items: [] }; out.push(g); }
    g.items.push(e);
  });
  return out;
});

watch(current, (id) => {
  const e = ENTRIES.find((x) => x.id === id)!;
  model[id] = JSON.parse(JSON.stringify(e.model ?? null));
}, { immediate: true });

watch(theme, (v) => {
  document.documentElement.classList.toggle('dark', v === 'dark');
  document.documentElement.classList.toggle('light', v === 'light');
}, { immediate: true });

watch(rtl, (v) => document.documentElement.setAttribute('dir', v ? 'rtl' : 'ltr'), { immediate: true });

const clean = (extra: Record<string, unknown> = {}) => ({ ...(entry.value.base || {}), ...extra });
</script>

<template>
  <div class="docs">
    <aside class="side">
      <div class="brand"><b>APEX UI</b><span>v0.1.0</span></div>
      <nav>
        <div v-for="g in groups" :key="g.name" class="navgroup">
          <h4>{{ g.name }}</h4>
          <button v-for="e in g.items" :key="e.id" class="navitem"
                  :aria-current="current === e.id ? 'true' : 'false'" @click="current = e.id">{{ e.name }}</button>
        </div>
      </nav>
    </aside>

    <main>
      <div class="topbar">
        <ApexSegmented v-model="theme" label-placement="hidden" label="Theme" size="sm"
                       :options="[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]" />
        <ApexSwitch v-model="rtl" label="RTL" size="sm" />
      </div>

      <div class="page">
        <h1>{{ entry.name }}</h1>
        <p class="blurb">{{ entry.blurb }}</p>

        <div class="card">
          <ApexButton v-if="entry.noField" v-bind="entry.base">Save changes</ApexButton>
          <component v-else :is="entry.name" v-model="model[entry.id]" v-bind="entry.base" />
        </div>

        <h2>Props</h2>
        <table class="doc-table">
          <thead><tr><th>Prop</th><th>Type</th></tr></thead>
          <tbody><tr v-for="r in entry.props" :key="r[0]"><td>{{ r[0] }}</td><td>{{ r[1] }}</td></tr></tbody>
        </table>

        <h2>Events</h2>
        <table class="doc-table">
          <thead><tr><th>Event</th><th>Payload</th></tr></thead>
          <tbody><tr v-for="r in entry.events" :key="r[0]"><td>{{ r[0] }}</td><td>{{ r[1] }}</td></tr></tbody>
        </table>

        <template v-if="!entry.noField">
          <h2>Label placement</h2>
          <div class="grid">
            <div v-for="p in LABEL_PLACEMENTS" :key="p" class="cell">
              <span class="cell__tag">labelPlacement="{{ p }}"</span>
              <component :is="entry.name" :model-value="entry.model" v-bind="clean()" :label-placement="p" label-width="110px" />
            </div>
          </div>

          <h2>Tone and messages</h2>
          <div class="grid">
            <div v-for="c in TONE_CASES" :key="c.label" class="cell">
              <span class="cell__tag">{{ c.label }}</span>
              <component :is="entry.name" :model-value="c.empty ? null : entry.model" v-bind="clean(c.bind)" />
            </div>
          </div>

          <h2>Sizes</h2>
          <div class="grid">
            <div v-for="s in SIZES" :key="s" class="cell">
              <span class="cell__tag">size="{{ s }}"</span>
              <component :is="entry.name" :model-value="entry.model" v-bind="clean()" :size="s" />
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
