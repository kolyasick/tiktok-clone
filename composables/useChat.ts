import type { Profile } from "@prisma/client";
import type { IMessage, IProfile } from "~/types/user.type";

export const useChat = () => {
  const { $generalStore } = useNuxtApp();

  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const { send, data: socketData, close } = useWebSocket(`${protocol}${location.host}/api/websocket`);

  const messages = ref<IMessage[]>([]);

  const handleStatus = async (status: "online" | "offline", sender: IProfile) => {
    send(
      JSON.stringify({
        action: status,
        room: "app",
        text: status,
        sender,
      })
    );

    await $fetch(`/api/profile/edit/${sender?.id}`, {
      method: "PATCH",
      body: {
        online: status === "online",
      },
    });
  };

  const createMessage = (text: string, action?: string, sender?: Profile): IMessage => ({
    id: Date.now(),
    text,
    sender: sender,
    senderId: sender?.id!,
    chatId: $generalStore.currentChat?.id!,
    createdAt: new Date(),
    updatedAt: new Date(),
    action,
  });

  watch(socketData, (newValue) => {
    const message = JSON.parse(newValue);

    if (message.room === $generalStore.currentChat?.id && $generalStore.currentChat) {
      const chat = $generalStore.chats?.find((c) => c.id === $generalStore.currentChat?.id);
      chat?.messages.push(createMessage(message.text, message.action, message.sender));
    }

    switch (message.action) {
      case "remove-typing": {
        const chat = $generalStore.chats?.find((c) => c.id === $generalStore.currentChat?.id);
        // @ts-ignore
        chat.messages = $generalStore.currentChat?.messages.filter((m) => m.action !== "typing" && m.action !== "remove-typing");
      }
      case "online": {
        if ($generalStore.chats) {
          const user = $generalStore.chats.find((c) => c.companion.id === message.sender.id)?.companion;
          const companion = $generalStore.currentChat?.companion;

          if (user) {
            user.online = true;
          }

          if (companion && companion.id === message.sender.id) {
            companion.online = true;
          }
        }
      }
      case "offline": {
        if (message.action === "offline") {
          if ($generalStore.chats) {
            const user = $generalStore.chats.find((c) => c.companion.id === message.sender.id)?.companion;
            const companion = $generalStore.currentChat?.companion;
            if (user) {
              user.online = false;
            }

            if (companion && companion.id === message.sender.id) {
              companion.online = false;
            }
          }
        }
      }
    }
  });

  return {
    send,
    socketData,
    handleStatus,
    messages,
    createMessage,
    close,
  };
};
