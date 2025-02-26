<script setup lang="ts">
const { $videosStore, $authStore } = useNuxtApp();

definePageMeta({
  layout: "main-layout",
});

useSeoMeta({
  title: "Podvodni-Tok",
  ogTitle: "Podvodni-Tok",
  description: "Create and share videos with your friends on Podvodni-Tok",
  ogDescription: "Create and share videos with your friends on Podvodni-Tok",
  ogImage: "https://gcqzkhtzxxchrzuvgfwx.supabase.co/storage/v1/object/public/uploads/avatars/default-avatar.jpg",
  ogImageHeight: 300,
  ogUrl: `https://podvodni-tok.com`,
});

const scrollContainer = ref(null);
const loadMoreTrigger = ref(null);

const handleIntersection = async (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
  const [entry] = entries;
  if (entry.isIntersecting) {
    await $videosStore.getVideos();
    observer.unobserve(entry.target);
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
    <div class="pt-[80px] w-[calc(100%-20px)] max-w-[890px] overflow-hidden" ref="scrollContainer">
      <div v-if="$videosStore.videos.length > 0">
        <PostMain v-for="video in $videosStore.videos" :key="video.id" :video="video" />
      </div>
      <div ref="loadMoreTrigger"></div>
      <div v-if="$videosStore.isLoading" class="flex justify-center">
        <Icon class="animate-spin ml-1" name="mingcute:loading-line" size="100" color="#FFFFFF" />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped></style>
