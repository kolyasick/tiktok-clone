<script setup lang="ts">
const { $adminStore } = useNuxtApp();
</script>

<template>
  <div id="24h">
    <h1 class="font-bold py-4 uppercase">Last 24h Statistics</h1>
    <div id="stats" class="grid gird-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-black/60 to-white/5 p-6 rounded-lg">
        <div class="flex flex-row space-x-4 items-center">
          <div id="stats-1">
            <IconsPeople class="w-10 h-10 text-white" />
          </div>
          <div>
            <p class="text-indigo-300 text-sm font-medium uppercase leading-4">Users</p>
            <p class="text-white font-bold text-2xl inline-flex items-center space-x-2">
              <span>+{{ $adminStore.users?.length }}</span>
              <span>
                <IconsSchedule class="w-6 h-6" />
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="bg-black/60 p-6 rounded-lg">
        <div class="flex flex-row space-x-4 items-center">
          <div id="stats-1">
            <IconsCoin class="w-10 h-10 text-white" />
          </div>
          <div>
            <p class="text-teal-300 text-sm font-medium uppercase leading-4">Income</p>
            <p class="text-white font-bold text-2xl inline-flex items-center space-x-2">
              <span>$2,873.88</span>
              <span>
                <IconsSchedule class="w-6 h-6" />
              </span>
            </p>
          </div>
        </div>
      </div>
      <div class="bg-black/60 p-6 rounded-lg">
        <div class="flex flex-row space-x-4 items-center">
          <div id="stats-1">
            <IconsVideos class="w-10 h-10 text-white" />
          </div>
          <div>
            <p class="text-blue-300 text-sm font-medium uppercase leading-4">VIDEOS</p>
            <p class="text-white font-bold text-2xl inline-flex items-center space-x-2">
              <span>+{{ $adminStore.videos?.length }}</span>
              <span>
                <IconsSchedule class="w-6 h-6" />
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
