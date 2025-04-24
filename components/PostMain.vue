<script setup lang="ts">
import type { IComment, IProfile, IVideo } from "~/types/user.type";
import { ref, computed, onMounted, onUnmounted } from "vue";

const { $videosStore, $authStore, $profileStore, $generalStore } = useNuxtApp();
const { $io: socket } = useNuxtApp();
const { addNotification } = useNotification();
const { t } = useI18n();

type Props = {
  video: IVideo;
};
const props = defineProps<Props>();
const emits = defineEmits(["toggleComments"]);

const videoplay = ref<HTMLVideoElement | null>(null);
const videoContainer = ref<HTMLElement | null>(null);
const isMuted = ref(true);
const volume = ref(100);
const isLiking = ref(false);
const isVideoLoading = ref(true);
const isCommentsVisible = ref(false);
const isVideoPaused = ref<boolean | undefined>();
const isHeartShow = ref(false);
const isFollowing = ref(false);
const observer = ref<IntersectionObserver | null>(null);

const isFollowingComputed = computed(() => {
  return $authStore.followers.some(
    (follower) =>
      (follower.userId === props.video.profileId || follower.friendId === props.video.profileId) &&
      follower.isFollowing
  );
});

const toggleMute = () => {
  if (videoplay.value) {
    isMuted.value = !isMuted.value;
    videoplay.value.muted = isMuted.value;
  }
};

const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    if (!videoplay.value) return;

    if (entry.isIntersecting) {
      videoplay.value.play().catch((e) => console.log("Autoplay prevented:", e));
    } else {
      videoplay.value.pause();
      if (!isVideoPaused.value) {
        videoplay.value.currentTime = 0;
      }
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
    addNotification({
      message: t("copyError"),
      type: "error",
      duration: 2000,
    });
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
  if (isLiking.value) return;

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
    console.error("Like error:", error);
  } finally {
    setTimeout(() => {
      isLiking.value = false;
    }, 150);
  }
};

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
let timeoutId: NodeJS.Timeout | null = null;

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

onMounted(() => {
  isFollowing.value = isFollowingComputed.value;

  if (videoplay.value) {
    videoplay.value.volume = volume.value / 100;
    observer.value = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "200px",
      threshold: 0.1,
    });

    if (videoContainer.value) {
      observer.value.observe(videoContainer.value);
    }
  }

  const handleVisibilityChange = () => {
    if (!videoplay.value) return;
    if (document.visibilityState === "hidden") {
      videoplay.value.pause();
    } else if (document.visibilityState === "visible") {
      videoplay.value.play();
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect();
  }

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  document.removeEventListener("visibilitychange", () => {});
});
</script>

<template>
  <div ref="videoContainer" class="w-full h-full max-w-[800px] relative overflow-hidden">
    <Transition name="slide-over">
      <div
        v-if="isHeartShow"
        class="absolute top-0 left-0 w-full h-full flex items-center justify-center z-20 pointer-events-none"
      >
        <IconsHeart class="text-red-500 w-1/4 h-1/4" />
      </div>
    </Transition>

    <video
      loading="lazy"
      @click="onDoubleClick"
      ref="videoplay"
      preload="metadata"
      loop
      muted
      playsinline
      class="aspect-video object-cover w-full h-full transition-opacity"
      :class="{ 'opacity-80': isHeartShow || isVideoLoading }"
      @timeupdate="onVideoLoaded"
      :src="'/upload/videos/' + video.url || ''"
      aria-label="Video content"
    ></video>

    <ClientOnly>
      <template v-if="!isVideoLoading">
        <div
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
        >
          <span
            v-if="isVideoPaused !== undefined && !isVideoPaused"
            class="bg-black bg-opacity-50 p-2 rounded-full fade-out"
          >
            <IconsPlay class="w-14 h-14 text-white" />
          </span>
          <span
            v-else-if="isVideoPaused !== undefined && isVideoPaused"
            class="bg-black bg-opacity-50 p-2 rounded-full fade-out"
          >
            <IconsPause class="w-14 h-14 text-white" />
          </span>
        </div>
      </template>
      <template v-else>
        <div class="absolute inset-0 flex items-center justify-center">
          <IconsLoader class="w-24 h-24 animate-spin text-white" />
        </div>
      </template>
    </ClientOnly>

    <div
      class="absolute xl:bottom-5 xl:left-5 bottom-2 left-2 grid gap-1 text-white dark:text-white pointer-events-none"
    >
      <NuxtLink
        :to="$localePath(`/profile/${video.profile?.name}`)"
        class="font-semibold text-lg hover:underline pointer-events-auto"
      >
        {{ video.profile?.name }}
      </NuxtLink>
      <p class="max-w-[200px] xl:max-w-[300px]">{{ video.title }}</p>
    </div>

    <div
      class="absolute xl:bottom-5 xl:right-5 bottom-2 right-2 grid gap-2 place-items-center dark:text-white text-white pointer-events-auto"
    >
      <div class="mb-5 flex flex-col place-items-center">
        <NuxtLink
          :to="$localePath(`/profile/${video.profile?.name}`)"
          class="relative cursor-pointer"
        >
          <img
            :src="'/upload/avatars/' + video.profile?.avatar"
            class="w-12 aspect-square rounded-full border"
            alt="Profile avatar"
            loading="lazy"
          />
        </NuxtLink>
        <button
          v-if="!isFollowing && $authStore.profile?.id !== video.profileId"
          @click="handleFollow"
          class="bg-red-500 rounded-full -mt-2 z-10 flex items-center justify-center p-1"
          aria-label="Follow user"
        >
          <IconsPlus class="w-4 h-4 text-white" />
        </button>
      </div>

      <div class="text-center">
        <button
          :disabled="isLiking"
          @click="likeVideo(video)"
          class="rounded-full flex items-center justify-center cursor-pointer aspect-square w-8 group"
          aria-label="Like video"
        >
          <IconsHeart
            style="filter: drop-shadow(0px 0px 1px black)"
            :class="video.liked ? 'text-red-500' : 'text-white'"
            class="transition w-full aspect-square group-disabled:opacity-50 group-active:scale-75"
          />
        </button>
        <span
          style="filter: drop-shadow(0px 0px 1px black)"
          class="text-xs text-white font-semibold block"
        >
          {{ video.likes?.length || 0 }}
        </span>
      </div>

      <div class="text-center">
        <button
          @click="toggleComments"
          class="rounded-full flex items-center justify-center cursor-pointer aspect-square w-8"
          aria-label="Toggle comments"
        >
          <IconsComment
            style="filter: drop-shadow(0px 0px 1px black)"
            class="w-full aspect-square"
          />
        </button>
        <span
          style="filter: drop-shadow(0px 0px 1px black)"
          class="text-xs text-white font-semibold block"
        >
          {{ video.commentsCount || 0 }}
        </span>
      </div>

      <div class="text-center">
        <button
          @click="shareVideo(video)"
          class="rounded-full flex items-center justify-center cursor-pointer aspect-square w-8"
          aria-label="Share video"
        >
          <IconsShare style="filter: drop-shadow(0px 0px 1px black)" class="w-full aspect-square" />
        </button>
      </div>

      <div class="text-center mb-2">
        <button
          @click="toggleMute"
          class="rounded-full flex items-center justify-center cursor-pointer aspect-square w-8"
          aria-label="Toggle mute"
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
  will-change: transform;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(100%);
}

.slide-over-enter-active,
.slide-over-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0, 1), opacity 0.2s;
  will-change: transform, opacity;
}

.slide-over-enter-from {
  opacity: 0;
  transform: translateY(100%);
}
.slide-over-leave-to {
  opacity: 0;
  transform: translateY(-100%);
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
  will-change: opacity, transform;
}
</style>
