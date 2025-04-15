<script setup lang="ts">
import type { IVideo } from "~/types/user.type";

const { $videosStore, $authStore } = useNuxtApp();
const localePath = useLocalePath();
const { t } = useI18n();

definePageMeta({
  layout: "main-layout",
});

const scrollContainer = ref<HTMLElement | null>(null);
const currentVideoIndex = ref(0);
const route = useRoute();

let isScrolling = false;
let scrollTimeout: NodeJS.Timeout | null = null;

const { data, refresh } = await useFetch<IVideo>(`/api/video/${route.params.id}`, {
  transform: (data) => {
    return {
      ...data,
      liked: data?.likes?.some((like) => like.profileId === $authStore.profile?.id),
    };
  },
});

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t("errors.videoNotFound"),
    fatal: true,
  });
}

useSeoMeta({
  title: "Clipify | " + data.value?.title,
  ogTitle: "Clipify | " + data.value?.title,
  description: "Clipify – Create and Share Videos with Friends",
  ogDescription: "Clipify – Create and Share Videos with Friends",
  ogImage: "/clipify-logo.png",
  ogImageHeight: 300,
  ogUrl: useRuntimeConfig().public.appUrl,
});

if (data.value) {
  $videosStore.videos = [data.value];
  $videosStore.offset = 0;
  $videosStore.hasMore = true;

  currentVideoIndex.value = $videosStore.videos.findIndex((video) => video.id === route.params.id);

  setTimeout(async () => {
    await $videosStore.getVideos(route.params.id as string);
  }, 100);
}

let startY: number = 0;
let isTouchScrolling: boolean = false;

const handleTouchStart = (e: TouchEvent) => {
  const commentsSection = document.getElementById("commentsSection");
  if (commentsSection && commentsSection.contains(e.target as Node)) {
    return;
  }
  startY = e.touches[0].clientY;
  isTouchScrolling = true;
};

const handleScroll = async (e: WheelEvent) => {
  const commentsSection = document.getElementById("commentsSection");
  if (commentsSection && commentsSection.contains(e.target as Node)) {
    return;
  }
  e.preventDefault();
  if (isScrolling) return;
  isScrolling = true;

  const direction = e.deltaY > 0 ? 1 : -1;
  const nextIndex = currentVideoIndex.value + direction;

  if (nextIndex >= 0 && nextIndex < $videosStore.videos.length) {
    currentVideoIndex.value = nextIndex;
    const targetElement = document.getElementById(`video-${nextIndex}`);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: currentVideoIndex.value === 0 ? "end" : "center",
      });
      const currentVideo = $videosStore.videos[nextIndex];
      const newUrl =
        localePath(`/video/${currentVideo.id}`) +
        (Object.keys(route.query).length
          ? `?${new URLSearchParams(route.query as Record<string, string>).toString()}`
          : "");
      window.history.replaceState({}, "", newUrl);

      useSeoMeta({
        title: "Clipify | " + currentVideo.title,
        ogTitle: "Clipify | " + currentVideo.title,
        description: currentVideo.title,
        ogDescription: currentVideo.title,
        ogImage: "/upload/avatars/default.jpg",
        ogImageHeight: 300,
        ogUrl: import.meta.env.BASE_URL,
      });
    }
  }

  if (nextIndex >= $videosStore.videos.length - 2 && $videosStore.hasMore) {
    await $videosStore.getVideos(route.params.id as string);
  }

  if (scrollTimeout) clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    isScrolling = false;
  }, 500);
};

const handleTouchMove = async (e: TouchEvent) => {
  if (!isTouchScrolling) return;

  const commentsSection = document.getElementById("commentsSection");
  if (commentsSection && commentsSection.contains(e.target as Node)) {
    return;
  }

  e.preventDefault();
  if (isScrolling) return;

  const currentY = e.touches[0].clientY;
  const deltaY = startY - currentY;

  if (Math.abs(deltaY) > 30) {
    isScrolling = true;
    const direction = deltaY > 0 ? 1 : -1;
    const nextIndex = currentVideoIndex.value + direction;

    if (nextIndex >= 0 && nextIndex < $videosStore.videos.length) {
      currentVideoIndex.value = nextIndex;
      const targetElement = document.getElementById(`video-${nextIndex}`);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: currentVideoIndex.value === 0 ? "end" : "center",
        });

        const currentVideo = $videosStore.videos[nextIndex];
        window.history.replaceState({}, "", localePath(`/video/${currentVideo.id}`));

        useSeoMeta({
          title: "Clipify | " + currentVideo.title,
          ogTitle: "Clipify | " + currentVideo.title,
          description: currentVideo.title,
          ogDescription: currentVideo.title,
          ogImage: "/upload/avatars/default.jpg",
          ogImageHeight: 300,
          ogUrl: import.meta.env.BASE_URL,
        });
      }
    }

    if (nextIndex >= $videosStore.videos.length - 2 && $videosStore.hasMore) {
      await $videosStore.getVideos(route.params.id as string);
    }

    isTouchScrolling = false;
    setTimeout(() => {
      isScrolling = false;
    }, 500);
  }
};

onMounted(() => {
  window.addEventListener("wheel", handleScroll, { passive: false });
  window.addEventListener("touchstart", handleTouchStart, { passive: false });
  window.addEventListener("touchmove", handleTouchMove, { passive: false });
});

onUnmounted(() => {
  window.removeEventListener("wheel", handleScroll);
  window.removeEventListener("touchstart", handleTouchStart);
  window.removeEventListener("touchmove", handleTouchMove);

  if (scrollTimeout) clearTimeout(scrollTimeout);
});
</script>

<template>
  <div
    ref="scrollContainer"
    class="h-[calc(100dvh-24px)] overflow-y-scroll overflow-x-visible snap-y snap-mandatory mt-6 w-full"
  >
    <div
      v-for="(video, index) in $videosStore.videos"
      :id="`video-${index}`"
      :key="video.id"
      class="w-full snap-start flex items-center justify-center"
    >
      <PostMain class="mb-5" :video="video" />
    </div>
    <div
      v-if="$videosStore.isLoading"
      class="flex justify-center items-center h-[calc(100dvh-24px)] snap-start"
    >
      <IconsLoader class="animate-spin ml-1 w-24 h-24" />
    </div>
  </div>
</template>

<style scoped></style>
