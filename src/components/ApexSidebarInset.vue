<script setup lang="ts">
/** ApexSidebarInset — the content region beside the panels. */
defineProps<{ scroll?: boolean }>();
</script>

<template>
  <div class="apex-sbar-inset" :data-scroll="scroll ? 'true' : 'false'"><slot /></div>
</template>
