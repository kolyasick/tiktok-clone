<script setup lang="ts">
import type { IMessage } from "~/types/user.type";
const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
const { send } = useWebSocket(`${protocol}${location.host}/api/websocket`);

const props = defineProps<{ messages: IMessage[]; chatId: number; isTyping: boolean }>();
const emit = defineEmits(["send-message"]);
const { $authStore } = useNuxtApp();

let text = ref<string>("");
let typing = ref<boolean>(false);
let typingTimeout: NodeJS.Timeout | null = null;

const handleSend = () => {
  emit("send-message", text.value);
  text.value = "";
};

const handleTyping = () => {
  if (!typing.value) {
    typing.value = true;
    send(
      JSON.stringify({
        action: "typing",
        room: props.chatId,
        sender: $authStore.profile,
        text: "typing",
      })
    );
  }

  if (typingTimeout) clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    typing.value = false;
  }, 1000);
};

const messagesContainer = ref<HTMLDivElement | null>(null);

watch(
  () => props.messages,
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
});

const filteredMessages = computed(() => {
  return props.messages.filter((m) => !(m.text === "typing" && m.sender?.id === $authStore.profile?.id));
});
</script>

<template>
  <div class="w-3/4 flex flex-col max-[600px]:w-full">
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 message">
      <div
        v-for="message in filteredMessages"
        :key="message.id"
        class="flex items-start mb-1"
        :class="{
          'justify-end': message.senderId === $authStore.profile?.id,
          'justify-start': message.senderId !== $authStore.profile?.id,
        }"
      >
        <div class="flex items-start">
          <div v-if="message.senderId !== $authStore.profile?.id" class="w-10 h-10 rounded-full overflow-hidden mr-3">
            <img
              v-if="message.sender?.avatar"
              :src="'/upload/avatars/' + message.sender.avatar"
              alt="User Avatar"
              class="object-cover w-full h-full"
            />
            <div v-else class="w-full h-full bg-gray-300 flex items-center justify-center text-sm text-gray-600">
              {{ message.sender?.name }}
            </div>
          </div>

          <div
            :class="{
              'bg-[#F02C56] text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl': message.senderId === $authStore.profile?.id,
              'bg-gray-200 text-gray-800 rounded-tr-xl rounded-tl-xl rounded-br-xl': message.senderId !== $authStore.profile?.id,
            }"
            class="px-4 py-2 max-w-xs w-fit break-words shadow-md"
          >
            <div class="text-sm font-bold mb-1" v-if="message.sender?.name && message.senderId !== $authStore.profile?.id">
              {{ message.sender.name }}
            </div>

            <p v-if="message.text === 'typing'" class="typing-animation">
              {{ message.sender?.name }} is typing<span></span><span></span><span></span>
            </p>

            <span v-else>
              {{ message.text }}
            </span>
            <span class="text-xs text-gray-400 mt-1 block text-right">
              {{ formatDate(message.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 border border-r-0 border-b-0 border-l-0 border-t-[#303030] flex items-center">
      <input
        type="text"
        @input="handleTyping"
        placeholder="Type a message..."
        v-model="text"
        class="flex-1 px-4 py-2 transition text-black bg-white rounded border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F02C56] focus:outline-none"
      />
      <button
        @click="handleSend"
        :disabled="!text"
        class="ml-3 bg-[#F02C56] hover:bg-[#F02C56] text-white px-5 py-2 rounded shadow-lg transition-all disabled:bg-gray-4 00"
      >
        Send
      </button>
    </div>
  </div>
</template>

<style scoped>
.message {
  animation: message 0.6s 1;
}

@keyframes message {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.typing-animation {
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #6b7280; /* Тёмно-серый */
}

.typing-animation span {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: 4px;
  background-color: #6b7280; /* Тёмно-серый */
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
