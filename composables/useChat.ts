import type { Chat, Profile } from "@prisma/client";
import type { IMessage, IProfile } from "~/types/user.type";

interface IChat extends Chat {
  messages: IMessage[];
  companion: Profile;
}

export const useChat = () => {
  const { $io: socket, $generalStore } = useNuxtApp();

  const chats = ref<IChat[]>([]);
  const currentChat = ref<IChat | null>(null);

  const handleStatus = async (status: "online" | "offline", sender: IProfile) => {
    if (!sender?.id) return;

    socket.emit(status, sender.id);

    if (chats.value) {
      const user = chats.value.find((c) => c.companion.id === sender.id)?.companion;
      const companion = currentChat.value?.companion;

      if (user) {
        user.online = status === "online";
        user.updatedAt = new Date();
      }

      if (companion && companion.id === sender.id) {
        companion.online = status === "online";
        companion.updatedAt = new Date();
      }
    }
  };

  const updateChatStatus = (userId: number, status: boolean) => {
    if (chats.value) {
      const user = chats.value.find((c) => c.companion.id === userId)?.companion;
      const companion = currentChat.value?.companion;

      if (user) {
        user.online = status;
        user.updatedAt = new Date();
      }

      if (companion && companion.id === userId) {
        companion.online = status;
        companion.updatedAt = new Date();
      }
    }
  };

  return {
    chats,
    currentChat,
    handleStatus,
    updateChatStatus,
  };
};
