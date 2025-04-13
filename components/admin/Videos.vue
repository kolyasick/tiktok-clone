<script setup lang="ts">
import type { IVideo } from "~/types/user.type";

const { $adminStore } = useNuxtApp();
const emit = defineEmits<{
  (e: "showModerateModal", video: IVideo): void;
}>();
</script>

<template>
  <div id="last-incomes">
    <h1 class="font-bold py-4 uppercase">Last uploaded videos</h1>
    <div id="stats" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        @click="emit('showModerateModal', video)"
        v-for="video in $adminStore.videos"
        :key="video.id"
        class="dark:bg-black/60 bg-white shadow-xl overflow-hidden to-white/5 rounded-lg cursor-pointer hover:-translate-y-2 hover:shadow-xl transition"
      >
        <div class="flex flex-row items-center">
          <div class="aspect-square w-24 flex-shrink-0 p-4">
            <video
              :src="'/upload/videos/' + video.url"
              class="w-full h-full object-cover rounded-lg"
              muted
              preload="metadata"
            ></video>
          </div>
          <div class="p-2 max-w-[200px]">
            <p class="text-xl font-bold truncate">{{ video.title }}</p>
            <p class="text-gray-500 font-medium">{{ video.profile?.name }}</p>
            <p class="text-gray-500 text-sm">{{ formatDate(video.createdAt) }}</p>
          </div>
        </div>
        <div class="border-t border-white/5 p-4 flex items-center justify-between">
          <a href="#" class="inline-flex space-x-2 items-center text-center">
            <IconsInfo class="w-6 h-6" />
            <span>Info</span>
          </a>
          <span
            :class="[
              {
                'text-green-400': video.status?.title === 'published',
                'text-red-400': video.status?.title === 'blocked',
              },
              'font-semibold',
            ]"
            >{{ video.status?.title }}</span
          >
        </div>
      </div>
    </div>

    <NuxtLink
      v-if="$route.path !== '/admin/videos'"
      to="/admin/videos"
      class="mt-5 inline-block font-semibold text-indigo-600"
      >Show more</NuxtLink
    >
  </div>
</template>
