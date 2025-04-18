<script setup lang="ts">
import type { Follows } from "@prisma/client";
import type { IProfile } from "./types/user.type";

const { $generalStore, $authStore } = useNuxtApp();
const { user, loggedIn } = useUserSession();
const { $io: socket } = useNuxtApp();
const { addNotification } = useNotification();
const { t } = useI18n();

let activityInterval: NodeJS.Timeout | null = null;

if (user.value) {
  const profile = await $authStore.getProfileById(user.value.id);
  $authStore.profile = profile;
}

const { handleStatus } = useChat();

const handleOffline = async (userId: number) => {
  await handleStatus("offline", userId);
};

const handleOnline = async (userId: number) => {
  await handleStatus("online", userId);
};
const sendActivity = async () => {
  if (!$authStore.profile?.id) return;

  try {
    await $fetch("/api/activity");
  } catch (error) {
    console.error("Ошибка при отправке активности:", error);
  }
};
let statusInterval = null as NodeJS.Timeout | null;

onMounted(async () => {
  socket.on("connect", () => {
    console.log("connect app.vue");
  });
  if (loggedIn.value && $authStore.profile) {
    socket.on("offline", handleOffline);
    socket.on("online", handleOnline);

    statusInterval = setInterval(() => {
      socket.on("online", handleOnline);
      socket.on("offline", handleOffline);
    }, 30000);

    socket.emit("setUser", $authStore.profile.id);
    await handleStatus("online", $authStore.profile?.id);

    activityInterval = setInterval(sendActivity, 1000 * 10);
    await sendActivity();

    socket.on("connect", () => {
      if ($authStore.profile) {
        socket.emit("setUser", $authStore.profile.id);
      }
    });
  }

  socket.on(
    "notification",
    (data: { to: number; message: string; sender?: IProfile; messageType?: string }) => {
      if (data.to === $authStore.profile?.id) {
        addNotification({
          message:
            data.messageType !== "message" ? t(`notification.${data.messageType}`) : data.message,
          sender: data.sender,
          messageType: data.messageType,
          duration: null,
          type: "info",
        });
      }
    }
  );
});

onUnmounted(() => {
  if (loggedIn.value && $authStore.profile) {
    socket.off("online");
    socket.off("offline");
    socket.off("connect");
    socket.off("notification");
    socket.off("userStatuses");

    if (activityInterval) {
      clearInterval(activityInterval);
    }

    if (statusInterval) {
      clearInterval(statusInterval);
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
  <Notification />
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
  @apply bg-light dark:bg-dark;
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
