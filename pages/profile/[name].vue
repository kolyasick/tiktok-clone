<script setup lang="ts">
import type { Follows, Like } from "@prisma/client";
import type { IChat, IProfile, IVideo } from "~/types/user.type";

const { $authStore, $generalStore, $profileStore, $io: socket } = useNuxtApp();
const { user } = useUserSession();
const localePath = useLocalePath();
const { t } = useI18n();

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

if ($authStore.profile && name == $authStore.profile?.name) {
  profile.value = $authStore.profile;
} else {
  const { data } = await useFetch<IProfile>(`/api/profile/${name}`);
  if (!data.value) {
    throw createError({
      statusCode: 404,
      statusMessage: t("errors.profileNotFound"),
      fatal: true,
    });
  }
  profile.value = data.value;
}

const loadData = async () => {
  try {
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
  if (!$authStore.profile) {
    $generalStore.isLoginOpen = true;
    $generalStore.bodySwitch(true);
    return;
  }
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
    ($profileStore.friend?.userId === $authStore.profile?.id &&
      $profileStore.friend?.isFollowing) ||
    ($profileStore.friend?.friendId === $authStore.profile?.id &&
      $profileStore.friend?.status === "accepted")
  );
});

const isFollowButtonShow = computed(() => {
  if (!$profileStore.friend || !$authStore.profile) {
    return true;
  }
  return $profileStore.friend.userId === $authStore.profile.id && !$profileStore.friend.isFollowing;
});

const isFollowBackButtonShow = computed(() => {
  return (
    $profileStore.friend?.friendId === $authStore.profile?.id &&
    $profileStore.friend?.status === "pending"
  );
});

const isFriend = computed(() => {
  return $profileStore.friend?.isFriend;
});

const handleFollow = async (action: "add" | "reply" | "unfollow", profile: IProfile) => {
  await $profileStore.handleFriendAction(action, profile);

  if (action !== "unfollow") {
    socket.emit("notification", {
      to: profile.id,
      sender: $authStore.profile,
      messageType: action === "add" ? "follow" : action === "reply" ? "friend" : undefined,
      message:
        action === "add" ? "Подписался на вас" : action === "reply" ? "Добавил вас в друзья" : "",
    });
  }
};

useSeoMeta({
  title: `Clipify | ${profile.value?.name}'s profile`,
  ogTitle: `Clipify | ${profile.value?.name}'s profile`,
  description: "Clipify – Create and Share Videos with Friends",
  ogDescription: "Clipify – Create and Share Videos with Friends",
  ogImage: "/upload/avatars/" + profile.value?.avatar,
  ogUrl: useRuntimeConfig().public.appUrl,
});
</script>

<template>
  <div>
    <TopNav />
    <div v-if="profile" class="container mt-5">
      <div class="flex w-full items-center">
        <div
          class="rounded-full bg-gray-100 dark:bg-[#3a3a3a] aspect-square w-24 md:w-40 overflow-hidden flex items-center justify-center flex-shrink-0"
        >
          <img class="object-cover scale-110" :src="'/upload/avatars/' + profile.avatar" />
        </div>
        <div class="ml-5 w-full">
          <div class="md:text-[30px] text-2md font-bold truncate text-gray-900 dark:text-white">
            {{ profile?.name }}
            <span class="text-sm font-light text-[#F02C56]">{{ isFriend ? "В друзьях" : "" }}</span>
          </div>
          <div class="text-[12px] md:text-[14px] max-w-[400px] text-gray-600 dark:text-gray-300">
            {{ profile?.bio }}
          </div>
          <div class="flex items-center gap-3">
            <button
              v-if="profile.id == user?.id"
              @click="openEditModal"
              class="flex items-center gap-2 rounded-md h-8 md:h-9 px-3 mt-3 font-semibold bg-gray-100 dark:bg-[#3a3a3a] hover:bg-gray-200 dark:hover:bg-[#303030] text-gray-900 dark:text-white"
            >
              <IconsPencil class="md:w-5 aspect-square w-4" />
              <div class="md:text-[15px] text-[13px]">
                {{ $t("editProfile") }}
              </div>
            </button>

            <template v-else>
              <button
                v-if="isFollowButtonShow"
                @click="handleFollow('add', profile)"
                class="flex items-center rounded-md h-8 md:h-9 px-3 mt-3 text-white font-semibold bg-[#F02C56] hover:bg-[#e02c56]"
              >
                <IconsLoader
                  class="w-6 aspect-square animate-spin"
                  v-if="$profileStore.isFollowLoading"
                />
                <span v-else class="md:text-[15px] text-[13px]">{{ $t("follow") }}</span>
              </button>

              <button
                v-else-if="isUnfollowButtonShow"
                @click="handleFollow('unfollow', profile)"
                class="flex items-center rounded-md h-8 md:h-9 px-3 mt-3 text-black font-medium bg-white hover:bg-gray-300 transition-colors hover:border-gray-300 border border-gray-200"
              >
                <IconsLoader
                  class="w-6 aspect-square animate-spin"
                  v-if="$profileStore.isFollowLoading"
                />
                <span v-else class="md:text-[15px] text-[13px]">{{ $t("unfollow") }}</span>
              </button>

              <button
                v-else-if="isFollowBackButtonShow"
                @click="handleFollow('reply', profile)"
                class="flex items-center rounded-md h-8 md:h-9 px-3 mt-3 text-white font-semibold bg-[#F02C56] hover:bg-[#e02c56]"
              >
                <IconsLoader
                  class="w-6 aspect-square animate-spin"
                  v-if="$profileStore.isFollowLoading"
                />
                <span v-else class="md:text-[15px] text-[13px]">{{ $t("followBack") }}</span>
              </button>

              <button
                @click="chatOpen"
                class="flex items-center rounded-md h-8 md:h-9 px-3 mt-3 md:text-[15px] text-[13px] text-white font-semibold bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 dark:hover:border-neutral-700 transition-colors"
              >
                <IconsSend class="w-6 h-6 text-black dark:text-white" />
              </button>
            </template>
          </div>
        </div>
      </div>

      <div class="flex items-center pt-4 md:text-[15px] text-[13px]">
        <div class="mr-4">
          <span class="font-bold text-gray-900 dark:text-white">{{
            profile?.following?.length ?? 0
          }}</span>
          <span class="text-gray-500 font-light pl-1.5">{{ $t("following") }}</span>
        </div>
        <div class="mr-4">
          <span class="font-bold text-gray-900 dark:text-white">{{
            profile?.followers?.length ?? 0
          }}</span>
          <span class="text-gray-500 font-light pl-1.5">{{ $t("followers") }}</span>
        </div>
        <div class="mr-4">
          <span class="font-bold text-gray-900 dark:text-white">{{ likes.length }}</span>
          <span class="text-gray-500 font-light pl-1.5">{{ $t("likes") }}</span>
        </div>
      </div>

      <div
        class="w-full flex items-center pt-4 border-b border-gray-200 dark:border-[#ebebeb6c] relative"
      >
        <div
          class="absolute w-1/2 bottom-0 left-0 h-[2px] bg-[#F02C56] transition-all duration-300"
          :class="{
            'translate-x-full': activeTab === 'liked',
          }"
        ></div>

        <div
          @click="
            activeTab = 'videos';
            $profileStore.allVideos();
          "
          class="flex-1 text-center py-2 md:text-[17px] text-[15px] font-semibold cursor-pointer"
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
          class="flex-1 text-center py-2 md:text-[17px] text-[15px] font-semibold cursor-pointer"
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
        class="mt-4 grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"
      >
        <IconsLoader
          v-if="$profileStore.isLoading"
          class="animate-spin ml-1 w-20 h-20 text-gray-900 dark:text-white"
        />
        <PostUser
          v-else
          v-for="video in $profileStore.currentVideos"
          :key="video.id"
          :video="video"
        />
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
