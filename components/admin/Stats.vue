<script setup lang="ts">
const { $adminStore } = useNuxtApp();
</script>

<template>
  <div id="24h">
    <h1 class="font-bold py-4 uppercase">{{ $t("admin.last24stats") }}</h1>
    <div id="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
      <div class="dark:bg-black/60 bg-white shadow-xl p-6 rounded-lg">
        <div class="flex flex-row space-x-4 items-center">
          <div id="stats-1">
            <IconsPeople class="w-10 h-10 dark:text-white text-gray-800" />
          </div>
          <div>
            <p class="text-[#F02C56] text-sm font-medium uppercase leading-4">{{ $t("admin.sidebar.users") }}</p>
            <p class="dark:text-white text-gray-800 font-bold text-2xl inline-flex items-center space-x-2">
              <span>+{{ $adminStore.users?.length }}</span>
              <span>
                <IconsSchedule class="w-6 h-6" />
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="dark:bg-black/60 bg-white shadow-xl p-6 rounded-lg">
        <div class="flex flex-row space-x-4 items-center">
          <div id="stats-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-10 h-10 dark:text-white text-gray-800"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <div>
            <p class="text-[#F02C56] text-sm font-medium uppercase leading-4">{{ $t("admin.blockedVideos") }}</p>
            <p class="dark:text-white text-gray-800 font-bold text-2xl inline-flex items-center space-x-2">
              <span>{{ $adminStore.blockedVideos?.length }}</span>
              <span>
                <IconsSchedule class="w-6 h-6 dark:text-white text-gray-800" />
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="dark:bg-black/60 bg-white shadow-xl p-6 rounded-lg">
        <div class="flex flex-row space-x-4 items-center">
          <div id="stats-1">
            <IconsVideos class="w-10 h-10 dark:text-white text-gray-800" />
          </div>
          <div>
            <p class="text-[#F02C56] text-sm font-medium uppercase leading-4">{{ $t("admin.sidebar.videos") }}</p>
            <p class="dark:text-white text-gray-800 font-bold text-2xl inline-flex items-center space-x-2">
              <span>+{{ $adminStore.videos?.length }}</span>
              <span>
                <IconsSchedule class="w-6 h-6 dark:text-white text-gray-800" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
