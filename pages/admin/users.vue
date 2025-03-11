<script setup lang="ts">
const { $adminStore } = useNuxtApp();
await $adminStore.getUsers();
</script>

<template>
  <div>
    <AdminUsers />
  </div>
</template>
