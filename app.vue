<script setup lang="ts">
const { $generalStore, $authStore, $videosStore } = useNuxtApp();
const { user } = useUserSession();

if (user.value) {
  const profile = await $authStore.getProfileById(user.value.id);
  $authStore.profile = profile;
}

onMounted(async () => {
  if (!$authStore.profile) return;

  const { handleStatus } = useChat();

  const handleVisibilityChange = async () => {
    if (!$authStore.profile) return;

    if (document.visibilityState === "visible") {
      await handleStatus("online", $authStore.profile);
    } else {
      await handleStatus("offline", $authStore.profile);
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  onBeforeUnmount(() => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });

  watchEffect(async () => {
    if ($authStore.profile) {
      await handleStatus("online", $authStore.profile);
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
