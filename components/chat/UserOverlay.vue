<script setup lang="ts">
import type { Profile } from "@prisma/client";
import type { IChat } from "~/types/user.type";
const { $authStore } = useNuxtApp();

const props = defineProps<{ user: Profile }>();
const emit = defineEmits(["chat-open"]);

const handleOpen = (userId: number) => {
  emit("chat-open", userId);
};

const data = await $fetch<IChat>("/api/chat", {
  query: {
    user1Id: $authStore.profile?.id,
    user2Id: props.user.id,
  },
});

const lastMessage = computed(() => {
  return data?.messages ? data?.messages[data?.messages.length - 1] : null;
});


</script>

<template>
  <ul class="overflow-y-auto">
    <li @click="handleOpen(user.id)" class="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#212121] transition-colors duration-200">
      <img :src="'/upload/avatars/' + user.avatar" alt="Avatar" class="w-12 h-12 rounded-full object-cover" />

      <div class="flex flex-col justify-between w-full">
        <div class="flex justify-between items-center">
          <span class="text-white font-medium text-lg">{{ user.name }}</span>
          <span class="text-sm text-gray-400">{{ "Offline" }}</span>
        </div>

        <div v-if="lastMessage" class="text-gray-400 text-sm flex gap-2">
          <p>
            {{ lastMessage?.sender?.id === $authStore.profile?.id ? "You: " : lastMessage?.sender?.name + ": " }}
          </p>
          <span class="text-gray-300 truncate max-w-[90%] flex items-center justify-between w-full">
            <p>{{ lastMessage.text }}</p>
            <p class="text-gray-500">{{ formatDate(lastMessage.createdAt) }}</p>
          </span>
        </div>

        <div v-else>
          <p class="text-gray-400 text-sm">Say hi to {{ user.name }}</p>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped></style>
