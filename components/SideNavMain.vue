<script setup lang="ts">
const { user } = useUserSession();
const { $videosStore, $authStore } = useNuxtApp();
const router = useRouter();
</script>

<template>
  <aside
    id="SideNavMain"
    class="sticky pt-20 -mt-20 -m-4 top-0 left-0 z-20 bg-light dark:bg-dark hidden sm:block h-screen border-r border-gray-200 dark:border-neutral-800 w-20"
  >
    <div class="w-full mt-5 flex flex-col justify-center items-center">
      <button
        class="flex w-full items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 py-2"
        @click="navigateTo($localePath('/video'))"
      >
        <IconsHouse class="w-7 h-7 text-gray-900 dark:text-white" />
      </button>

      <button
        class="flex w-full items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 py-2"
      >
        <IconsPeople class="w-7 h-7 text-gray-900 dark:text-white" />
      </button>

      <button
        class="flex w-full items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-800 py-2"
      >
        <IconsCam class="w-7 h-7 text-gray-900 dark:text-white" />
      </button>
      <NuxtLink
        class="flex w-full items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-800 py-2"
        v-if="user?.role === 'admin'"
        to="/admin/dashboard"
      >
        <IconsAdmin class="w-7 h-7 text-gray-900 dark:text-white" />
      </NuxtLink>
    </div>
  </aside>
</template>

<style scoped></style>
