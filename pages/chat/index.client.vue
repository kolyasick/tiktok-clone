<script setup lang="ts">
import type { Chat, Profile } from "@prisma/client";
import UserOverlay from "~/components/chat/UserOverlay.vue";
import type { IMessage } from "~/types/user.type";
interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile & { online: boolean };
}

definePageMeta({
  middleware: ["auth", "chat"],
});

const { $authStore, $generalStore } = useNuxtApp();
const isLoading = ref<boolean>(false);
const route = useRoute();
const { $io: socket } = useNuxtApp();

const fetchChats = async () => {
  const chatItems = await $fetch<IChat[]>("/api/chat", {
    query: {
      userId: $authStore.profile?.id,
    },
  });

  $generalStore.$patch({ chats: chatItems });
};

await fetchChats();

const chatOpen = async (chat: IChat) => {
  navigateTo(`/chat?chatId=${chat.id}`);
};

watch(
  () => route.query.chatId,
  async (chatId, oldId) => {
    if (!chatId) {
      $generalStore.$patch({ currentChat: null });
      return;
    }

    isLoading.value = true;

    if (oldId) {
      socket.emit("stopTyping", oldId);
      socket.emit("leaveChat", oldId);
    }

    socket.emit("joinChat", chatId);

    isLoading.value = false;
  },
  { immediate: true }
);

const sendMessage = async (text: string) => {
  if (!text.trim()) return;

  if (!$generalStore.currentChat || !$authStore.profile) return;

  const message: IMessage = {
    id: Date.now(),
    chatId: $generalStore.currentChat?.id,
    senderId: $authStore.profile?.id,
    text,
    createdAt: new Date(),
    updatedAt: new Date(),
    sender: $authStore.profile,
  };

  socket.emit("chatMessage", message);

  await $fetch("/api/chat/message/create", {
    method: "POST",
    body: {
      text,
      senderId: $authStore.profile?.id,
      chatId: $generalStore.currentChat?.id,
    },
  });
};

useSeoMeta({
  title: "Podvodni-Tok | Chat",
  ogTitle: "Podvodni-Tok | Chat",
  description: "Create and share videos with your friends on Podvodni-Tok",
  ogDescription: "Create and share videos with your friends on Podvodni-Tok",
  ogImage: "/upload/avatars/default.jpg",
  ogImageHeight: 300,
  ogUrl: import.meta.env.BASE_URL,
});

onMounted(() => {
  socket.on("chatMessage", (message: IMessage) => {
    const chat = $generalStore.chats?.find((chat) => chat.id === message.chatId);
    if (chat) chat.messages.push(message);
    if ($generalStore.currentChat?.id === message.chatId) {
      $generalStore.currentChat.messages.push(message);
    }
  });
});

onUnmounted(() => {
  socket.off("chatMessage");
});
</script>

<template>
  <div>
    <TopNav />
    <div class="container flex h-[calc(100vh-61px)]">
      <div class="w-full sm:w-1/4 bg-[#303030] relative">
        <div class="p-4 border-b border-[#ebebeb6c]">
          <h2 class="text-xl font-semibold">Friends</h2>
        </div>
        <ul>
          <UserOverlay v-for="chat in $generalStore.chats" :key="chat.id" :chat="chat" @chat-open="chatOpen" />
        </ul>
      </div>

      <template v-if="isLoading">
        <div class="h-full w-3/4 flex items-center justify-center max-[600px]:w-full">
          <IconsLoader class="animate-spin ml-1 w-24 h-24" />
        </div>
      </template>

      <template v-else-if="!$generalStore.currentChat">
        <div class="h-full w-3/4 hidden sm:flex items-center justify-center max-[600px]:w-full">
          Выберите, кому хотели бы написать
        </div>
      </template>

      <template v-else>
        <ChatOverlay @send-message="sendMessage" />
      </template>
    </div>
  </div>
</template>

<style scoped></style>
