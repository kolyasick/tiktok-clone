<script setup lang="ts">
const { $videosStore } = useNuxtApp();

definePageMeta({
  layout: "main-layout",
});

useSeoMeta({
  title: "Podvodni-Tok",
  ogTitle: "Podvodni-Tok",
  description: "Create and share videos with your friends on Podvodni-Tok",
  ogDescription: "Create and share videos with your friends on Podvodni-Tok",
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
  <NuxtLayout>
    <div ref="scrollContainer">
      <PostMain v-if="$videosStore.videos.length" v-for="video in $videosStore.videos" :key="video.id" :video="video" />
      <!-- <ClientOnly> -->
      <div ref="loadMoreTrigger"></div>
      <!-- </ClientOnly> -->
      <div v-if="$videosStore.isLoading" class="flex justify-center">
        <IconsLoader class="animate-spin ml-1 w-24 h-24" />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped></style>
