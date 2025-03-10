<script setup lang="ts">
import type { IVideo } from "~/types/user.type";

const { $adminStore } = useNuxtApp();

await $adminStore.getUsers(3);
await $adminStore.getVideos(3);

const showModerateModal = (video: IVideo) => {
  $adminStore.isEditModalVisible = true;
  $adminStore.selectedVideo = video;
};
</script>
<template>
  <AdminStats />
  <AdminVideos @show-moderate-modal="showModerateModal" />
  <AdminUsers />
</template>
