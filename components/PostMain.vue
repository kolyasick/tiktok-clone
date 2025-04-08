<script setup lang="ts">
import type { IVideo } from "~/types/user.type";
const { $videosStore } = useNuxtApp();

type Props = {
  video: IVideo;
};
defineProps<Props>();

let videoplay = ref<HTMLVideoElement | null>(null);
let videoContainer = ref(null);
let isMuted = ref(true);
let volume = ref(5);
let isLiking = ref(false);
let isVideoLoading = ref(true);

const loadMoreTrigger = ref(null);
const isModalVisible = ref(false);

const toggleMute = () => {
  if (videoplay.value) {
    isMuted.value = !isMuted.value;
    videoplay.value.muted = isMuted.value;
  }
};

const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (videoplay.value) {
      if (entry.isIntersecting) {
        videoplay.value.play();
      } else {
        videoplay.value.pause();
        videoplay.value.currentTime = 0;
      }
    } else {
      return;
    }
  });
};

const shareVideo = async (video: IVideo) => {
  const videoUrl = `${window.location.origin}/video/${video.id}`;
  try {
    await navigator.clipboard.writeText(videoUrl);
    isModalVisible.value = true;
    setTimeout(() => {
      isModalVisible.value = false;
    }, 500);
  } catch (error) {
    console.error("Error copying video link:", error);
    alert("Failed to copy video link");
  }
};

onMounted(() => {
  if (videoplay.value) {
    videoplay.value.volume = volume.value / 100;
    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      threshold: 0.5,
    });
    if (videoContainer.value) {
      observer.observe(videoContainer.value);
    }
  }
});

const onVideoLoaded = () => {
  isVideoLoading.value = false;
};
</script>

<template>
  <div :id="`PostMain-${video.id}`" ref="videoContainer" class="postmain ">
    <div class="mt-2.5 flex">
      <div
        class="video-wrapper relative w-full lg:w-[60%] aspect-6/12 h-[calc(100vh-111px)] sm:min-h-[700px] max-h-[500px] sm:max-h-full flex items-center bg-black rounded-xl cursor-pointer"
      >
        <div v-if="false" class="loader absolute inset-0 flex items-center justify-center bg-black rounded-xl">
          <IconsLoader class="animate-spin w-12 h-12" />
        </div>

        <video
          @click="navigateTo(`/video/${video.id}`)"
          ref="videoplay"
          preload="auto"
          loop
          muted
          playsinline
          class="rounded-xl aspect-video object-cover mx-auto h-full w-full"
          @timeupdate="onVideoLoaded"
          :src="'/upload/videos/' + video.url || ''"
        ></video>

        <div class="video-info absolute bottom-4 left-4 z-10 text-white w-[250px] md:w-[400px]">
          <div class="flex items-center gap-2 mb-2">
            <NuxtLink :to="`/profile/${video.profile?.name}`" class="flex items-center gap-2">
              <img class="rounded-full aspect-square object-cover" width="33" :src="'/upload/avatars/' + video.profile?.avatar" />
              <span class="font-bold hover:underline cursor-pointer">
                {{ video.profile?.name }}
              </span>
            </NuxtLink>
          </div>

          <div class="text-[15px] pb-1 break-words">{{ video.title }}</div>
          <div class="text-[14px] text-gray-300 pb-1">#fun #cool #SuperAwesome</div>
          <div class="text-[14px] flex items-center font-semibold">
            <IconsMusic class="w-4 h-4" />
            <div class="px-1">{{ video.profile?.name }}'s sound</div>
          </div>
        </div>
      </div>
      <div class="relative mr-[50px]">
        <div class="absolute bottom-0 pl-2">
          <div class="pb-4 text-center">
            <button
              :disabled="isLiking"
              @click="$videosStore.toggleLike(video)"
              class="rounded-full flex items-center bg-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 p-2 cursor-pointer disabled:bg-gray-300 w-[41px] aspect-square"
            >
              <IconsHeart :class="video.liked ? 'text-red-500' : ''" class="transition w-6 h-6" />
            </button>
            <span class="text-xs dark:text-[#EBEBEB] text-[#3a3a3a] font-semibold">{{ video.likes?.length }}</span>
          </div>

          <div class="pb-4 text-center">
            <button
              class="rounded-full flex items-center bg-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 p-2 cursor-pointer w-[41px] aspect-square"
            >
              <IconsComment class="w-6 h-6" @click="navigateTo(`/video/${video.id}`)" />
            </button>
            <span class="text-xs dark:text-[#EBEBEB] text-[#3a3a3a] font-semibold">{{ video.comments?.length }}</span>
          </div>

          <div class="pb-4 text-center">
            <button
              @click="shareVideo(video)"
              class="rounded-full flex items-center bg-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 p-2 cursor-pointer w-[41px] aspect-square"
            >
              <IconsShare class="w-6 h-6" />
            </button>
            <span class="text-xs dark:text-[#EBEBEB] text-[#3a3a3a] font-semibold">0</span>
          </div>

          <div class="text-center mb-2">
            <button
              class="rounded-full flex items-center bg-gray-200 hover:bg-gray-300 dark:hover:bg-neutral-700 dark:bg-neutral-800 p-2 cursor-pointer w-[41px] aspect-square"
              @click="toggleMute"
            >
              <IconsMute :muted="isMuted" class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div>
    <div ref="loadMoreTrigger" class="h-10"></div>
  </div>

  <transition name="modal">
    <div v-if="isModalVisible" class="modal fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div class="p-4 rounded shadow-lg dark:bg-neutral-800 bg-gray-50 text-gray-900 dark:text-white">
        <p>Video link copied to clipboard!</p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal {
  z-index: 1000;
}

.loader {
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
}
</style>
