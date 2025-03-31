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

socket.on("chatOpen", async (chat: IChat) => {
  const isChatExist = $generalStore.chats?.some((c) => c.id === chat.id);

  if (!isChatExist) {
    await fetchChats();
  }
});

const fetchChats = async () => {
  const chat = await $fetch<IChat>("/api/chat/open", {
    method: "POST",
    body: {
      user1Id: $authStore.profile?.id,
      user2Id: $authStore.profile?.id,
    },
  });

  const chatItems = await $fetch<IChat[]>("/api/chat", {
    query: {
      userId: $authStore.profile?.id,
    },
  });

  const sortedChats = sortChatsByLastMessage(chatItems);
  $generalStore.$patch({ chats: sortedChats });
};

const sortChatsByLastMessage = (chats: IChat[]): IChat[] => {
  return chats.sort((a, b) => {
    const lastMessageA = a.messages[a.messages.length - 1]?.createdAt || 0;
    const lastMessageB = b.messages[b.messages.length - 1]?.createdAt || 0;

    return new Date(lastMessageB).getTime() - new Date(lastMessageA).getTime();
  });
};

await fetchChats();

watch(
  () => $generalStore.currentChat?.messages,
  () => {
    const sortedChats = sortChatsByLastMessage($generalStore.chats!);
    $generalStore.$patch({ chats: sortedChats });
  },
  { deep: true }
);

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
  title: "Clipify | Chat",
  ogTitle: "Clipify | Chat",
  description: "Create and share videos with your friends on Clipify",
  ogDescription: "Create and share videos with your friends on Clipify",
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
      <div class="w-full sm:w-1/4 bg-[#222222] relative mr-[1px]">
        <form class="flex justify-center items-center h-[64px] mx-4">
          <input class="bg-[#3a3a3a] py-2 px-4 rounded-md w-full focus:outline-none" type="text" placeholder="Поиск" />
        </form>
        <ul>
          <UserOverlay v-for="chat in $generalStore.chats" :key="chat.id" :chat="chat" />
        </ul>
      </div>

      <template v-if="isLoading">
        <div class="h-full w-3/4 flex items-center justify-center max-[600px]:w-full">
          <IconsLoader class="animate-spin ml-1 w-24 h-24" />
        </div>
      </template>

      <template v-else-if="!$generalStore.currentChat">
        <div class="h-full bg-[#191919] w-3/4 hidden sm:flex items-center justify-center max-[600px]:w-full">
          <h3 class="py-1 px-3 bg-[#222222] rounded-full">Select a chat to start messaging</h3>
        </div>
      </template>

      <template v-else>
        <ChatOverlay @send-message="sendMessage" />
      </template>
    </div>
  </div>
</template>

<style scoped></style>
