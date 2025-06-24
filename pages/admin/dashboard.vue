<script setup lang="ts">
import type { IVideo } from "~/types/user.type";

const { $adminStore } = useNuxtApp();

await $adminStore.getUsers(3);
await $adminStore.getVideos(3);
const blockedVideos = await $fetch<string[]>("/api/admin/video/blocked");
$adminStore.blockedVideos = blockedVideos;

const showModerateModal = (video: IVideo) => {
  $adminStore.isEditModalVisible = true;
  $adminStore.selectedVideo = video;
};
</script>
<template>
  <div>
    <AdminStats />
    <AdminVideos @show-moderate-modal="showModerateModal" />
    <AdminUsers />
  </div>
</template>
