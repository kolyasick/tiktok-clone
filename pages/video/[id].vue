<script setup lang="ts">
import type { IVideo } from "~/types/user.type";

const { $videosStore, $authStore } = useNuxtApp();

definePageMeta({
  layout: "main-layout",
});

const scrollContainer = ref<HTMLElement | null>(null);
const currentVideoIndex = ref(0);
const router = useRouter();
const route = useRoute();

let isScrolling = false;
let scrollTimeout: NodeJS.Timeout | null = null;

const { data } = await useFetch<IVideo>(`/api/video/${route.params.id}`, {
  transform: (data) => {
    return {
      ...data,
      liked: data?.likes?.some((like) => like.profileId === $authStore.profile?.id),
    };
  },
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

const handleScroll = async (e: WheelEvent) => {
  e.preventDefault();
  if (isScrolling) return;
  isScrolling = true;

  const direction = e.deltaY > 0 ? 1 : -1;
  const nextIndex = currentVideoIndex.value + direction;

  if (nextIndex >= 0 && nextIndex < $videosStore.videos.length) {
    currentVideoIndex.value = nextIndex;
    const targetElement = document.getElementById(`video-${nextIndex}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
      const currentVideo = $videosStore.videos[nextIndex];
      window.history.replaceState({}, "", `/video/${currentVideo.id}`);

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

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener("wheel", handleScroll, { passive: false });
  }
});

onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener("wheel", handleScroll);
  }
  if (scrollTimeout) clearTimeout(scrollTimeout);
});
</script>

<template>
  <div ref="scrollContainer" class="h-[calc(100dvh-24px)] overflow-y-auto snap-y snap-mandatory mt-6">
    <div
      v-for="(video, index) in $videosStore.videos"
      :id="`video-${index}`"
      :key="video.id"
      class="h-[calc(100dvh-24px)] w-full snap-start flex items-center justify-center"
    >
      <PostMain :video="video" />
    </div>
    <div v-if="$videosStore.isLoading" class="flex justify-center items-center h-[calc(100vh-24px)] snap-start">
      <IconsLoader class="animate-spin ml-1 w-24 h-24" />
    </div>
  </div>
  <!-- <Transition name="slide">
    <CommentsSection
      v-if="isCommentsVisible && currentVideoId"
      :video-id="currentVideoId"
      :is-visible="isCommentsVisible"
      @close="isCommentsVisible = false"
    />
  </Transition> -->
</template>

<!-- <style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */


/* Hide scrollbar for IE, Edge and Firefox */

.snap-y {
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

.snap-start {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
</style> -->
