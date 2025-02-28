import type { Profile } from "@prisma/client";
import type { IChat, IMessage, IProfile, IRoom } from "~/types/user.type";

export const useChat = () => {
  const { $authStore, $generalStore } = useNuxtApp();

  const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
  const {
    send,
    data: socketData,
    close,
  } = useWebSocket(`${protocol}${location.host}/api/websocket`, {
    onConnected: (ws) => {
      console.log("Connected", ws);
    },
    onDisconnected: () => {
      console.log("Disconnected", handleStatus("offline", $authStore.profile));
    },
    autoClose: true,
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        alert("Failed to connect WebSocket after 3 retries");
      },
    },
    protocols: ["soap"],
  });

  const messages = ref<IMessage[]>([]);
  const chat = ref<IChat | null>(null);

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
    id: Date.now().toString(),
    text, // @ts-ignore
    sender: sender || $authStore.profile, // @ts-ignore
    senderId: sender?.id || $authStore.profile?.id, // @ts-ignore
    chatId: chat.value?.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    action,
  });

  watch(socketData, (newValue) => {
    const message = JSON.parse(newValue);

    if (message.room === chat.value?.id && chat.value) {
      $generalStore.currentChat?.messages.push(createMessage(message.text, message.action, message.sender));
    }

    if (message.action === "remove-typing") {
      $generalStore.currentChat.messages = $generalStore.currentChat?.messages.filter((m) => m.action !== "typing" && m.action !== "remove-typing");
    }

    if (message.action === "online") {
      if ($generalStore.chats) {
        const user = $generalStore.chats.find((c) => c.user.id === message.sender.id)?.user;
        const messageUser = $generalStore.currentChat?.messages?.find((m) => m.senderId == message.sender.id)?.sender;

        if (user) {
          user.online = true;
        }

        if (messageUser) {
          messageUser.online = true;
        }
      }
    }

    if (message.action === "offline") {
      if ($generalStore.chats) {
        const user = $generalStore.chats.find((c) => c.user.id === message.sender.id)?.user;
        const messageUser = $generalStore.currentChat?.messages?.find((m) => m.senderId == message.sender.id)?.sender;

        if (user) {
          user.online = false;
        }

        if (messageUser) {
          messageUser.online = false;
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
