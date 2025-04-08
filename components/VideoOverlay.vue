<script setup lang="ts">
import type { IVideo } from "~/types/user.type";
import { formatDate } from "~/utils/formatDate";
const r = useRuntimeConfig();

const { $videosStore, $authStore, $generalStore } = useNuxtApp();
interface Props {
  video: IVideo;
}
const props = defineProps<Props>();

const isModalVisible = ref<boolean>(false);
let videoUrl = `${r.public.appUrl}/video/${props.video.id}`;
let commentText = ref("");

const createComment = async () => {
  if (!$authStore.profile) {
    $generalStore.isLoginOpen = true;
    window.scrollTo(0, 0);
    $generalStore.bodySwitch(true);
    return;
  } else if (!commentText.value.trim()) {
    return;
  }

  const commentData = {
    id: new Date().getTime(),
    text: commentText.value,
    profileId: $authStore.profile?.id,
    profile: $authStore.profile,
    user: $authStore.profile,
    createdAt: new Date(),
    updatedAt: new Date(),
    videoId: props.video.id,
  };

  props.video.comments?.push(commentData);

  $videosStore.videos?.find((video) => video.id === props.video.id)?.comments?.push(commentData);
  let comment = commentText.value;
  commentText.value = "";

  const res = await $fetch("/api/comment/add", {
    method: "POST",
    body: {
      senderId: $authStore.profile?.id,
      text: comment,
      videoId: props.video.id,
    },
  });
};

const shareVideo = async () => {
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

const likeVideo = async () => {
  if (!$authStore.profile) {
    $generalStore.isLoginOpen = true;
    return;
  }

  $videosStore.toggleLike(props.video);
  const video = $videosStore.videos.find((v) => v.id === props.video.id);

  if (!video) return;

  if (props.video.liked) {
    video.liked = true;
    video.likes?.push({
      id: new Date().getTime(),
      profileId: $authStore.profile?.id || 0,
      videoId: props.video.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } else {
    video.liked = false;
    video.likes = video.likes?.filter((like) => like.profileId !== $authStore.profile?.id);
  }
};
</script>
<template>
  <div
    v-if="video"
    class="relative flex flex-col gap-3 bg-gray-200 dark:bg-neutral-900 h-full dark:text-white text-gray-900 overflow-hidden px-4 py-4 rounded-xl"
  >
    <div class="comment-header sticky top-0 bg-white dark:bg-neutral-800/70 border dark:border-neutral-700 p-3 rounded-xl">
      <div class="flex items-center justify-between gap-4 max-[540px]:flex-col max-[540px]:items-stretch">
        <NuxtLink class="flex gap-5 items-center" :to="`/profile/${video.profile?.name}`">
          <img class="rounded-full w-12 h-12" :src="'/upload/avatars/' + video.profile?.avatar" alt="" />
          <span>
            <h2 class="text-lg font-bold">
              {{ video.profile?.name }}
            </h2>
            <p class="text-sm font-light">
              {{ video.profile?.name }} ·
              {{ formatDate(video.createdAt) }}
            </p>
          </span>
        </NuxtLink>

        <button @click="shareVideo()" class="bg-[#F02C56] px-4 py-2 rounded-md text-white">Поделиться</button>
      </div>
      <h1 class="text-xl font-semibold text-center mt-5">
        {{ video.title }}
      </h1>
    </div>
    <span class="text-center text-gray-500">Поделиться в:</span>
    <div class="flex items-center justify-center gap-5 mb-1">
      <a :href="`https://telegram.me/share/url?url=${videoUrl}`" target="_blank">
        <IconsTelegram class="w-8 h-8" />
      </a>
      <a :href="`https://wa.me/?text=${videoUrl}`" target="_blank">
        <IconsWhatsApp class="w-8 h-8" />
      </a>
      <a :href="`https://vk.com/share.php?url=${videoUrl}`" target="_blank">
        <IconsVk class="w-8 h-8" />
      </a>
    </div>

    <div class="flex justify-center gap-10 mb-6 border-b dark:border-neutral-800 border-gray-300 pb-5 max-[330px]:gap-6">
      <div class="text-center flex items-center gap-2">
        <button
          @click="likeVideo"
          class="rounded-full transition flex items-center bg-white hover:bg-gray-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 p-2 cursor-pointer disabled:bg-gray-300"
          :class="video.liked ? 'text-[#F02C56]' : 'dark:text-[#EBEBEB] text-black'"
        >
          <IconsHeart class="w-6 h-6" />
        </button>
        <span class="text-xs dark:text-[#EBEBEB] text-gray-900 font-semibold">{{ video.likes?.length }}</span>
      </div>

      <label for="comment-input" class="text-center flex items-center gap-2">
        <span class="rounded-full flex items-center bg-white hover:bg-gray-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 p-2 cursor-pointer">
          <IconsComment class="w-6 h-6" />
        </span>
        <span class="text-xs dark:text-[#EBEBEB] text-gray-900 font-semibold">{{ video.comments?.length }}</span>
      </label>

      <div class="text-center flex items-center gap-2">
        <button
          @click="shareVideo()"
          class="rounded-full flex items-center bg-white hover:bg-gray-100 dark:hover:bg-neutral-700 dark:bg-neutral-800 p-2 cursor-pointer"
        >
          <IconsShare class="w-6 h-6" />
        </button>
        <span class="text-xs dark:text-[#EBEBEB] text-gray-900 font-semibold">0</span>
      </div>
    </div>

    <div class="comments-list overflow-y-auto flex-grow space-y-4 pr-2 mb-16" style="max-height: calc(100vh - 260px)">
      <div
        class="relative dark:bg-[#2b2b2b] bg-gray-50 p-2 rounded-xl flex items-end justify-between"
        v-for="comment in video.comments"
        :key="comment.id"
      >
        <NuxtLink class="absolute top-2 left-2 w-10 h-10" :href="`/profile/${comment.profile?.name}`">
          <img class="rounded-full" width="40" height="40" :src="'/upload/avatars/' + comment.profile?.avatar" />
        </NuxtLink>

        <div class="ml-12">
          <NuxtLink :href="`/profile/${comment.profile?.name}`" class="font-semibold">
            <p class="text-sm">
              {{ comment.profile?.name === $authStore.profile?.name ? "you" : comment.profile?.name }}
              <span class="text-gray-500 text-sm">
                {{ comment.profile?.name === video.profile?.name ? "· author" : "" }}
              </span>
            </p>
          </NuxtLink>

          <p class="text-sm font-light max-w-[300px] dark:text-gray-200 text-gray-900 break-word" style="word-break: break-word">
            {{ comment.text }}
          </p>
        </div>

        <span class="self-end text-gray-500 border-b p-1 border-gray-200 dark:border-neutral-700 max-[430px]:text-xs whitespace-nowrap">
          {{ formatDate(comment.createdAt) }}
        </span>
      </div>
    </div>

    <div class="comment-form dark:bg-[#161616] bg-gray-300 absolute bottom-0 w-full left-0 p-3">
      <div class="flex items-center gap-3">
        <input
          @keyup.enter="createComment"
          class="comment-input w-full dark:bg-[#1E1E1E] bg-white rounded-md p-2 text-sm dark:text-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F02C56] transition duration-200"
          type="text"
          id="comment-input"
          v-model="commentText"
          placeholder="Напишите комментарий..."
        />
        <button
          :disabled="!commentText"
          @click="createComment()"
          class="bg-[#F02C56] px-4 py-2 text-sm rounded-md hover:bg-[#e0244a] transition duration-200 dark:disabled:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-500 text-white dark:text-gray-900"
        >
          Отправить
        </button>
      </div>
    </div>
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
</style>
