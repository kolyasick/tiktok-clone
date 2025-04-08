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

const scrollContainer = ref(null);
const loadMoreTrigger = ref(null);

const handleIntersection = async (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
  const [entry] = entries;
  if (entry.isIntersecting) {
    await $videosStore.getVideos();
  }
};

onMounted(() => {
  const observer = new IntersectionObserver(handleIntersection, {
    root: null,
    threshold: 1.0,
  });

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value);
  }

  watch(
    () => $videosStore.isLoading,
    (newValue) => {
      if (!newValue && loadMoreTrigger.value) {
        observer.observe(loadMoreTrigger.value);
      }
    }
  );
});
</script>
<template>
  <div ref="scrollContainer ">
    <PostMain v-if="$videosStore.videos.length" v-for="video in $videosStore.videos" :key="video.id" :video="video" />
    <div ref="loadMoreTrigger"></div>
    <div v-if="$videosStore.isLoading" class="flex justify-center">
      <IconsLoader class="animate-spin ml-1 w-24 h-24" />
    </div>
  </div>
</template>

<style scoped></style>
