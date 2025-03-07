<script setup lang="ts">
definePageMeta({
  middleware: "admin",
});
</script>

<template>
  <NuxtLayout name="admin-layout">
    <NuxtPage />
  </NuxtLayout>
</template>
