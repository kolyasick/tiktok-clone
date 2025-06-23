<script setup lang="ts">
import { ref } from "vue";
const sidebarOpen = ref(false);
</script>

<template>
  <div class="antialiased bg-light dark:bg-black w-full min-h-screen text-gray-900 dark:text-slate-300 relative">
    <div class="flex mx-auto gap-2 sm:gap-4 md:gap-6 lg:gap-10 xl:gap-14 max-w-full min-h-screen">
      <!-- Кнопка-гамбургер для мобильных -->
      <button class="lg:hidden fixed top-4 left-4 z-50 bg-white dark:bg-dark p-2 rounded shadow" @click="sidebarOpen = true">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <!-- Sidebar -->
      <AdminSideBar :mobile-open="sidebarOpen" @close-mobile="sidebarOpen = false" />
      <div id="content" class="bg-white dark:bg-white/10 p-2 sm:p-6 flex-1 ml-0 lg:ml-72 transition-all duration-300">
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
