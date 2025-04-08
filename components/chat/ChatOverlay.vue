<script setup lang="ts">
import type { Chat, Profile } from "@prisma/client";
import type { IMessage } from "~/types/user.type";

const emit = defineEmits(["send-message", "clear-current-chat"]);

interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile;
}

const props = defineProps<{ currentChat: IChat }>();
const { $authStore, $generalStore } = useNuxtApp();

let text = ref<string>("");
let typingTimeout: NodeJS.Timeout;
const typingUser = ref<string | null>(null);
const { $io: socket } = useNuxtApp();

const handleSend = () => {
  emit("send-message", text.value);
  socket.emit("stopTyping", props.currentChat?.id.toString());
  socket.emit("chatOpen", props.currentChat);
  text.value = "";
};

const handleTyping = () => {
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

const messagesContainer = ref<HTMLDivElement | null>(null);

watch(
  () => [props.currentChat?.messages, typingUser],
  async () => {
    await nextTick();
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  },
  { deep: true }
);

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }

  socket.on("typing", (name: string) => {
    typingUser.value = name;
  });

  socket.on("stopTyping", () => {
    typingUser.value = "";
  });
});

onUnmounted(() => {
  socket.off("typing");
  socket.off("stopTyping");
});

const goBack = async () => {
  socket.emit("leaveChat", props.currentChat?.id.toString());

  await navigateTo("/chat");
  emit("clear-current-chat");
};

const companion = computed(() => {
  return props.currentChat?.companion;
});

const isFavorite = computed(() => {
  return companion.value?.id === $authStore.profile?.id;
});
</script>

<template>
  <div class="absolute top-0 right-0 h-full w-full sm:static sm:w-3/4 flex flex-col max-[600px]:w-full bg-light dark:bg-[#191919] z-20">
    <div class="sticky min-h-[64px] top-[61px] left-0 w-full py-2 px-6 bg-gray-100 dark:bg-[#222222] flex items-center z-10">
      <button @click="goBack" class="inline-flex items-center">
        <IconsArrow class="w-6 h-6" />
      </button>
      <span class="flex-1 text-center">
        <h1 class="text-xl text-gray-900 dark:text-white">{{ !isFavorite ? companion?.name : "Saved Messages" }}</h1>
        <p v-if="!isFavorite" class="text-sm text-gray-500 dark:text-gray-400">
          {{ companion?.online ? "Online" : "last seen" }}
          {{ !companion?.online ? formatDate(companion!.updatedAt) : "" }}
        </p>
      </span>
      <NuxtLink :to="'/profile/' + companion?.name">
        <img class="rounded-full" width="40" :src="'/upload/avatars/' + (!isFavorite ? companion?.avatar : 'fav.jpeg')" />
      </NuxtLink>
    </div>
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 mt-14 sm:mt-0">
      <div
        v-for="message in props.currentChat?.messages"
        :key="message.id"
        class="flex items-start mb-1"
        :class="{
          'justify-end': message.senderId === $authStore.profile?.id,
          'justify-start': message.senderId !== $authStore.profile?.id,
        }"
      >
        <div class="flex items-start">
          <div
            :class="{
              'bg-[#F02C56] text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl': message.senderId === $authStore.profile?.id,
              'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tr-xl rounded-tl-xl rounded-br-xl':
                message.senderId !== $authStore.profile?.id,
            }"
            class="p-3 pe-10 max-w-xs w-fit break-all shadow-md min-w-20 relative"
          >
            <span>
              {{ message.text }}
            </span>

            <span class="text-xs text-gray-300/60 dark:text-gray-400 absolute bottom-1 right-1">{{
              new Date(message.createdAt).getHours() + ":" + new Date(message.createdAt).getMinutes()
            }}</span>
          </div>
        </div>
      </div>
      <div v-if="typingUser && typingUser !== $authStore.profile?.name" class="typing-animation mt-5">
        {{ typingUser }} is typing<span></span><span></span><span></span>
      </div>
    </div>

    <div class="p-4 border-gray-200 dark:border-[#303030] border-t flex items-center">
      <input
        @keyup.enter="handleSend"
        type="text"
        @input="handleTyping"
        placeholder="Type a message..."
        v-model="text"
        class="flex-1 px-4 py-2 transition text-gray-900 dark:text-white bg-white dark:bg-[#222222] rounded border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-[#F02C56] focus:outline-none"
      />
      <button
        @click="handleSend"
        :disabled="!text"
        class="ml-3 bg-[#F02C56] hover:bg-[#F02C56] text-white px-5 py-2 rounded shadow-lg transition-all disabled:bg-gray-400"
      >
        Send
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
