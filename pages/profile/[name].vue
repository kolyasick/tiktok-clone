<script setup lang="ts">
import type { Follows, Like } from "@prisma/client";
import type { IChat, IProfile, IVideo } from "~/types/user.type";

const { $authStore, $generalStore, $profileStore } = useNuxtApp();
const { user } = useUserSession();
const profile = ref<IProfile>();

const likes = ref<Like[]>([]);

const route = useRoute();
const { name } = route.params as Partial<{ name: string }>;

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
      query: { userId: profile.value?.id },
    });
    $profileStore.currentVideos = $profileStore.videos;

    if ($profileStore.videos) {
      $profileStore.videos.forEach((video) => {
        likes.value.push(...(video?.likes || []));
      });
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
    await navigateTo(`/chat/?chatId=${chat.id}`);
  }
};

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
        <img class="rounded-full aspect-square w-32 sm:w-40 object-cover" :src="'/upload/avatars/' + profile?.avatar" />
        <div class="ml-5 w-full">
          <div class="text-[30px] font-bold truncate">
            {{ profile?.name }}
          </div>
          <div class="text-[18px] truncate">{{ profile?.name }}</div>
          <div class="flex items-center gap-3">
            <button
              v-if="profile.id == user?.id"
              @click="openEditModal"
              class="flex items-center gap-2 rounded-md py-1.5 px-3.5 mt-3 text-[15px] font-semibold bg-[#3a3a3a] hover:bg-[#303030]"
            >
              <IconsPencil class="w-5 h-5" />
              <div>Edit profile</div>
            </button>

            <template v-else>
              <button
                v-if="!$profileStore.friend || !$authStore.profile"
                @click="$profileStore.handleFriendAction('add', profile)"
                class="flex items-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#F02C56]"
              >
                Follow
              </button>

              <button
                v-else-if="$profileStore.friend.userId === $authStore.profile?.id"
                disabled
                class="flex items-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#222222]"
              >
                Followed
              </button>

              <button
                v-else-if="$profileStore.friend.friendId === $authStore.profile?.id && $profileStore.friend.status !== 'reply'"
                @click="$profileStore.handleFriendAction('reply', profile)"
                class="flex items-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#F02C56]"
              >
                Follow back
              </button>

              <button @click="chatOpen" class="flex items-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#666666]">
                Chat
              </button>
            </template>
          </div>
        </div>
      </div>

      <div class="flex items-center pt-4">
        <div class="mr-4">
          <span class="font-bold">{{ profile?.following?.length ?? 0 }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5">Following</span>
        </div>
        <div class="mr-4">
          <span class="font-bold">{{ profile?.followers?.length ?? 0 }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5">Followers</span>
        </div>
        <div class="mr-4">
          <span class="font-bold">{{ likes.length }}</span>
          <span class="text-gray-500 font-light text-[15px] pl-1.5">Likes</span>
        </div>
      </div>

      <div class="w-full flex items-center pt-4 border-b">
        <div @click="$profileStore.allVideos" class="w-60 text-center py-2 text-[17px] font-semibold border-b-2 border-b-black cursor-pointer">
          Videos
        </div>
        <div
          @click="$profileStore.liked(profile.id)"
          class="w-60 text-gray-500 inline-flex items-center gap-2 py-2 text-[17px] font-semibold cursor-pointer"
        >
          <IconsUnlocked class="w-5 h-5" /> Liked
        </div>
      </div>

      <div
        v-if="$profileStore.currentVideos.length > 0"
        class="mt-4 grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3"
      >
        <IconsLoader v-if="$profileStore.isLoading" class="animate-spin ml-1 w-20 h-20" />
        <PostUser v-else v-for="video in $profileStore.currentVideos" :key="video.id" :video="video" />
      </div>

      <div v-else class="mt-4 text-[15px] text-gray-500">No videos</div>
    </div>
  </div>
</template>
