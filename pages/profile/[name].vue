<script setup lang="ts">
import type { Follows, Like } from "@prisma/client";
import type { IChat, IProfile, IVideo } from "~/types/user.type";

const { $authStore, $generalStore, $profileStore } = useNuxtApp();
const { user } = useUserSession();
const localePath = useLocalePath();

const profile = ref<IProfile>();

const likes = ref<Like[]>([]);

const route = useRoute();
const { name } = route.params as Partial<{
  name: string;
}>;

const activeTab = ref<"videos" | "liked">("videos");

const openEditModal = () => {
  $generalStore.isEditProfileOpen = true;
  $generalStore.bodySwitch(true);
};

const loadData = async () => {
  try {
    if ($authStore.profile && name == $authStore.profile?.name) {
      profile.value = $authStore.profile;
    } else {
      profile.value = await $authStore.getProfileByName(name || "");
    }

    $profileStore.videos = await $fetch<IVideo[]>("/api/video", {
      query: {
        userId: profile.value?.id,
      },
    });
    $profileStore.currentVideos = $profileStore.videos;

    if ($profileStore.videos) {
      likes.value.push(...$profileStore.videos.flatMap((video) => video?.likes || []));
    }

    if (profile.value?.id && $authStore.profile?.id) {
      $profileStore.friend = await $fetch<Follows>("/api/friend", {
        query: {
          userId: $authStore.profile?.id,
          friendId: profile.value.id,
        },
      });
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
};

await loadData();

const chatOpen = async () => {
  const chat = await $fetch<IChat>("/api/chat/open", {
    method: "POST",
    body: {
      user1Id: $authStore.profile?.id,
      user2Id: profile.value?.id,
    },
  });

  if (chat) {
    await navigateTo(localePath(`/chat/?chatId=${chat.id}`));
  }
};

const isUnfollowButtonShow = computed(() => {
  return (
    ($profileStore.friend?.userId === $authStore.profile?.id && $profileStore.friend?.isFollowing) ||
    ($profileStore.friend?.friendId === $authStore.profile?.id && $profileStore.friend?.status === "accepted")
  );
});

const isFollowButtonShow = computed(() => {
  if (!$profileStore.friend || !$authStore.profile) {
    return true;
  }
  return $profileStore.friend.userId === $authStore.profile.id && !$profileStore.friend.isFollowing;
});

const isFollowBackButtonShow = computed(() => {
  return $profileStore.friend?.friendId === $authStore.profile?.id && $profileStore.friend?.status === "pending";
});

const isFriend = computed(() => {
  return $profileStore.friend?.isFriend;
});

useSeoMeta({
  title: `Clipify | ${profile.value?.name}'s profile`,
  ogTitle: `Clipify | ${profile.value?.name}'s profile`,
  description: `Clipify | ${profile.value?.name}'s profile`,
  ogDescription: `Clipify | ${profile.value?.name}'s profile`,
  ogImage: "/upload/avatars/" + profile.value?.avatar,
  ogImageHeight: 300,
  ogUrl: `${import.meta.env.BASE_URL}/profile/${profile.value?.id}`,
});
</script>

<template>
  <div>
    <TopNav />
    <div v-if="profile" class="container mt-5">
      <div class="flex w-full items-center">
        <div
          class="rounded-full bg-gray-100 dark:bg-[#3a3a3a] aspect-square w-32 sm:w-40 overflow-hidden flex items-center justify-center"
        >
          <img class="object-cover scale-110" :src="'/upload/avatars/' + profile.avatar" />
        </div>
        <div class="ml-5 w-full">
          <div class="text-[30px] font-bold truncate text-gray-900 dark:text-white">
            {{ profile?.name }}
            <span class="text-sm font-light text-[#F02C56]">{{ isFriend ? "В друзьях" : "" }}</span>
          </div>
          <div class="text-[12px] sm:text-[14px] max-w-[400px] text-gray-600 dark:text-gray-300">
            {{ profile?.bio }}
          </div>
          <div class="flex items-center gap-3">
            <button
              v-if="profile.id == user?.id"
              @click="openEditModal"
              class="flex items-center gap-2 rounded-md py-1.5 px-3.5 mt-3 text-[15px] font-semibold bg-gray-100 dark:bg-[#3a3a3a] hover:bg-gray-200 dark:hover:bg-[#303030] text-gray-900 dark:text-white"
            >
              <IconsPencil class="w-5 h-5" />
              <div>
                {{ $t("editProfile") }}
              </div>
            </button>

            <template v-else>
              <button
                v-if="isFollowButtonShow"
                @click="$profileStore.handleFriendAction('add', profile)"
                class="flex items-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#F02C56] hover:bg-[#e02c56]"
              >
                <IconsLoader class="w-6 aspect-square animate-spin" v-if="$profileStore.isFollowLoading" />
                <span v-else>{{ $t("follow") }}</span>
              </button>

              <button
                v-else-if="isUnfollowButtonShow"
                @click="$profileStore.handleFriendAction('unfollow', profile)"
                class="flex items-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-black font-semibold bg-white hover:bg-gray-400"
              >
                <IconsLoader class="w-6 aspect-square animate-spin" v-if="$profileStore.isFollowLoading" />
                <span v-else>{{ $t("unfollow") }}</span>
              </button>

              <button
                v-else-if="isFollowBackButtonShow"
                @click="$profileStore.handleFriendAction('reply', profile)"
                class="flex items-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#F02C56] hover:bg-[#e02c56]"
              >
                <IconsLoader class="w-6 aspect-square animate-spin" v-if="$profileStore.isFollowLoading" />
                <span v-else>{{ $t("followBack") }}</span>
              </button>

              <button
                @click="chatOpen"
                class="flex items-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-gray-400 dark:bg-[#666666] hover:bg-gray-500 dark:hover:bg-[#555555]"
              >
                {{ $t("chat") }}
              </button>
            </template>
          </div>
        </div>
      </div>

      <div class="flex items-center pt-4">
        <div class="mr-4">
          <span class="font-bold text-gray-900 dark:text-white">{{ profile?.following?.length ?? 0 }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5">{{ $t("following") }}</span>
        </div>
        <div class="mr-4">
          <span class="font-bold text-gray-900 dark:text-white">{{ profile?.followers?.length ?? 0 }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5">{{ $t("followers") }}</span>
        </div>
        <div class="mr-4">
          <span class="font-bold text-gray-900 dark:text-white">{{ likes.length }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5">{{ $t("likes") }}</span>
        </div>
      </div>

      <div class="w-full flex items-center pt-4 border-b border-gray-200 dark:border-[#ebebeb6c] relative">
        <div
          class="absolute w-48 bottom-0 left-0 h-[2px] bg-[#F02C56] transition-all duration-300"
          :class="{
            'translate-x-48': activeTab === 'liked',
          }"
        ></div>

        <div
          @click="
            activeTab = 'videos';
            $profileStore.allVideos();
          "
          class="w-48 text-center py-2 text-[17px] font-semibold cursor-pointer"
          :class="{
            'text-[#F02C56]': activeTab === 'videos',
            'text-gray-500': activeTab !== 'videos',
          }"
        >
          {{ $t("videos") }}
        </div>

        <div
          @click="
            activeTab = 'liked';
            $profileStore.liked(profile.id);
          "
          class="w-48 text-center py-2 text-[17px] font-semibold cursor-pointer"
          :class="{
            'text-[#F02C56]': activeTab === 'liked',
            'text-gray-500': activeTab !== 'liked',
          }"
        >
          <div class="inline-flex items-center justify-center gap-2">
            <IconsUnlocked class="w-5 h-5" />
            {{ $t("liked") }}
          </div>
        </div>
      </div>

      <div
        v-if="$profileStore.currentVideos.length > 0"
        class="mt-4 grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3"
      >
        <IconsLoader v-if="$profileStore.isLoading" class="animate-spin ml-1 w-20 h-20 text-gray-900 dark:text-white" />
        <PostUser v-else v-for="video in $profileStore.currentVideos" :key="video.id" :video="video" />
      </div>

      <div v-else class="mt-4 text-[15px] text-gray-500">No videos</div>
    </div>
  </div>
</template>

<style scoped>
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>
