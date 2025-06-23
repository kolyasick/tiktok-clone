<script setup lang="ts">
import type { IVideo } from "~/types/user.type";
const localPath = useLocalePath();

interface Props {
  video: IVideo;
}
const props = defineProps<Props>();

console.log(props.video)

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
    @click="navigateTo(localPath(`/video/${video.id}?userId=${video.profileId}`))"
    @mouseenter="isHover(true)"
    @mouseleave="isHover(false)"
    class="relative brightness-90 hover:brightness-[1.1] cursor-pointer"
  >
    <div
      v-if="!isLoaded && !video.preview"
      class="absolute flex items-center justify-center top-0 left-0 aspect-[3/4] w-full object-cover rounded-md bg-black"
    >
      <IconsLoader class="animate-spin ml-1 text-white w-24 h-24" />
    </div>
    <div class="rounded aspect-[3/4] object-cover">
      <img
        v-if="video.preview"
        class="w-full h-full object-cover rounded-md"
        :src="'/upload/videos/thumbnail/' + video.preview || ''"
      />
      <video
        v-else
        ref="videoRef"
        loading="lazy"
        preload="none"
        muted
        autoplay
        playsinline
        loop
        class="w-full h-full object-cover rounded-md"
        :src="'/upload/videos/' + video.url || ''"
      />
    </div>
    <div class="px-1">
      <div class="text-[15px] pt-1 break-words">
        {{ video.title }}
      </div>
      <div class="flex items-center -ml-1 font-bold text-xs mt-2">
        <IconsLoadBar class="w-4 h-4" />
        3%
        <IconsInfo class="ml-1 w-4 h-4" />
      </div>
    </div>
  </div>
</template>
