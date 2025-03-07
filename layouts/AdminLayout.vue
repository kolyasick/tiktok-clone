<script setup lang="ts"></script>

<template>
  <div class="antialiased bg-black w-full min-h-screen text-slate-300 relative py-4">
    <div class="grid grid-cols-12 mx-auto gap-2 sm:gap-4 md:gap-6 lg:gap-10 xl:gap-14 max-w-7xl my-10 px-2">
      <AdminSideBar />
      <div id="content" class="bg-white/10 col-span-9 rounded-lg p-6">
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
