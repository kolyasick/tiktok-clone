<script setup lang="ts">
const { $generalStore, $authStore, $videosStore } = useNuxtApp();
const { user } = useUserSession();
const { $io: socket } = useNuxtApp();

if (user.value) {
  const profile = await $authStore.getProfileById(user.value.id);
  $authStore.profile = profile;
}

onMounted(() => {
  if ($authStore.profile) {
    const { handleStatus } = useChat();
    socket.emit("setUser", $authStore.profile.id);
    handleStatus("online", $authStore.profile);
  }

  socket.on("offline", (userId: number) => {
    if ($generalStore.chats) {
      const user = $generalStore.chats.find((c) => c.companion.id === userId)?.companion;
      const companion = $generalStore.currentChat?.companion;

      if (user) {
        user.online = false;
      }

      if (companion && companion.id === userId) {
        companion.online = false;
      }
    }
  });
});

await $videosStore.getVideos();
</script>
<template>
  <NuxtLoadingIndicator color="#F02C56" />
  <NuxtPage />

  <AuthOverlay />

  <EditProfileOverlay v-if="$generalStore.isEditProfileOpen" />
</template>

<style>
body {
  @apply bg-[#121212];
  @apply text-[#ffffff];
}

* {
  transition: all 0.2s ease;
}
#__nuxt {
  min-height: 100vh;
  height: 100%;
  width: 100%;
}

::-webkit-scrollbar {
  width: 12px;
  background-color: #333;
}

::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 10px;
  border: 2px solid #333;
}

::-webkit-scrollbar-track {
  background-color: #333;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #777;
}

.modal-fadeenter-active,
.modal-fade-leave-active {
  transition: opacity 0.5s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
