<script setup lang="ts">
const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
const { send } = useWebSocket(`${protocol}${location.host}/api/websocket`);

const emit = defineEmits(["send-message"]);
const { $authStore, $generalStore } = useNuxtApp();

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
        room: $generalStore.currentChat?.id,
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
  () => $generalStore.currentChat?.messages,
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
  return $generalStore.currentChat?.messages.filter((m) => !(m.text === "typing" && m.sender?.id === $authStore.profile?.id));
});

const companion = computed(() => {
  return $generalStore.currentChat?.companion;
});
</script>

<template>
  <div class="w-3/4 flex flex-col max-[600px]:w-full">
    <NuxtLink :to="'/profile/' + companion?.name" class="sticky top-0 left-0 w-full py-2 px-6 bg-[#222222] flex items-center z-10">
      <span class="flex-1 text-center">
        <h1 class="text-xl">{{ companion?.name }}</h1>
        <p class="text-sm text-gray-400">{{ companion?.online ? "Online" : "Offline" }}</p>
      </span>
      <div>
        <NuxtImg class="rounded-full" width="40" :src="'/upload/avatars/' + companion?.avatar" />
      </div>
    </NuxtLink>
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
          <div
            :class="{
              'bg-[#F02C56] text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl': message.senderId === $authStore.profile?.id,
              'bg-gray-200 text-gray-800 rounded-tr-xl rounded-tl-xl rounded-br-xl': message.senderId !== $authStore.profile?.id,
            }"
            class="p-3 pe-10 max-w-xs w-fit break-all shadow-md min-w-20 relative"
          >
            <p v-if="message.text === 'typing'" class="typing-animation">
              {{ message.sender?.name }} is typing<span></span><span></span><span></span>
            </p>

            <span v-else>
              {{ message.text }}
            </span>

            <span class="text-xs text-gray-400 absolute bottom-1 right-1">{{ formatDate(message.createdAt, true) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 border border-r-0 border-b-0 border-l-0 border-t-[#303030] flex items-center">
      <input
        @keyup.enter="handleSend"
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
