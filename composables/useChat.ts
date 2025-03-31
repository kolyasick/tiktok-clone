import type { IProfile } from "~/types/user.type";

export const useChat = () => {
  const { $io: socket, $generalStore } = useNuxtApp();

  const handleStatus = async (status: "online" | "offline", sender: IProfile) => {
    if (!sender?.id) return;

    // Emit status event
    socket.emit(status, sender.id);

    // Update local state
    if ($generalStore.chats) {
      const user = $generalStore.chats.find((c) => c.companion.id === sender.id)?.companion;
      const companion = $generalStore.currentChat?.companion;

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

  return {
    handleStatus,
  };
};
