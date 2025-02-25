<script setup lang="ts">
import type { Friendship, Like } from "@prisma/client";
import type { IProfile, IVideo } from "~/types/user.type";

const { $authStore, $generalStore, $profileStore } = useNuxtApp();
const { user } = useUserSession();
const profile = ref<IProfile>();

const likes = ref<Like[]>([]);

const route = useRoute();
const { id } = route.params as Partial<{ id: number }>;

const loadData = async () => {
  try {
    if ($authStore.profile && id == $authStore.profile?.id) {
      profile.value = $authStore.profile;
    } else {
      profile.value = await $authStore.getProfile(id || 0);
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
      $profileStore.friend = await $fetch<Friendship>("/api/friend", {
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

useSeoMeta({
  title: `Podvodni-Tok - ${profile.value?.name}'s profile`,
  ogTitle: `Podvodni-Tok - ${profile.value?.name}'s profile`,
  description: `Podvodni-Tok - ${profile.value?.name}'s profile`,
  ogDescription: `Podvodni-Tok - ${profile.value?.name}'s profile`,
  ogImage: profile.value?.avatar,
  ogImageHeight: 300,
  ogUrl: `https://podvodni-tok.com/profile/${profile.value?.id}`,
});
</script>

<template>
  <TopNav />
  <div v-if="profile" class="pt-[90px] 2xl:pl-[185px] lg:pl-[160px] lg:pr-0 pr-2 w-[calc(100%-90px)] max-w-[1800px] 2xl:mx-auto">
    <div class="flex w-full items-center">
      <NuxtImg format="webp" class="rounded-full w-[150px] max-[450px]:w-[90px] max-[450px]:h-[90px]" :src="'/upload/avatars/' + profile?.avatar" />
      <div class="ml-5 w-full">
        <div class="text-[30px] font-bold truncate">
          {{ profile?.name }}
        </div>
        <div class="text-[18px] truncate">{{ profile?.name }}</div>
        <button
          v-if="id == user?.id"
          @click="$generalStore.isEditProfileOpen = true"
          class="flex item-center rounded-sm py-1.5 px-3.5 mt-3 text-[15px] font-semibold bg-[#3a3a3a] hover:bg-[#303030]"
        >
          <Icon class="mt-0.5 mr-1" name="mdi:pencil" size="18" />
          <div>Edit profile</div>
        </button>

        <button
          v-else-if="!$profileStore.friend || !$authStore.profile"
          @click="$profileStore.handleFriendAction('add', profile)"
          class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#F02C56]"
        >
          Follow
        </button>

        <button
          disabled
          v-else-if="$profileStore.friend.userId == $authStore.profile?.id && $profileStore.friend.status == 'pending'"
          class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#222222]"
        >
          Аpplication sent
        </button>

        <div
          v-else-if="$profileStore.friend.friendId == $authStore.profile?.id && $profileStore.friend.status == 'pending'"
          class="flex items-center gap-2"
        >
          <button
            @click="$profileStore.handleFriendAction('apply', profile)"
            class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-green-800"
          >
            Apply
          </button>
          <button
            @click="$profileStore.handleFriendAction('reject', profile)"
            class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-red-800"
          >
            Reject
          </button>
        </div>

        <p v-else-if="$profileStore.friend.status == 'accepted'">Your friend</p>
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
        <Icon name="material-symbols:lock-open" /> Liked
      </div>
    </div>

    <div
      v-if="$profileStore.currentVideos.length > 0"
      class="mt-4 grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3"
    >
      <Icon v-if="$profileStore.isLoading" class="animate-spin ml-1" name="mingcute:loading-line" size="100" color="#FFFFFF" />
      <PostUser v-else v-for="video in $profileStore.currentVideos" :key="video.id" :video="video" />
    </div>

    <div v-else class="mt-4 text-[15px] text-gray-500">
      No videos
    </div>
  </div>
</template>
