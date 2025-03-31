<script setup lang="ts">
const { $generalStore, $authStore, $videosStore } = useNuxtApp();
const { user, loggedIn } = useUserSession();
const { $io: socket } = useNuxtApp();

if (user.value) {
  const profile = await $authStore.getProfileById(user.value.id);
  $authStore.profile = profile;
}

const handleOffline = async (userId: number) => {
  if (!userId) return;

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
};

const handleOnline = async (userId: number) => {
  if (!userId) return;

  if ($generalStore.chats) {
    const user = $generalStore.chats.find((c) => c.companion.id === userId)?.companion;
    const companion = $generalStore.currentChat?.companion;

    if (user) {
      user.online = true;
      user.updatedAt = new Date();
    }

    if (companion && companion.id === userId) {
      companion.online = true;
      companion.updatedAt = new Date();
    }
  }
};

const handleBeforeUnload = () => {
  if ($authStore.profile) {
    // Just emit offline event, don't try to make HTTP request
    socket.emit("offline", $authStore.profile.id);
  }
};

onMounted(async () => {
  const { handleStatus } = useChat();

  if (loggedIn.value && $authStore.profile) {
    // Set up socket event listeners first
    socket.on("online", handleOnline);
    socket.on("offline", handleOffline);

    // Then set user status
    socket.emit("setUser", $authStore.profile.id);
    await handleStatus("online", $authStore.profile);

    const handleVisibilityChange = async () => {
      if (!$authStore.profile) return;
      const status = document.visibilityState === "visible" ? "online" : "offline";
      await handleStatus(status, $authStore.profile);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    socket.on("connect", () => {
      if ($authStore.profile) {
        socket.emit("setUser", $authStore.profile.id);
      }
    });

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function
    onUnmounted(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket.off("online", handleOnline);
      socket.off("offline", handleOffline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if ($authStore.profile) {
        handleStatus("offline", $authStore.profile);
      }
    });
  }
});

await $videosStore.getVideos();
</script>
<template>
  <NuxtLoadingIndicator color="#F02C56" />
  <main>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </main>

  <AuthOverlay />

<<<<<<< HEAD
  <EditProfileOverlay v-if="$generalStore.isEditProfileOpen" />
=======
  <EditProfileOverlay  v-if="$generalStore.isEditProfileOpen" />
>>>>>>> 904310922f45fdf9d20e1e728ee021f7b20e7dfb
</template>

<style>
body {
  background-color: #121212;
  color: #fff;
  font-family: "Inter", sans-serif;
}

.main-pages-enter-active,
.main-pages-leave-active {
  transition: all 0.4s;
}
.main-pages-enter-from,
.main-pages-leave-to {
  opacity: 0;
  filter: blur(1rem);
}

* {
  transition: all 0.2s ease;
}

html {
  scrollbar-gutter: stable;
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
