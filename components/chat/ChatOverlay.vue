<script setup lang="ts">
import type { Chat, Profile } from "@prisma/client";
import type { IMessage } from "~/types/user.type";

const emit = defineEmits(["send-message", "clear-current-chat", "update-messages"]);

interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile;
}

const props = defineProps<{ currentChat: IChat }>();
const { $authStore, $io: socket } = useNuxtApp();
const localePath = useLocalePath();

let text = ref<string>("");
let typingTimeout: NodeJS.Timeout;

const messagesContainer = ref<HTMLDivElement | null>(null);

const typingUser = ref<string | null>(null);

const handleSend = async () => {
  emit("send-message", text.value);

  socket.emit("stopTyping", props.currentChat?.id.toString());
  socket.emit("chatOpen", props.currentChat);
  text.value = "";
};

const handleTyping = () => {
  if (!props.currentChat || props.currentChat.user1Id === props.currentChat.user2Id) return;
  const data = {
    name: $authStore.profile?.name,
    chatId: props.currentChat?.id.toString(),
  };

  socket.emit("typing", data);

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping", data.chatId);
  }, 1000);
};

watch(
  () => [props.currentChat?.messages],
  async () => {
    await nextTick();
    // await checkUnreaded();
  },
  { deep: true }
);

const checkUnreaded = async () => {
  if (!messagesContainer.value) return;
  const unreadMessageIds = new Set<number>();
  const messagesToUpdate = new Map<number, { element: Element; dataId: number }>();

  messagesContainer.value?.querySelectorAll(".message[data-readed='false']").forEach((m) => {
    const senderId = Number(m.getAttribute("data-sender"));
    const dataId = Number(m.getAttribute("data-id"));

    if (senderId !== $authStore.profile?.id) {
      if (messagesContainer.value?.getBoundingClientRect().bottom! > m.getBoundingClientRect().y) {
        unreadMessageIds.add(dataId);
        messagesToUpdate.set(dataId, { element: m, dataId });
      }
    }
  });

  if (unreadMessageIds.size === 0) return;

  try {
    await $fetch("/api/chat/message/read", {
      method: "PATCH",
      body: {
        ids: Array.from(unreadMessageIds),
        isReaded: true,
      },
    });
    socket.emit("readMessages", props.currentChat.id, Array.from(unreadMessageIds));

    messagesToUpdate.forEach(({ element, dataId }) => {
      const message = props.currentChat.messages.find((m) => m.id === dataId);
      if (message) {
        message.isReaded = true;
      }
      element.setAttribute("data-readed", "true");
      emit("update-messages", props.currentChat.id, dataId);
    });
  } catch (error) {
    console.error("Ошибка при обновлении статуса сообщений:", error);
  }
};

const goBack = async () => {
  socket.emit("leaveChat", props.currentChat?.id.toString());

  await navigateTo(localePath("/chat"));
  emit("clear-current-chat");
};

const companion = computed(() => {
  return props.currentChat?.companion;
});

const isFavorite = computed(() => {
  return companion.value?.id === $authStore.profile?.id;
});

const scrollToTargetMessage = async () => {
  if (!messagesContainer.value || !$authStore.profile?.id) return;

  const firstUnread = messagesContainer.value.querySelectorAll(
    `.message[data-readed="false"][data-sender="${props.currentChat.companion.id}"]`
  );

  if (firstUnread.length) {
    firstUnread[0].scrollIntoView({ behavior: "instant", block: "end" });
  } else {
    const lastMessage = messagesContainer.value.querySelector(".message:last-child");
    lastMessage?.scrollIntoView({ behavior: "instant", block: "start" });
  }
};

let isCheckingUnread = false;
let scrollTimeout: NodeJS.Timeout;
let observer: IntersectionObserver | null = null;

const hasMore = ref(true);
const limit = ref(20);
const offset = ref(0);
const isLoadingMore = ref(false);
const loadMore = ref<HTMLDivElement>();

const loadMoreMessages = async () => {
  if (!hasMore.value || isLoadingMore.value) return;

  try {
    isLoadingMore.value = true;

    const container = messagesContainer.value;
    if (!container) return;

    const scrollTopBefore = container.scrollTop;
    const scrollHeightBefore = container.scrollHeight;

    const messages = await $fetch<IMessage[]>(`/api/chat/${props.currentChat.id}/messages`, {
      query: {
        limit: limit.value,
        offset: offset.value,
      },
    });

    if (messages.length) {
      props.currentChat.messages.unshift(...messages.reverse());
      offset.value += limit.value;
      hasMore.value = messages.length === limit.value;

      await nextTick();

      const scrollHeightAfter = container.scrollHeight;
      container.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
    }
  } catch (error) {
    console.log(error);
  } finally {
    isLoadingMore.value = false;
  }
};

onMounted(async () => {
  await loadMoreMessages();

  await scrollToTargetMessage();

  socket.on("typing", (data: { name: string; chatId: string }) => {
    typingUser.value = data.name;
  });

  socket.on("stopTyping", (chatId: string) => {
    if (Number(chatId) !== props.currentChat?.id) return;
    typingUser.value = "";
  });

  socket.on("readMessages", (chatId: number, messageIds: number[]) => {
    messageIds.forEach((messageId) => {
      const message = props.currentChat.messages.find((message) => message.id === messageId);
      if (message) {
        message.isReaded = true;
      }
    });
  });

  messagesContainer.value?.addEventListener("scroll", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      if (!isCheckingUnread) {
        isCheckingUnread = true;
        checkUnreaded().finally(() => {
          isCheckingUnread = false;
        });
      }
    }, 200);
  });

  checkUnreaded();

  observer = new IntersectionObserver(
    async (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          await loadMoreMessages();
        }
      }
    },
    {
      threshold: 0.1,
    }
  );

  if (loadMore.value) observer.observe(loadMore.value);
});

onUnmounted(() => {
  socket.off("typing");
  socket.off("stopTyping");
  messagesContainer.value?.removeEventListener("scroll", checkUnreaded);

  if (observer) observer.disconnect();
});
</script>

<template>
  <div
    class="absolute top-0 right-0 h-full w-full lg:static lg:w-3/4 flex flex-col bg-light dark:bg-[#191919] z-20"
  >
    <div
      class="sticky min-h-[64px] top-[61px] left-0 w-full py-2 px-6 bg-gray-100 dark:bg-[#222222] flex items-center z-10"
    >
      <button @click="goBack" class="inline-flex items-center">
        <IconsArrow class="w-6 h-6" />
      </button>
      <span class="flex-1 text-center">
        <NuxtLink
          :to="
            $localePath({
              name: 'profile-name',
              params: { name: companion?.name },
            })
          "
          class="text-xl text-gray-900 dark:text-white"
        >
          {{ !isFavorite ? companion?.name : $t("savedMessages") }}
        </NuxtLink>
        <p
          v-if="!isFavorite && (!typingUser || typingUser === $authStore.profile?.name)"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          {{ companion?.online ? $t("online") : $t("lastSeen") }}
          {{ !companion?.online ? useRelativeTime(companion!.lastSeen, $i18n.locale) : "" }}
        </p>
        <p
          v-else-if="!isFavorite && typingUser && typingUser !== $authStore.profile?.name"
          class="typing-animation text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center"
        >
          {{ typingUser }} {{ $t("isTyping") }}<span></span><span></span><span></span>
        </p>
      </span>
      <NuxtLink
        :to="
          $localePath({
            name: 'profile-name',
            params: { name: companion?.name },
          })
        "
      >
        <img
          class="rounded-full"
          width="40"
          :src="'/upload/avatars/' + (!isFavorite ? companion?.avatar : 'fav.jpeg')"
        />
      </NuxtLink>
    </div>
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 mt-14 sm:mt-0">
      <div ref="loadMore" class="w-full flex items-center justify-center">
        <IconsLoader v-if="isLoadingMore" class="w-10 h-10 animate-spin" />
      </div>
      <div
        v-for="(message, index) in props.currentChat?.messages"
        :key="message.id"
        :data-id="message.id"
        class="flex items-start mb-1 message"
        :data-readed="message.isReaded"
        :data-sender="message.senderId"
        :class="{
          'justify-end': message.senderId === $authStore.profile?.id,
          'justify-start': message.senderId !== $authStore.profile?.id,
        }"
      >
        <div class="flex items-start">
          <div
            :class="{
              'bg-[#F02C56] text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl pe-20':
                message.senderId === $authStore.profile?.id,
              'bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white rounded-tr-xl rounded-tl-xl rounded-br-xl pe-10':
                message.senderId !== $authStore.profile?.id,
            }"
            class="p-3 max-w-xs w-fit break-all shadow-md min-w-20 relative"
          >
            <span>
              {{ message.text }}
            </span>

            <div class="absolute bottom-1 right-1 flex items-center gap-1">
              <span class="text-xs text-gray-400 dark:text-gray-400">{{
                new Date(message.createdAt).toLocaleTimeString("ru-RU", {
                  hour: "numeric",
                  minute: "numeric",
                })
              }}</span>
              <span v-if="message.senderId === $authStore.profile?.id">
                <IconsRead v-if="message.isReaded" class="w-5 h-5" />
                <IconsUnread v-else class="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 border-gray-200 dark:border-[#303030] border-t flex items-center max-w-full">
      <input
        @keyup.enter="handleSend"
        type="text"
        @input="handleTyping"
        :placeholder="$t('typeMessage')"
        v-model="text"
        class="w-full px-4 py-2 transition text-gray-900 dark:text-white bg-white dark:bg-[#222222] rounded border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-[#F02C56] focus:outline-none"
      />
      <button
        @click="handleSend"
        :disabled="!text"
        class="ml-3 bg-[#F02C56] hover:bg-[#F02C56] text-white p-2 px-4 rounded shadow-lg transition-all disabled:bg-gray-400"
      >
        <IconsSend class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.typing-animation {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #6b7280;
}

.typing-animation span {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: 4px;
  background-color: #6b7280;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-animation span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-animation span:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-animation span:nth-child(3) {
  animation-delay: 0s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
    opacity: 0.3;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
