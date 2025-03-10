<script setup lang="ts">
import type { User } from "@prisma/client";

const { $generalStore, $authStore, $videosStore } = useNuxtApp();
const { user } = useUserSession();
const { $io: socket } = useNuxtApp();

if (user.value) {
  const profile = await $authStore.getProfileById(user.value.id);
  $authStore.profile = profile;
}

const handleOffline = async (userId: number) => {
  if ($generalStore.chats) {
    const user = $generalStore.chats.find((c) => c.companion.id === userId)?.companion;
    const companion = $generalStore.currentChat?.companion;

    if (user) {
      user.online = false;
      user.updatedAt = new Date();
    }

    if (companion && companion.id === userId) {
      companion.online = false;
      companion.updatedAt = new Date();
    }
  }

  await $fetch(`/api/profile/edit/${userId}`, {
    method: "PATCH",
    body: {
      online: false,
    },
  });
};

const handleBeforeUnload = async () => {
  if ($authStore.profile) {
    await $fetch(`/api/profile/edit/${$authStore.profile?.id}`, {
      method: "PATCH",
      body: {
        online: false,
      },
    });
  }
};

onMounted(() => {
  if ($authStore.profile) {
    const { handleStatus } = useChat();
    socket.emit("setUser", $authStore.profile.id);
    handleStatus("online", $authStore.profile);
  }

  socket.on("connect", () => {
    socket.emit("setUser", $authStore.profile?.id);
  });

  socket.on("offline", handleOffline);

  window.addEventListener("beforeunload", handleBeforeUnload);
});

onUnmounted(() => {
  socket.off("offline", handleOffline);
  window.removeEventListener("beforeunload", handleBeforeUnload);
});

await $videosStore.getVideos();
</script>
<template>
  <NuxtLoadingIndicator color="#F02C56" />
  <main>
    <NuxtPage />

    <AuthOverlay />

    <EditProfileOverlay v-if="$generalStore.isEditProfileOpen" />
  </main>
</template>

<style>
body {
  background-color: #121212;
  color: #fff;
}

* {
  transition: all 0.2s ease;
}

button {
  white-space: nowrap;
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
