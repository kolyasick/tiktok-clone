<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  layout: "admin-layout",
});

useSeoMeta({
  title: "Clipify | Admin",
});
</script>

<template>
  <div>
    <NuxtPage
      :transition="{
        name: 'page',
        mode: 'out-in',
      }"
    />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
