<script setup lang="ts">
defineProps<{ muted: boolean }>();
</script>

<template>
  <svg v-if="muted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- Icon from All by undefined - undefined -->
    <path
      fill="currentColor"
      d="M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.26c-.67.51-1.42.93-2.25 1.17v2.07c1.38-.32 2.63-.95 3.68-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.9 8.9 0 0 0 21 12c0-4.28-3-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71m-2.5 0c0-1.77-1-3.29-2.5-4.03v2.21l2.45 2.45c.05-.2.05-.42.05-.63"
    />
  </svg>
  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <!-- Icon from All by undefined - undefined -->
    <path
      fill="currentColor"
      d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.84-5 6.7v2.07c4-.91 7-4.49 7-8.77s-3-7.86-7-8.77M16.5 12c0-1.77-1-3.29-2.5-4.03V16c1.5-.71 2.5-2.24 2.5-4M3 9v6h4l5 5V4L7 9z"
    />
  </svg>
</template>

<style scoped></style>
