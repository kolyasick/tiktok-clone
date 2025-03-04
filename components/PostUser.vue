<script setup lang="ts">
import type { IVideo } from "~/types/user.type";

interface Props {
  video: IVideo;
}
defineProps<Props>();

let videoRef = ref<HTMLVideoElement | null>(null);
let isLoaded = ref<boolean>(false);

onMounted(() => {
  if (videoRef.value) {
    isLoaded.value = true;
    videoRef.value.pause();
  }
});

onBeforeUnmount(() => {
  if (videoRef.value) {
    videoRef.value.pause();
    videoRef.value.currentTime = 0;
    videoRef.value.src = "";
  }
});

const isHover = (bool: boolean) => {
  if (videoRef.value) {
    bool ? videoRef.value.play() : videoRef.value.pause();
  }
};
</script>
<template>
  <div
    @click="navigateTo(`/video/${video.id}`)"
    @mouseenter="isHover(true)"
    @mouseleave="isHover(false)"
    class="relative brightness-90 hover:brightness-[1.1] cursor-pointer"
  >
    <div v-if="!isLoaded" class="absolute flex items-center justify-center top-0 left-0 aspect-[3/4] w-full object-cover rounded-md bg-black">
      <Icon class="animate-spin ml-1 text-white" name="mingcute:loading-line" size="100" />
    </div>
    <div class="border rounded border-[#2a2a2a]">
      <video ref="videoRef" muted autoplay playsinline loop class="aspect-[3/4] object-cover rounded-md" :src="'/upload/videos/' + video.url || ''" />
    </div>
    <div class="px-1">
      <div class="text-[15px] pt-1 break-words">
        {{ video.title }}
      </div>
      <div class="flex items-center -ml-1 font-bold text-xs">
        <Icon name="gg:loadbar-sound" size="20" />
        3%
        <Icon class="ml-1" name="tabler:alert-circle" size="16" />
      </div>
    </div>
  </div>
</template>
