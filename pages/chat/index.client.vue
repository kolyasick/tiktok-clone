<script setup lang="ts">
import type { Chat, Profile } from "@prisma/client";
import UserOverlay from "~/components/chat/UserOverlay.vue";
import type { IMessage } from "~/types/user.type";

definePageMeta({
  middleware: ["auth", "chat"],
});

const { $generalStore, $authStore } = useNuxtApp();

const { send, messages, createMessage } = useChat();
const isLoading = ref<boolean>(false);
const route = useRoute();

interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile & { online: boolean };
}

const fetchChats = async () => {
  const chatItems = await $fetch<IChat[]>("/api/chat", {
    query: {
      userId: $authStore.profile?.id,
    },
  });

  $generalStore.chats = chatItems;
};

const chatOpen = async (chat: IChat) => {
  navigateTo(`/chat?chatId=${chat.id}`);
};

watch(
  () => route.query.chatId,
  async (chatId) => {
    if (!chatId) return;

    isLoading.value = true;

    // const fetchChat = await $fetch<IChat>(`/api/chat/${chatId}`);

    // $generalStore.currentChat = fetchChat;
    isLoading.value = false;

    send(
      JSON.stringify({
        action: "subscribe",
        text: "Пользователь онлайн!",
        room: $generalStore.currentChat?.id,
      })
    );
  },
  { immediate: true }
);

watchEffect(async () => {
  messages.value = messages.value.filter((mes) => mes.action !== "typing" && mes.action !== "remove-typing");
});

const sendMessage = async (text: string) => {
  if (!text.trim()) return;

  const message = createMessage(text, "message", $authStore.profile || undefined);
  $generalStore.currentChat?.messages.push(message);

  send(
    JSON.stringify({
      action: "message",
      room: $generalStore.currentChat?.id,
      text: text,
      sender: $authStore.profile,
    })
  );

  await $fetch("/api/chat/message/create", {
    method: "POST",
    body: {
      text,
      senderId: $authStore.profile?.id,
      chatId: $generalStore.currentChat?.id,
    },
  });
};

await fetchChats();

useSeoMeta({
  title: "Podvodni-Tok | Chat",
  ogTitle: "Podvodni-Tok | Chat",
  description: "Create and share videos with your friends on Podvodni-Tok",
  ogDescription: "Create and share videos with your friends on Podvodni-Tok",
  ogImage: "/upload/avatars/default.png",
  ogImageHeight: 300,
  ogUrl: import.meta.env.BASE_URL,
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
          <Icon class="animate-spin ml-1" name="mingcute:loading-line" size="100" color="#FFFFFF" />
        </div>
      </template>

      <template v-else-if="!$generalStore.currentChat">
        <div class="h-full w-3/4 hidden sm:flex items-center justify-center max-[600px]:w-full">Выберите, кому хотели бы написать</div>
      </template>

      <template v-else>
        <ChatOverlay @send-message="sendMessage" />
      </template>
    </div>
  </div>
</template>

<style scoped></style>
