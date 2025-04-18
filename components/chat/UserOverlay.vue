<script setup lang="ts">
import type { Chat, Profile } from "@prisma/client";
import type { IMessage } from "~/types/user.type";

const { t } = useI18n();
const localePath = useLocalePath();
const { currentChat } = useChat();

interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile & { online: boolean };
}
const { $authStore } = useNuxtApp();
const props = defineProps<{ chat: IChat }>();
const { $io: socket } = useNuxtApp();

const lastMessage = computed(() => {
  return props.chat.messages[props.chat.messages.length - 1] ?? null;
});

const undreadedMessages = computed(() => {
  return props.chat.messages.filter(
    (message) => message.senderId !== $authStore.profile?.id && !message.isReaded
  );
});

const isFavorite = computed(() => {
  if (props.chat.companion.id === $authStore.profile?.id) {
    props.chat.companion.name = t("savedMessages");
    return true;
  } else {
    return false;
  }
});

const chatOpen = async () => {
  await navigateTo(localePath(`/chat?chatId=${props.chat.id}`));
  if (props.chat.user1Id === props.chat.user2Id) return;
  socket.emit("chatOpen", {
    id: props.chat.id,
    user1Id: props.chat.user1Id,
    user2Id: props.chat.user2Id,
  });
};
</script>

<template>
  <ul class="overflow-y-auto">
    <li
      @click="chatOpen"
      :class="{ 'dark:bg-[#3a3a3a] bg-gray-200': $route.query.chatId as string == chat.id.toString() }"
      class="flex items-center relative gap-3 p-4 cursor-pointer dark:hover:bg-[#3a3a3a] hover:bg-gray-200 transition-colors duration-200 overflow-hidden"
    >
      <div class="w-10 h-10 object-cover relative shrink-0">
        <img
          :src="'/upload/avatars/' + (!isFavorite ? chat.companion.avatar : 'fav.jpeg')"
          class="rounded-full aspect-square object-cover"
          alt="Avatar"
        />
        <span
          class="status w-2 h-2 bg-green-500 rounded-full absolute bottom-0 right-0"
          v-if="!isFavorite ? chat.companion.online : false"
        ></span>
      </div>

      <div class="flex flex-col justify-between w-full">
        <div class="flex justify-between items-center">
          <span class="dark:text-white text-gray-800 font-medium text-md">{{
            !isFavorite ? chat.companion.name : $t("savedMessages")
          }}</span>
        </div>

        <div v-if="lastMessage" class="text-gray-400 text-sm flex gap-2">
          <p>
            {{
              lastMessage?.sender?.id === $authStore.profile?.id
                ? `${$t("you")}: `
                : lastMessage?.sender?.name + ": "
            }}
          </p>
          <span
            class="dark:text-gray-300 text-gray-600 truncate max-w-[90%] flex items-start justify-between w-full"
          >
            <p class="truncate max-w-20">{{ lastMessage.text }}</p>
            <p class="text-gray-500">
              {{
                new Date(lastMessage.createdAt).toLocaleTimeString("ru-RU", {
                  timeStyle: "short",
                })
              }}
            </p>
          </span>
        </div>

        <div v-else-if="!lastMessage && !isFavorite && !isFavorite">
          <p class="text-gray-400 text-sm">{{ $t("sayHi") }} {{ chat.companion.name }}</p>
        </div>
      </div>
      <span
        v-if="undreadedMessages.length"
        class="text-xs absolute top-2 right-2 dark:bg-neutral-600 bg-slate-400 text-white dark:text-neutral-300 rounded-full flex items-center justify-center w-5 aspect-square"
      >
        {{ undreadedMessages.length }}
      </span>
    </li>
  </ul>
</template>

<style scoped></style>
