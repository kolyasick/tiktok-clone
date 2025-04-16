import type { IProfile } from "~/types/user.type";

export type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: number;
  message: string;
  sender?: IProfile;
  messageType?: string;
  type: NotificationType;
  progress: number;
  duration: number | null;
  startTime: number;
}

const notifications = ref<Notification[]>([]);
let nextId = 1;

export function useNotification() {
  const route = useRoute();
  const localePath = useLocalePath();

  const addNotification = (data: Omit<Notification, "id" | "progress" | "startTime">) => {
    const id = nextId++;
    const startTime = Date.now();
    const notification: Notification = {
      id,
      progress: 100,
      startTime,
      ...data,
    };

    if (data.messageType === "message" && route.path === localePath("/chat")) return;

    if (notifications.value.length > 3) {
      notifications.value.shift();
    }
    notifications.value.unshift(notification);

    if (data.duration && data.duration > 0) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, data.duration! - elapsed);
        const progress = (remaining / data.duration!) * 100;

        const index = notifications.value.findIndex((n) => n.id === id);
        if (index !== -1) {
          notifications.value[index].progress = progress;
        }

        if (remaining <= 0) {
          clearInterval(interval);
          removeNotification(id);
        }
      }, 10);
    }
  };

  const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
}
