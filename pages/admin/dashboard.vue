<script setup lang="ts">
import type { Profile, Role, User } from "@prisma/client";
import Incomes from "~/components/admin/Incomes.vue";
import Stats from "~/components/admin/Stats.vue";
import Users from "~/components/admin/Users.vue";
import type { IVideo } from "~/types/user.type";

type UserWithProfile = Profile & {
  user: User & {
    role: Role;
  };
};
const users = await $fetch<UserWithProfile[]>("/api/admin/user/all");
const videos = await $fetch<IVideo[]>("/api/admin/video/all");
</script>
<template>
  <NuxtLayout name="admin-layout">
    <Stats :users-count="users.length" :videos-count="videos.length" />
    <Incomes :videos="videos" />
    <Users :users="users" />
  </NuxtLayout>
</template>
