<script setup lang="ts">
import type { Chat, Profile } from "@prisma/client";
import UserOverlay from "~/components/chat/UserOverlay.vue";
import type { IMessage, IProfile } from "~/types/user.type";

interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile;
}

definePageMeta({
  middleware: ["auth", "chat"],
});

const { $authStore } = useNuxtApp();
const { $io: socket } = useNuxtApp();
const { addNotification } = useNotification();

const { chats, currentChat, updateChatStatus } = useChat();

const isLoading = ref<boolean>(false);
const route = useRoute();
const query = ref<string>("");

const filteredChats = computed(() => {
  return chats.value?.filter((chat) => {
    return (
      chat.companion.name.toLowerCase().includes(query.value.toLowerCase()) ||
      chat.messages.some((message) =>
        message.text.toLowerCase().includes(query.value.toLowerCase())
      )
    );
  });
});

socket.on("chatOpen", async (chat: IChat) => {
  const isChatExist = chats.value?.some((c) => c.id === chat.id);

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
  chats.value = sortedChats;
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
  () => currentChat.value?.messages,
  () => {
    const sortedChats = sortChatsByLastMessage(chats.value!);
    chats.value = sortedChats;
  },
  { deep: true }
);

watch(
  () => route.query.chatId,
  async (chatId, oldId) => {
    if (!chatId) {
      currentChat.value = null;
      return;
    }

    try {
      isLoading.value = true;
      const chat = await $fetch<IChat>(`/api/chat/${chatId}`, {
        query: { userId: $authStore.profile?.id },
      });
      currentChat.value = chat;
    } catch (e) {
      console.log(e);
      await navigateTo("/chat");
    } finally {
      isLoading.value = false;
    }

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

  if (!currentChat.value || !$authStore.profile) return;

  const message: IMessage = {
    id: Date.now(),
    chatId: currentChat.value?.id,
    senderId: $authStore.profile?.id,
    text,
    createdAt: new Date(),
    updatedAt: new Date(),
    sender: $authStore.profile,
  };

  socket.emit("chatMessage", message);
  socket.emit("notification", {
    to: currentChat.value.companion.id,
    sender: message.sender,
    message: message.text,
    messageType: "message",
  });

  await $fetch("/api/chat/message/create", {
    method: "POST",
    body: {
      text,
      senderId: $authStore.profile?.id,
      chatId: currentChat.value?.id,
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
    const chat = chats.value?.find((chat) => chat.id === message.chatId);
    if (chat) chat.messages.push(message);
    if (currentChat.value?.id === message.chatId) {
      currentChat.value.messages.push(message);
    }
  });

  socket.on("online", (userId: number) => {
    updateChatStatus(userId, true);
  });

  socket.on("offline", (userId: number) => {
    updateChatStatus(userId, false);
  });
});

onUnmounted(() => {
  socket.off("chatMessage");
  socket.off("online");
  socket.off("offline");
});
</script>

<template>
  <div>
    <TopNav />
    <div class="container flex h-[calc(100vh-61px)]">
      <div class="w-full sm:w-1/4 dark:bg-neutral-800 bg-gray-100 relative mr-[1px]">
        <form class="flex justify-center items-center h-[64px] mx-4">
          <input
            class="dark:bg-[#3a3a3a] dark:text-white bg-white text-gray-900 py-2 px-4 rounded-md w-full focus:outline-none"
            type="text"
            :placeholder="$t('search')"
            v-model="query"
          />
        </form>
        <ul>
          <UserOverlay
            v-if="filteredChats?.length"
            v-for="chat in filteredChats"
            :key="chat.id"
            :chat="chat"
          />
          <div v-else class="flex items-center justify-center text-gray-600 dark:text-gray-400">
            <h3>{{ $t("noChats") }}</h3>
          </div>
        </ul>
      </div>

      <template v-if="isLoading">
        <div class="h-full w-3/4 flex items-center justify-center max-[600px]:w-full">
          <IconsLoader class="animate-spin ml-1 w-24 h-24" />
        </div>
      </template>

      <template v-else-if="!currentChat">
        <div
          class="h-full dark:bg-neutral-900 bg-gray-200 w-3/4 hidden sm:flex items-center justify-center max-[600px]:w-full"
        >
          <h3 class="py-1 px-3 dark:bg-neutral-800 text-white bg-gray-300 rounded-full">
            {{ $t("startMessaging") }}
          </h3>
        </div>
      </template>

      <template v-else>
        <ChatOverlay
          :current-chat="currentChat"
          @send-message="sendMessage"
          @clear-current-chat="currentChat = null"
        />
      </template>
    </div>
  </div>
</template>

<style scoped></style>
