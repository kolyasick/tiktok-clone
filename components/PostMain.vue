<script setup lang="ts">
import type { IVideo } from "~/types/user.type";
const { $generalStore, $videosStore } = useNuxtApp();
const router = useRouter();

type Props = {
  video: IVideo;
};
const props = defineProps<Props>();

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

const displayPost = (video: IVideo) => {
  $generalStore.isBackUrl = "/";
  router.push(`/video/${video.id}`);
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
  <div :id="`PostMain-${video.id}`" ref="videoContainer" class="postmain flex border-b py-6">
    <div class="pl-3 w-full px-4">
      <div class="mt-2.5 flex">
        <div class="video-wrapper relative w-[600px] max-h-[730px] flex items-center bg-black rounded-xl cursor-pointer">
          <div v-if="false" class="loader absolute inset-0 flex items-center justify-center bg-black rounded-xl">
            <Icon name="mdi:loading" class="animate-spin" size="48" color="white" />
          </div>

          <video
            @click="displayPost(video)"
            ref="videoplay"
            preload="auto"
            loop
            muted
            playsinline
            class="rounded-xl object-cover mx-auto h-full w-full"
            @timeupdate="onVideoLoaded"
            :src="'/upload/videos/' + video.url || ''"
          ></video>

          <div class="video-info absolute bottom-4 left-4 z-10 text-white w-[250px] md:w-[400px]">
            <div class="flex items-center gap-2 mb-2">
              <NuxtLink :to="`/profile/${video.profile?.name}`" class="flex items-center gap-2">
                <NuxtImg format="webp" class="rounded-full" width="33" :src="'/upload/avatars/' + video.profile?.avatar" />
                <span class="font-bold hover:underline cursor-pointer">
                  {{ video.profile?.name }}
                </span>
              </NuxtLink>
            </div>

            <div class="text-[15px] pb-1 break-words">{{ video.title }}</div>
            <div class="text-[14px] text-gray-300 pb-1">#fun #cool #SuperAwesome</div>
            <div class="text-[14px] flex items-center font-semibold">
              <Icon name="mdi:music" size="17" />
              <div class="px-1">{{ video.profile?.name }}</div>
            </div>
          </div>
        </div>
        <div class="relative mr-[50px]">
          <div class="absolute bottom-0 pl-2">
            <div class="pb-4 text-center">
              <button
                :disabled="isLiking"
                @click="$videosStore.toggleLike(video)"
                class="rounded-full flex items-center bg-[#3a3a3a] p-2 cursor-pointer disabled:bg-gray-300"
              >
                <Icon name="mdi:heart" size="25" :class="video.liked ? 'text-red-500' : ''" class="transition" />
              </button>
              <span class="text-xs text-[#EBEBEB] font-semibold">{{ video.likes?.length }}</span>
            </div>

            <div class="pb-4 text-center">
              <button class="rounded-full flex items-center bg-[#3a3a3a] p-2 cursor-pointer">
                <Icon @click="displayPost(video)" name="bx:bxs-message-rounded-dots" size="25" />
              </button>
              <span class="text-xs text-[#EBEBEB] font-semibold">{{ video.comments?.length }}</span>
            </div>

            <div class="pb-4 text-center">
              <button @click="shareVideo(video)" class="rounded-full flex items-center bg-[#3a3a3a] p-2 cursor-pointer">
                <Icon name="ri:share-forward-fill" size="25" />
              </button>
              <span class="text-xs text-[#EBEBEB] font-semibold">0</span>
            </div>

            <div class="text-center mb-2">
              <button class="rounded-full flex items-center bg-[#3a3a3a] p-2 cursor-pointer" @click="toggleMute">
                <Icon :name="isMuted ? 'mdi:volume-off' : 'mdi:volume-high'" size="25" />
              </button>
            </div>
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
      <div class="bg-[#2a2a2a] p-4 rounded shadow-lg">
        <p>Video link copied to clipboard!</p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
@media (max-width: 600px) {
  .video-wrapper {
    width: 100%;
    height: 500px;
  }
}
@media (min-width: 1200px) {
  .video-wrapper {
    min-height: 700px;
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.5s;
}
.modal-enter,
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
