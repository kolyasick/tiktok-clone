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
    chatId: room.value?.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    action,
  });

  watch(socketData, (newValue) => {
    const message = JSON.parse(newValue);

    if (message.room === chat.value?.id && chat.value) {
      messages.value.push(createMessage(message.text, message.action, message.sender));
    }

    switch (message.action) {
      case "remove-typing": {
        messages.value = messages.value.filter((m) => m.action !== "typing" && m.action !== "remove-typing");
      }
      case "online": {
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
      case "offline": {
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
