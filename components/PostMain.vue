<script setup lang="ts">
import type { IComment, IProfile, IVideo } from "~/types/user.type";
const { $videosStore, $authStore, $profileStore } = useNuxtApp();

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
let isCommentsVisible = ref(false);

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

const toggleComments = () => {
  isCommentsVisible.value = !isCommentsVisible.value;
};

const closeComments = () => {
  isCommentsVisible.value = false;
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

const addComment = (comment: IComment) => {
  if (!comment || props.video.commentsCount === undefined) return;
  props.video.commentsCount += 1;
};

const isFollowed = (userId: number) => {
  return computed(() => {
    return $authStore.followers.some(
      (follower) =>
        (follower.userId === userId || follower.friendId === userId) && follower.isFollowing
    );
  });
};

const isFollowing = ref(false);

isFollowing.value = isFollowed(props.video.profileId).value;

const handleFollow = async () => {
  try {
    await $profileStore.handleFriendAction("add", props.video.profile as IProfile);
    isFollowing.value = !isFollowing.value;
  } catch (error) {
    console.error("Error updating follow status:", error);
  }
};
</script>

<template>
  <div
    ref="videoContainer"
    class="xl:w-[65%] md:w-[70%] w-full xl:h-full h-[80dvh] xl:max-h-[800px] max-h-[650px] relative overflow-hidden"
  >
    <video
      ref="videoplay"
      preload="auto"
      loop
      muted
      playsinline
      class="rounded-xl border dark:border-neutral-800 border-gray-200 aspect-video object-cover w-full h-full"
      @timeupdate="onVideoLoaded"
      :src="'/upload/videos/' + video.url || ''"
    />
    <div
      class="absolute xl:bottom-5 xl:left-5 bottom-2 left-2 grid gap-1 text-white dark:text-white"
    >
      <NuxtLink
        :to="`/profile/${video.profile?.name}`"
        class="font-semibold text-lg hover:underline"
      >
        {{ video.profile?.name }}
      </NuxtLink>
      <p class="max-w-[200px] xl:max-w-[300px]">{{ video.title }}</p>
    </div>
    <div
      class="absolute xl:bottom-5 xl:right-5 bottom-2 right-2 grid gap-2 place-items-center dark:text-white text-white"
    >
      <div
        @click.self="navigateTo($localePath(`/profile/${video.profile?.name}`))"
        class="relative mb-5 cursor-pointer"
      >
        <img
          :src="'/upload/avatars/' + video.profile?.avatar"
          class="w-12 aspect-square rounded-full border"
          alt=""
        />
        <button
          @click="handleFollow"
          v-if="!isFollowing && $authStore.profile?.id !== video.profileId"
          class="absolute left-1/2 -translate-x-1/2 -bottom-2 bg-red-500 p-[1px] rounded-full"
        >
          <IconsPlus />
        </button>
      </div>
      <div class="text-center">
        <button
          :disabled="isLiking"
          @click="$videosStore.toggleLike(video)"
          class="rounded-full flex items-center justify-center cursor-pointer aspect-square w-8"
        >
          <IconsHeart
            style="filter: drop-shadow(0px 0px 1px black)"
            :class="video.liked ? 'text-red-500' : 'text-white '"
            class="transition w-full aspect-square"
          />
        </button>
        <span
          style="filter: drop-shadow(0px 0px 1px black)"
          class="text-xs text-white font-semibold"
          >{{ video.likes?.length }}</span
        >
      </div>

      <div class="text-center">
        <button
          class="rounded-full flex items-center justify-center cursor-pointer aspect-square w-8"
          @click="toggleComments"
        >
          <IconsComment
            style="filter: drop-shadow(0px 0px 1px black)"
            class="w-full aspect-square"
          />
        </button>
        <span
          style="filter: drop-shadow(0px 0px 1px black)"
          class="text-xs text-white font-semibold"
          >{{ video.commentsCount }}</span
        >
      </div>

      <div class="text-center">
        <button
          @click="shareVideo(video)"
          class="rounded-full flex items-center justify-center cursor-pointer aspect-square w-8"
        >
          <IconsShare style="filter: drop-shadow(0px 0px 1px black)" class="w-full aspect-square" />
        </button>
      </div>

      <div class="text-center mb-2">
        <button
          class="rounded-full flex items-center justify-center cursor-pointer aspect-square w-8"
          @click="toggleMute"
        >
          <IconsMute
            style="filter: drop-shadow(0px 0px 1px black)"
            :muted="isMuted"
            class="w-full aspect-square"
          />
        </button>
      </div>
    </div>

    <Transition name="slide">
      <CommentsSection
        v-if="isCommentsVisible"
        :is-visible="isCommentsVisible"
        :video-id="video.id"
        :comments-count="video.commentsCount || 0"
        @close="closeComments"
        @add-comment="addComment"
      />
    </Transition>
  </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}

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
