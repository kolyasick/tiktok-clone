import type { Profile } from "@prisma/client";
import type { IMessage, IProfile, IRoom } from "~/types/user.type";

export const useChat = () => {
  const { $authStore, $generalStore } = useNuxtApp();

  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const { send, data: socketData, close } = useWebSocket(`${protocol}${location.host}/api/websocket`);

  const messages = ref<IMessage[]>([]);
  const chat = ref<IRoom | null>(null);

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
    text, // @ts-ignore
    sender: sender || $authStore.profile, // @ts-ignore
    senderId: sender?.id || $authStore.profile?.id, // @ts-ignore
    chatId: $generalStore.currentChat?.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    action,
  });

  watch(socketData, (newValue) => {
    const message = JSON.parse(newValue);

    if (message.room === chat.value?.id && chat.value) {
      $generalStore.currentChat?.messages.push(createMessage(message.text, message.action, message.sender));
    }

    switch (message.action) {
      case "remove-typing": {
        // @ts-ignore
        $generalStore.currentChat.messages = $generalStore.currentChat?.messages.filter((m) => m.action !== "typing" && m.action !== "remove-typing");
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
    chat,
    messages,
    createMessage,
    close,
  };
};
