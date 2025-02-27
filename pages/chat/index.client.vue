<script setup lang="ts">
import type { Chat, Profile } from "@prisma/client";
import UserOverlay from "~/components/chat/UserOverlay.vue";
import type { IMessage } from "~/types/user.type";

definePageMeta({
  middleware: ["auth", "chat"],
});

const { $generalStore, $authStore } = useNuxtApp();

const { send, chat, messages, createMessage } = useChat();
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
    chat.value = $generalStore.currentChat ?? null;
    messages.value = (chat.value?.messages ?? []) as IMessage[];
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

  const message = createMessage(text);
  messages.value.push(message);

  send(
    JSON.stringify({
      action: "message",
      room: chat.value?.id,
      text: text,
      sender: $authStore.profile,
    })
  );

  await $fetch("/api/chat/message/create", {
    method: "POST",
    body: {
      text,
      senderId: $authStore.profile?.id,
      chatId: chat.value?.id,
    },
  });
};

await fetchChats();
</script>

<template>
  <div>
    <TopNav />
    <div class="flex h-screen max-w-[1260px] mx-auto pt-[60px] border border-b-0 border-[#303030] max-[600px]:flex-col">
      <div class="w-1/4 bg-[#303030] max-[600px]:w-full">
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
        <div class="h-full w-3/4 flex items-center justify-center max-[600px]:w-full">Выберите, кому хотели бы написать</div>
      </template>

      <template v-else>
        <ChatOverlay @send-message="sendMessage" />
      </template>
    </div>
  </div>
</template>

<style scoped></style>
