<script setup lang="ts">
const { $adminStore } = useNuxtApp();
</script>

<template>
  <div id="24h">
    <h1 class="font-bold py-4 uppercase">Last 24h Statistics</h1>
    <div id="stats" class="grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="dark:bg-black/60 bg-white shadow-xl p-6 rounded-lg">
        <div class="flex flex-row space-x-4 items-center">
          <div id="stats-1">
            <IconsPeople class="w-10 h-10 dark:text-white text-gray-800" />
          </div>
          <div>
            <p class="text-[#F02C56] text-sm font-medium uppercase leading-4">Users</p>
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
            <IconsCoin class="w-10 h-10 dark:text-white text-gray-800" />
          </div>
          <div>
            <p class="text-[#F02C56] text-sm font-medium uppercase leading-4">Income</p>
            <p class="dark:text-white text-gray-800 font-bold text-2xl inline-flex items-center space-x-2">
              <span>$2,873.88</span>
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
            <IconsVideos class="w-10 h-10 text-white" />
          </div>
          <div>
            <p class="text-[#F02C56] text-sm font-medium uppercase leading-4">VIDEOS</p>
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
