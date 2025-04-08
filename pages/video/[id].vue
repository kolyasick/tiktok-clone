<script setup lang="ts">
import type { IVideo } from "~/types/user.type";

const { $authStore } = useNuxtApp();

const route = useRoute();

let videoplay = ref<HTMLVideoElement | null>(null);
let videoContainer = ref<HTMLDivElement | null>(null);
let isModalVisible = ref<boolean>(false);
let volume = ref<number>(5);
let isMuted = ref<boolean>(true);
let isPlaying = ref<boolean>(false);
let isVideoLoading = ref<boolean>(true);
let video = ref<IVideo | null>(null);

const getVideo = await $fetch<IVideo>(`/api/video/${route.params.id}`);
if (getVideo) {
  video.value = {
    ...getVideo,
    liked: getVideo?.likes?.some((like) => like.profileId === $authStore.profile?.id),
  };
}

useSeoMeta({
  title: `Clipify · ${video.value?.profile?.name}`,
  ogTitle: `Clipify · ${video.value?.profile?.name}`,
  description: `Clipify · ${video.value?.title}`,
  ogDescription: `Clipify · ${video.value?.title}`,
  ogImage: "/upload/avatars/" + video.value?.profile?.avatar,
  ogImageHeight: 300,
  ogUrl: `${import.meta.env.BASE_URL}/video/${video.value?.id}`,
});

let playTimeout: NodeJS.Timeout | null = null;

const toggleVideo = () => {
  if (!videoplay.value) return;

  if (videoplay.value.paused) {
    videoplay.value
      .play()
      .then(() => {
        if (playTimeout) clearTimeout(playTimeout);
        playTimeout = setTimeout(() => {
          isPlaying.value = true;
        }, 100);
      })
      .catch((err) => {
        console.error("Error playing video:", err);
      });
  } else {
    videoplay.value.pause();
    isPlaying.value = false;
  }
};

const toggleMute = () => {
  if (!videoplay.value) return;

  isMuted.value = !isMuted.value;
  videoplay.value.muted = isMuted.value;
  videoplay.value.volume = isMuted.value ? 0 : volume.value / 100;
};

const goBack = async () => {
  await navigateTo(window.history.state.back || "/");
};

onMounted(() => {
  if (videoplay.value) {
    videoplay.value.play();
    isPlaying.value = true;
  }
});
</script>

<template>
  <TopNav />
  <div class="container flex flex-col lg:flex-row justify-between items-center gap-5 py-5 bg-light dark:bg-dark">
    <div class="lg:w-1/2 lg:h-[calc(100vh-90px-40px)] h-[600px]">
      <div class="video-container flex justify-center items-center h-full">
        <div :id="`PostMain-${video?.id}`" ref="videoContainer" class="postmain h-full w-full">
          <div class="video-wrapper h-full relative flex items-center bg-black rounded-xl cursor-pointer">
            <div v-if="false" class="loader absolute inset-0 flex items-center justify-center text-white">
              <IconsLoader class="animate-spin w-20 h-20" />
            </div>

            <video
              @click="toggleVideo()"
              ref="videoplay"
              preload="auto"
              loop
              muted
              playsinline
              class="rounded-xl object-cover h-full w-full relative"
              :src="'/upload/videos/' + video?.url"
            ></video>

            <button
              class="text-center absolute top-4 right-4 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#3a3a3a] p-2 cursor-pointer w-[41px] aspect-square hover:bg-gray-200 dark:hover:bg-[#303030]"
              @click="toggleMute"
            >
              <IconsMute :muted="isMuted" class="w-5 h-5 text-gray-900 dark:text-white" />
            </button>

            <button
              class="text-center absolute top-4 left-4 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#3a3a3a] p-2 cursor-pointer w-[41px] aspect-square hover:bg-gray-200 dark:hover:bg-[#303030]"
              @click="goBack"
            >
              <IconsArrow class="w-5 h-5 text-gray-900 dark:text-white" />
            </button>

            <div @click="toggleVideo()" v-if="!isPlaying" class="absolute inset-0 flex items-center justify-center">
              <IconsPlay class="w-20 h-20 text-white opacity-80" />
            </div>
          </div>
        </div>

        <transition name="modal">
          <div
            v-if="isModalVisible"
            class="text-black modal z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
          >
            <div class="bg-white p-4 rounded shadow-lg">
              <p>Video link copied to clipboard!</p>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <div class="flex-1 w-full lg:w-1/2 lg:h-[calc(100vh-90px-40px)]">
      <VideoOverlay :video="video!" />
    </div>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.5s;
}
.modal-enter,
.modal-leave-to {
  opacity: 0;
}

.loader {
  z-index: 10;
}

.play-icon,
.pause-icon {
  pointer-events: none;
}

.loader {
  background: rgba(0, 0, 0, 0.5);
}
</style>
