<script setup lang="ts">
useHead({
  title: 'Liggande | SPC Display',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<template>
  <DisplayPage :step="2" title="Liggande" />
</template>

<style>
/* Global reset for kiosk mode */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
}
</style>