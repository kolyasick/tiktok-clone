<script setup lang="ts">
import type { IVideo } from "~/types/user.type";

const { $adminStore } = useNuxtApp();

const showModerateModal = (video: IVideo) => {
  $adminStore.isEditModalVisible = true;
  $adminStore.selectedVideo = video;
};
await $adminStore.getVideos();
</script>

<template>
  <AdminVideos @show-moderate-modal="showModerateModal" />
</template>
