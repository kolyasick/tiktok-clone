<script setup lang="ts">
import type { Friendship, Profile } from "@prisma/client";
import type { IVideo } from "~/types/user.type";

const { $authStore } = useNuxtApp();
const { user } = useUserSession();
const profile = ref<Profile | null>(null);
const videos = ref<IVideo[]>([]);
const friend = ref<Friendship | null>(null);

const route = useRoute();
const { id } = route.params as Partial<{ id: number }>;

const loadData = async () => {
  try {
    if (id == $authStore.profile?.id) {
      profile.value = $authStore.profile;
    } else {
      profile.value = await $authStore.getProfile(id || 0);
    }

    videos.value = await $fetch<IVideo[]>("/api/video", {
      query: { userId: $authStore.profile?.id },
    });

    if (profile.value?.id) {
      friend.value = await $fetch<Friendship>("/api/friend", {
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

const handleFriendAction = async (action: "add" | "apply" | "reject") => {
  try {
    let endpoint = "/api/friend/add";
    let body = {
      userId: $authStore.profile?.id,
      friendId: profile.value?.id,
    };

    if (action === "apply") {
      endpoint = "/api/friend/apply";
      body = {
        userId: profile.value?.id || 0,
        friendId: $authStore.profile?.id || 0,
      };
    } else if (action === "reject") {
      endpoint = "/api/friend/reject";
    }

    friend.value = await $fetch<Friendship>(endpoint, {
      method: "POST",
      body,
    });
  } catch (error) {
    console.error("Error handling friend action:", error);
  }
};


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
  <div class="pt-[90px] 2xl:pl-[185px] lg:pl-[160px] lg:pr-0 pr-2 w-[calc(100%-90px)] max-w-[1800px] 2xl:mx-auto">
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
          v-else-if="!friend"
          @click="handleFriendAction('add')"
          class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#F02C56]"
        >
          Follow
        </button>

        <button
          disabled
          v-else-if="friend.userId == $authStore.profile?.id && friend.status == 'pending'"
          class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-[#222222]"
        >
          Аpplication sent
        </button>

        <div v-else-if="friend.friendId == $authStore.profile?.id && friend.status == 'pending'" class="flex items-center gap-2">
          <button
            @click="handleFriendAction('apply')"
            class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-green-800"
          >
            Apply
          </button>
          <button
            @click="handleFriendAction('reject')"
            class="flex item-center rounded-md py-1.5 px-8 mt-3 text-[15px] text-white font-semibold bg-red-800"
          >
            Reject
          </button>
        </div>

        <p v-else-if="friend.status == 'accepted'">Your friend</p>
      </div>
    </div>

    <div class="flex items-center pt-4">
      <div class="mr-4">
        <span class="font-bold">10K</span>
        <span class="text-gray-500 font-light text-[15px] pl-1.5">Following</span>
      </div>
      <div class="mr-4">
        <span class="font-bold">44K</span>
        <span class="text-gray-500 font-light text-[15px] pl-1.5">Followers</span>
      </div>
      <div class="mr-4">
        <span class="font-bold">111k</span>
        <span class="text-gray-500 font-light text-[15px] pl-1.5">Likes</span>
      </div>
    </div>

    <div class="w-full flex items-center pt-4 border-b">
      <div class="w-60 text-center py-2 text-[17px] font-semibold border-b-2 border-b-black">Videos</div>
      <div class="w-60 text-gray-500 text-center py-2 text-[17px] font-semibold"><Icon name="material-symbols:lock-open" class="mb-0.5" /> Liked</div>
    </div>

    <div v-if="videos.length > 0" class="mt-4 grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-3">
      <PostUser v-for="video in videos" :key="video.id" :video="video" />
    </div>
  </div>
</template>
