<script setup lang="ts">
const { $adminStore } = useNuxtApp();
await $adminStore.getUsers();
</script>

<template>
  <AdminUsers />
</template>
