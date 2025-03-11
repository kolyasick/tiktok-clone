<script setup lang="ts">
const { $generalStore, $authStore, $videosStore } = useNuxtApp();
const { user } = useUserSession();
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
  console.log("reg1");
  await $fetch(`/api/profile/edit/${userId}`, {
    method: "PATCH",
    body: {
      online: false,
    },
  });
};

const handleBeforeUnload = async () => {
  if ($authStore.profile) {
    console.log("reg2");

    const r = await $fetch(`/api/profile/edit/${$authStore.profile?.id}`, {
      method: "PATCH",
      body: {
        online: false,
      },
    });
  }
};

onMounted(async () => {
  const { handleStatus } = useChat();

  if ($authStore.profile) {
    socket.emit("setUser", $authStore.profile.id);
    await handleStatus("online", $authStore.profile);

    document.addEventListener("visibilitychange", async () => {
      await handleStatus(document.visibilityState === "visible" ? "online" : "offline", $authStore.profile!);
    });
  }

  socket.on("connect", () => {
    socket.emit("setUser", $authStore.profile?.id);
  });

  socket.on("offline", handleOffline);

  window.addEventListener("beforeunload", async () => handleBeforeUnload);
});

onUnmounted(() => {
  socket.off("offline", handleOffline);
  window.removeEventListener("beforeunload", async () => handleBeforeUnload);
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

  <EditProfileOverlay />
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
