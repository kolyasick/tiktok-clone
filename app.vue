<script setup lang="ts">
const { $generalStore, $authStore, $videosStore } = useNuxtApp();
const { user } = useUserSession();

if (user.value) {
  const profile = await $authStore.getProfileById(user.value.id);
  $authStore.profile = profile;
}
let socketData = ref(null);
let send = ref(null);

onMounted(async () => {
  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const { chats, fetchChats } = useChat();
  const { data: socketData, send } = useWebSocket(`${protocol}${location.host}/api/websocket`);
  await fetchChats();

  send(
    JSON.stringify({
      action: "online",
      room: "app",
      text: "online",
      sender: $authStore.profile,
    })
  );

  watch(socketData, (newValue) => {
    const message = JSON.parse(newValue);
    console.log(message);

    if (chats.value) {
      const s = chats.value;
      console.log(s);
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
