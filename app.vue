<script setup lang="ts">
import type { Follows } from "@prisma/client";

const { $generalStore, $authStore } = useNuxtApp();
const { user, loggedIn } = useUserSession();
const { $io: socket } = useNuxtApp();

let activityInterval: NodeJS.Timeout | null = null;

if (user.value) {
  const profile = await $authStore.getProfileById(user.value.id);
  $authStore.profile = profile;
}

const { handleStatus } = useChat();

const handleOffline = async (userId: number) => {
  if (!userId) return;
  const { chats } = useChat();

  if (chats.value) {
    const user = chats.value.find((c) => c.companion.id === userId)?.companion;

    if (user) {
      user.online = false;
      user.updatedAt = new Date();
    }
  }
};

const handleOnline = async (userId: number) => {
  if (!userId) return;
  const { chats, currentChat } = useChat();

  if (chats.value) {
    const user = chats.value.find((c) => c.companion.id === userId)?.companion;
    const companion = currentChat.value?.companion;

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
    socket.emit("offline", $authStore.profile.id);
  }
};

const handleVisibilityChange = async () => {
  if (!$authStore.profile) return;
  const status = document.visibilityState === "visible" ? "online" : "offline";
  await handleStatus(status, $authStore.profile);
};

const sendActivity = async () => {
  if (!$authStore.profile?.id) return;

  try {
    await $fetch("/api/activity", {
      query: { userId: $authStore.profile.id },
      method: "GET",
    });
  } catch (error) {
    console.error("Ошибка при отправке активности:", error);
  }
};

onMounted(async () => {
  if (loggedIn.value && $authStore.profile) {
    socket.on("online", handleOnline);
    socket.on("offline", handleOffline);

    socket.emit("setUser", $authStore.profile.id);
    await handleStatus("online", $authStore.profile);

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    activityInterval = setInterval(sendActivity, 1000 * 50);
    await sendActivity();

    socket.on("connect", () => {
      if ($authStore.profile) {
        socket.emit("setUser", $authStore.profile.id);
      }
    });
  }
});

onUnmounted(() => {
  if (loggedIn.value && $authStore.profile) {
    socket.off("online");
    socket.off("offline");
    socket.off("connect");
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("beforeunload", handleBeforeUnload);

    if (activityInterval) {
      clearInterval(activityInterval);
    }
  }
});

const { data: followers } = await useFetch<Follows[]>(`/api/friend/all`, {
  query: {
    userId: $authStore.profile?.id,
  },
});

$authStore.followers = followers.value || [];
</script>

<template>
  <NuxtLoadingIndicator color="#F02C56" />
  <main class="bg-light dark:bg-dark text-gray-900 dark:text-white">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </main>

  <AuthOverlay />

  <EditProfileOverlay v-if="$generalStore.isEditProfileOpen" />
</template>

<style>
body {
  font-family: "Inter", sans-serif;
  @apply dark:bg-dark bg-gray-50;
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

html {
  scrollbar-gutter: stable;
}

button {
  white-space: nowrap;
}
::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
* {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
#__nuxt {
  min-height: 100vh;
  height: 100%;
  width: 100%;
}

::-webkit-scrollbar {
  width: 12px;
  background-color: theme("colors.light.darker");
}

::-webkit-scrollbar-thumb {
  background-color: theme("colors.light.darkest");
  border-radius: 10px;
  border: 2px solid theme("colors.light.darker");
}

.dark ::-webkit-scrollbar {
  background-color: theme("colors.dark.lighter");
}

.dark ::-webkit-scrollbar-thumb {
  background-color: theme("colors.dark.lightest");
  border: 2px solid theme("colors.dark.lighter");
}

::-webkit-scrollbar-track {
  background-color: theme("colors.light.darker");
}

.dark ::-webkit-scrollbar-track {
  background-color: theme("colors.dark.lighter");
}

::-webkit-scrollbar-thumb:hover {
  background-color: theme("colors.light.darkest");
}

.dark ::-webkit-scrollbar-thumb:hover {
  background-color: theme("colors.dark.lightest");
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
