<script setup lang="ts">
import type { IComment, IProfile, IVideo } from "~/types/user.type";
const { $videosStore, $authStore, $profileStore, $generalStore } = useNuxtApp();
const { $io: socket } = useNuxtApp();
const { addNotification } = useNotification();
const { t } = useI18n();

type Props = {
  video: IVideo;
};
const props = defineProps<Props>();
const emits = defineEmits(["toggleComments"]);

let videoplay = ref<HTMLVideoElement | null>(null);
let videoContainer = ref(null);
let isMuted = ref(true);
let volume = ref(100);
let isLiking = ref(false);
let isVideoLoading = ref(true);
let isCommentsVisible = ref(false);
let isVideoPaused = ref(false);

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
  if (video.profileId !== $authStore.profile?.id) {
    socket.emit("notification", {
      to: video.profileId,
      sender: $authStore.profile,
      messageType: "share",
      message: `Поделился вашим видео`,
    });
  }
  const videoUrl = `${window.location.origin}/video/${video.id}`;
  try {
    await navigator.clipboard.writeText(videoUrl);
    addNotification({
      message: t("copyVideo"),
      type: "success",
      duration: 2000,
    });
  } catch (error) {
    console.error("Error copying video link:", error);
    alert("Failed to copy video link");
  }
};

const toggleComments = () => {
  isCommentsVisible.value = !isCommentsVisible.value;
  emits("toggleComments");
};

const closeComments = () => {
  isCommentsVisible.value = false;
  emits("toggleComments");
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

  if (props.video.profileId !== $authStore.profile?.id) {
    socket.emit("notification", {
      to: props.video.profileId,
      sender: $authStore.profile,
      messageType: "comment",
      message: `Прокомментировал ваше видео "${props.video.title}"`,
    });
  }
};

const likeVideo = async (video: IVideo) => {
  try {
    isLiking.value = true;
    await $videosStore.toggleLike(video);
    if (video.profileId !== $authStore.profile?.id && video.liked) {
      socket.emit("notification", {
        to: video.profileId,
        sender: $authStore.profile,
        messageType: "like",
        message: `Понравилось ваше видео "${video.title}"`,
      });
    }
  } catch (error) {
  } finally {
    setTimeout(() => {
      isLiking.value = false;
    }, 150);
  }
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
  if (!$authStore.profile) {
    $generalStore.isLoginOpen = true;
    return;
  }
  try {
    await $profileStore.handleFriendAction("add", props.video.profile as IProfile);
    if (props.video.profileId !== $authStore.profile?.id) {
      socket.emit("notification", {
        to: props.video.profileId,
        sender: $authStore.profile,
        messageType: "follow",
        message: `Подписался на вас`,
      });
    }
    isFollowing.value = !isFollowing.value;
  } catch (error) {
    console.error("Error updating follow status:", error);
  }
};

let lastClickTime = 0;
let timeoutId = null as NodeJS.Timeout | null;

const onDoubleClick = () => {
  const currentTime = Date.now();
  const timeBetweenClicks = currentTime - lastClickTime;

  if (timeBetweenClicks < 200) {
    clearTimeout(timeoutId!);
    timeoutId = null;
    handleDoubleClick();
  } else {
    timeoutId = setTimeout(() => {
      handleSingleClick();
      timeoutId = null;
    }, 200);
  }

  lastClickTime = currentTime;
};

const handleSingleClick = () => {
  if (videoplay.value) {
    videoplay.value.paused ? videoplay.value.play() : videoplay.value.pause();
    isVideoPaused.value = videoplay.value.paused;
  }
};
const isHeartShow = ref(false);

const handleDoubleClick = async () => {
  try {
    await likeVideo(props.video);
    if (props.video.liked) {
      isHeartShow.value = true;
      setTimeout(() => {
        isHeartShow.value = false;
      }, 700);
    }
  } catch (error) {
    console.error(error);
  }
};

const openFullscreen = () => {
  if (videoplay.value) {
    videoplay.value.requestFullscreen();
  }
};
</script>

<template>
  <div
    ref="videoContainer"
    class="xl:w-[65%] md:w-[70%] w-full xl:h-[calc(100dvh-150px)] h-[80dvh] xl:max-h-[800px] max-h-[650px] relative overflow-hidden"
  >
    <button
      @click="openFullscreen"
      class="absolute top-3 right-3 z-30 text-white opacity-60 hover:opacity-100"
    >
      <IconsFullScreen class="w-6 h-6" />
    </button>
    <Transition name="slide-over">
      <div
        class="absolute top-0 left-0 w-full h-full flex items-center justify-center z-20"
        v-if="isHeartShow"
      >
        <IconsHeart class="text-red-500 w-1/4 h-1/4" />
      </div>
    </Transition>
    <video
      @click="onDoubleClick"
      ref="videoplay"
      preload="auto"
      loop
      muted
      playsinline
      class="rounded-xl border dark:border-neutral-800 border-gray-200 aspect-video object-cover w-full h-full transition-opacity"
      :class="{ 'opacity-80': isHeartShow }"
      @timeupdate="onVideoLoaded"
      :src="'/upload/videos/' + video.url || ''"
    />
    <ClientOnly>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        <span v-if="!isVideoPaused" class="bg-black bg-opacity-50 p-2 rounded-full fade-out">
          <IconsPlay class="w-14 h-14 text-white" />
        </span>
        <span v-else class="bg-black bg-opacity-50 p-2 rounded-full fade-out">
          <IconsPause class="w-14 h-14 text-white" />
        </span>
      </div>
    </ClientOnly>
    <div
      class="absolute xl:bottom-5 xl:left-5 bottom-2 left-2 grid gap-1 text-white dark:text-white"
    >
      <NuxtLink
        :to="$localePath(`/profile/${video.profile?.name}`)"
        class="font-semibold text-lg hover:underline"
      >
        {{ video.profile?.name }}
      </NuxtLink>
      <p class="max-w-[200px] xl:max-w-[300px]">{{ video.title }}</p>
    </div>
    <div
      class="absolute xl:bottom-5 xl:right-5 bottom-2 right-2 grid gap-2 place-items-center dark:text-white text-white"
    >
      <div class="mb-5 flex flex-col place-items-center">
        <NuxtLink
          :to="$localePath(`/profile/${video.profile?.name}`)"
          class="relative cursor-pointer"
        >
          <img
            :src="'/upload/avatars/' + video.profile?.avatar"
            class="w-12 aspect-square rounded-full border"
            alt=""
          />
        </NuxtLink>
        <button
          @click="handleFollow"
          v-if="!isFollowing && $authStore.profile?.id !== video.profileId"
          class="bg-red-500 rounded-full -mt-2 z-10 flex items-center justify-center"
        >
          <IconsPlus />
        </button>
      </div>
      <div class="text-center">
        <button
          :disabled="isLiking"
          @click="likeVideo(video)"
          class="rounded-full flex items-center justify-center cursor-pointer aspect-square w-8 group"
        >
          <IconsHeart
            style="filter: drop-shadow(0px 0px 1px black)"
            :class="video.liked ? 'text-red-500' : 'text-white '"
            class="transition w-full aspect-square group-disabled:opacity-50 group-active:scale-75"
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

.slide-over-enter-active,
.slide-over-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0, 1), opacity 0.2s;
}

.slide-over-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.slide-over-leave-to {
  opacity: 0;
  transform: translateY(-100%);
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
@keyframes fade-in-out {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.fade-out {
  animation: fade-in-out 0.3s ease forwards;
}
</style>
