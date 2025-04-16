<script setup lang="ts">
const { notifications, removeNotification } = useNotification();
</script>

<template>
  <div
    class="fixed z-50 space-y-2 top-16 xl:right-8 right-4 inline-flex flex-col items-end gap-2 w-full"
  >
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="p-4 rounded-lg shadow-lg min-w-52 relative overflow-hidden max-w-96"
        :class="{
          'bg-green-100 text-green-800': notification.type === 'success',
          'bg-red-100 text-red-800': notification.type === 'error',
          'bg-gray-100 text-gray-800': notification.type === 'info',
          'bg-yellow-100 text-yellow-800': notification.type === 'warning',
        }"
      >
        <div class="flex items-center justify-between">
          <div v-if="notification.sender" class="flex items-center gap-3">
            <NuxtLink :to="$localePath(`/profile/${notification.sender.name}`)">
              <img
                class="w-10 aspect-square object-cover rounded-full"
                :src="'/upload/avatars/' + notification.sender.avatar"
                alt=""
              />
            </NuxtLink>
            <div>
              <NuxtLink
                :to="$localePath(`/profile/${notification.sender.name}`)"
                class="text-sm font-medium break-words hover:underline"
              >
                {{ notification.sender.name }}</NuxtLink
              >
              <p class="text-sm font-medium break-words">
                {{ notification.message }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm font-medium break-words">{{ notification.message }}</p>
          <button
            @click="removeNotification(notification.id)"
            class="ml-4 text-current hover:opacity-75"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div
          class="absolute bottom-0 left-0 h-1"
          :class="{
            'bg-green-500': notification.type === 'success',
            'bg-red-500': notification.type === 'error',
            'bg-[#F02C56]': notification.type === 'info',
            'bg-yellow-500': notification.type === 'warning',
          }"
          :style="{ width: `${notification.progress}%` }"
        ></div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
