import type { Chat, Profile } from "@prisma/client";
import type { IMessage } from "~/types/user.type";

interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile & { online: boolean };
}

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { query } = to;

  const chatId = query?.chatId as string;
  const { $authStore, $generalStore } = useNuxtApp();

  if (chatId && $authStore.profile) {
    const chat = await $fetch<IChat>(`/api/chat/${chatId}`, {
      query: { userId: $authStore.profile?.id },
    });

    if ((chat.user1Id !== $authStore.profile?.id && chat.user2Id !== $authStore.profile?.id) || chat.user1Id === chat.user2Id) {
      return navigateTo("/chat");
    } else {
      $generalStore.$patch({ currentChat: chat });
    }
  }
});
