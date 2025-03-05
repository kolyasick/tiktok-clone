import type { IProfile } from "~/types/user.type";

export const useChat = () => {
  const { $io: socket, $generalStore } = useNuxtApp();

  const handleStatus = async (status: "online" | "offline", sender: IProfile) => {
    socket.on(status, (userId: number) => {
      if ($generalStore.chats) {
        const user = $generalStore.chats.find((c) => c.companion.id === userId)?.companion;
        const companion = $generalStore.currentChat?.companion;

        if (user) {
          user.online = status === "online";
        }

        if (companion && companion.id === userId) {
          companion.online = status === "online";
        }
      }
    });

    await $fetch(`/api/profile/edit/${sender?.id}`, {
      method: "PATCH",
      body: {
        online: status === "online",
      },
    });
  };

  return {
    handleStatus,
  };
};
