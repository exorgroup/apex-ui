<script setup lang="ts">
/**
 * ApexSidebar — a navigation panel that collapses to an icon rail or slides away
 * entirely, inside an ApexSidebarLayout.
 *
 * Width is one custom property, so collapsing, hovering open and the offcanvas
 * slide are all the same transition rather than three code paths. The panel
 * registers under an `id`, which is how ApexSidebarTrigger can live in a header
 * that is nowhere near it.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { __registerSidebar } from '../core/sidebar';

const props = withDefaults(defineProps<{
  /** Registry key a trigger targets. */
  id?: string;
  /** Bindable open state; also driven by the registry. */
  open?: boolean;
  /** sidebar is flush, floating is a detached card, inset pairs with an inset layout. */
  variant?: 'sidebar' | 'floating' | 'inset';
  /** icon keeps a rail of icons, offcanvas removes the panel, none is always open. */
  collapsible?: 'icon' | 'offcanvas' | 'none';
  side?: 'left' | 'right';
  /** Float over the content instead of pushing it. */
  overlay?: boolean;
  /** Expand an icon rail while the pointer is over it. */
  openOnHover?: boolean;
  /** Dim the page behind an overlay panel; clicking it closes. */
  backdrop?: boolean;
  width?: string;
  iconWidth?: string;
  /* colour */
  background?: string;
  borderColor?: string;
  textColor?: string;
  zIndex?: number;
}>(), {
  id: 'primary', variant: 'sidebar', collapsible: 'icon', side: 'left',
  width: '260px', iconWidth: '58px', zIndex: 40,
  /* Absent boolean props are cast to false, never undefined — see ApexPanel.
     Here that was worse than a dead fallback: `props.open ?? true` read false,
     so a sidebar nobody controlled opened closed, and the watcher pinned it. */
  open: undefined,
});

const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>();

const state = __registerSidebar(props.id, props.collapsible, props.open ?? true);
if (props.open !== undefined) state.open = props.open;
watch(() => props.open, (v) => { if (v !== undefined) state.open = v; });
watch(() => state.open, (v) => emit('update:open', v));
watch(() => props.collapsible, (v) => { state.collapsible = v; });

const hovering = ref(false);
const collapsed = computed(() => props.collapsible !== 'none' && !state.open);
/** An icon rail expanded by hover reads as open without changing the state. */
const peeking = computed(() => collapsed.value && props.collapsible === 'icon' && props.openOnHover && hovering.value);
/* Only `overlay` floats: an offcanvas panel with no overlay pushes the content,
   or the trigger that closes it ends up underneath the panel. */
const floatingOver = computed(() => props.overlay);

const rootStyle = computed(() => {
  const s: Record<string, string> = {
    '--sbar-w': props.width,
    '--sbar-iconw': props.iconWidth,
    /* A peeking rail must out-stack its neighbours: sibling panels share one
       z-index, so the LATER one in the DOM would paint over the expanded rail. */
    zIndex: String(peeking.value ? props.zIndex + 10 : props.zIndex),
  };
  if (props.background) s['--sbar-bg'] = props.background;
  if (props.borderColor) s['--sbar-border'] = props.borderColor;
  if (props.textColor) s['--sbar-fg'] = props.textColor;
  return s;
});

function close() { state.open = false; }
onBeforeUnmount(() => { hovering.value = false; });
</script>

<template>
  <aside class="apex-sbar" :style="rootStyle" :data-variant="variant" :data-side="side"
         :data-collapsible="collapsible" :data-collapsed="collapsed ? 'true' : 'false'"
         :data-peek="peeking ? 'true' : 'false'" :data-overlay="floatingOver ? 'true' : 'false'"
         @mouseenter="hovering = true" @mouseleave="hovering = false">
    <div class="apex-sbar__panel">
      <div v-if="$slots.header" class="apex-sbar__head"><slot name="header" :collapsed="collapsed && !peeking" /></div>
      <div class="apex-sbar__body"><slot :collapsed="collapsed && !peeking" /></div>
      <div v-if="$slots.footer" class="apex-sbar__foot"><slot name="footer" :collapsed="collapsed && !peeking" /></div>
    </div>
  </aside>
  <div v-if="backdrop && floatingOver && state.open" class="apex-sbar__backdrop"
       :style="{ zIndex: String(zIndex - 1) }" @click="close"></div>
</template>
