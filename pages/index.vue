<script setup lang="ts">
const { $videosStore } = useNuxtApp();

definePageMeta({
  layout: "main-layout",
});

useHead({
  title: "Clipify – Create and Share Videos with Friends",
  meta: [
    { name: "description", content: "Create and share videos with your friends on Clipify" },
    { property: "og:title", content: "Clipify – Create and Share Videos with Friends" },
    { property: "og:description", content: "Create and share videos with your friends on Clipify" },
    { property: "og:image", content: "https://clipify.ru/clipify-logo.png" },
    { name: "twitter:card", content: "https://clipify.ru/clipify-logo.png" },
    { name: "twitter:title", content: "Clipify – Create and Share Videos with Friends" },
    {
      name: "twitter:description",
      content: "Create and share videos with your friends on Clipify",
    },
    { name: "twitter:image", content: "https://clipify.ru/clipify-logo.png" },
  ],
  link: [{ rel: "canonical", href: "https://clipify.ru" }],
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
