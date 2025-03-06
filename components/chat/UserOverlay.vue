<script setup lang="ts">
import type { Chat, Profile } from "@prisma/client";
import type { IMessage } from "~/types/user.type";

const { $authStore } = useNuxtApp();
interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile & { online: boolean };
}
const props = defineProps<{ chat: IChat }>();
const emit = defineEmits(["chat-open"]);

const handleOpen = (chat: IChat) => {
  emit("chat-open", chat);
};

const lastMessage = computed(() => {
  return props.chat.messages[props.chat.messages.length - 1] ?? null;
});
</script>

<template>
  <ul class="overflow-y-auto">
    <li
      @click="handleOpen(chat)"
      class="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#212121] transition-colors duration-200 overflow-hidden"
    >
      <div class="w-10 h-10 object-cover relative shrink-0">
        <img :src="'/upload/avatars/' + chat.companion.avatar" class="rounded-full aspect-square object-cover" alt="Avatar" />
        <span class="status w-2 h-2 bg-green-500 rounded-full absolute bottom-0 right-0" v-if="chat.companion.online"></span>
      </div>

      <div class="flex flex-col justify-between w-full">
        <div class="flex justify-between items-center">
          <span class="text-white font-medium text-lg">{{ chat.companion.name }}</span>
        </div>

        <div v-if="lastMessage" class="text-gray-400 text-sm flex gap-2">
          <p>
            {{ lastMessage?.sender?.id === $authStore.profile?.id ? "You: " : lastMessage?.sender?.name + ": " }}
          </p>
          <span class="text-gray-300 truncate max-w-[90%] flex items-center justify-between w-full">
            <p class="truncate max-w-20">{{ lastMessage.text }}</p>
            <p class="text-gray-500">{{ formatDate(lastMessage.createdAt) }}</p>
          </span>
        </div>

        <div v-else>
          <p class="text-gray-400 text-sm">Say hi to {{ chat.companion.name }}</p>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped></style>
