<script setup lang="ts"></script>

<template>
  <div class="antialiased bg-light dark:bg-black w-full min-h-screen text-gray-900 dark:text-slate-300 relative">
    <div class="flex mx-auto gap-2 sm:gap-4 md:gap-6 lg:gap-10 xl:gap-14 max-w-full min-h-screen">
      <AdminSideBar />
      <div id="content" class="bg-white dark:bg-white/10 p-6 flex-1 ml-72">
        <slot />
      </div>
    </div>

    <Transition name="slide-fade">
      <AdminVideoModerateModal v-if="$adminStore.isEditModalVisible" />
    </Transition>
  </div>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
