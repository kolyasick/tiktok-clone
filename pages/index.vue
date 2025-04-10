<script setup lang="ts">
const { $videosStore } = useNuxtApp();

definePageMeta({
  layout: "main-layout",
});

useSeoMeta({
  title: "Clipify",
  ogTitle: "Clipify",
  description: "Create and share videos with your friends on Clipify",
  ogDescription: "Create and share videos with your friends on Clipify",
  ogImage: "/upload/avatars/default.jpg",
  ogImageHeight: 300,
  ogUrl: import.meta.env.BASE_URL,
});
</script>

<template>
  <div class="h-screen">
    <h1>Главная</h1>
  </div>
</template>

<style>
/* Hide scrollbar for Chrome, Safari and Opera */

.snap-y {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

.snap-start {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
</style>
