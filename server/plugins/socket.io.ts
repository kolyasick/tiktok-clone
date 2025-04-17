import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server, Socket } from "socket.io";
import { defineEventHandler } from "h3";
import { IMessage, IProfile } from "~/types/user.type";

type Notification = {
  to: number;
  sender?: IProfile;
  message: string;
  messageType?: string;
};
import prisma from "~/lib/prisma";

const connectedUsers = new Map<number, Set<string>>();

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const engine = new Engine();
  const io = new Server();

  io.bind(engine);

  io.on("connection", (socket: Socket) => {
    socket.on("setUser", async (userId: number) => {
      if (!userId) return;

      socket.data.userId = userId;
      socket.data.lastHeartbeat = Date.now();

      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId)?.add(socket.id);

      try {
        await prisma.profile.update({
          where: { id: userId },
          data: {
            online: true,
            lastSeen: new Date(),
          },
        });
        io.emit("online", userId);
      } catch (error) {
        console.error("Failed to update online status:", error);
      }
    });

    socket.on("joinChat", (chatId: string) => {
      socket.join(chatId);
    });

    socket.on("leaveChat", (chatId: string) => {
      socket.leave(chatId);
    });

    socket.on("chatMessage", (msg: IMessage) => {
      io.emit("chatMessage", msg);
    });

    socket.on("notification", (msg: Notification) => {
      io.emit("notification", msg);
    });

    socket.on("typing", (data: { name: string; chatId: string }) => {
      io.to(data.chatId).emit("typing", data.name);
    });

    socket.on("stopTyping", (chatId: string) => {
      io.to(chatId).emit("stopTyping");
    });

    socket.on("chatOpen", (chat) => {
      io.emit("chatOpen", chat);
    });

    socket.on("online", async (userId: number) => {
      if (!userId) return;

      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId)?.add(socket.id);

      try {
        await prisma.profile.update({
          where: { id: userId },
          data: { online: true, lastSeen: new Date() },
        });
        io.emit("online", userId);
      } catch (error) {
        console.error("Failed to update online status:", error);
      }
    });

    const interval = setInterval(async () => {
      try {
        const now = new Date();
        const oneMinute = new Date(now.getTime() - 1 * 60 * 1000);

        const users = await prisma.profile.findMany({
          select: {
            id: true,
            online: true,
            lastSeen: true,
          },
        });

        for (const user of users) {
          if (user.lastSeen < oneMinute) {
            await prisma.profile.update({
              where: { id: user.id },
              data: { online: false },
              select: {
                online: true,
              },
            });
            io.emit("offline", user.id);
          }
        }
      } catch (error) {
        console.error("Ошибка при обновлении статусов:", error);
      }
    }, 60000);

    socket.on("offline", async (userId: number) => {
      if (!userId) return;

      connectedUsers.get(userId)?.delete(socket.id);

      if (connectedUsers.get(userId)?.size === 0) {
        try {
          await prisma.profile.update({
            where: { id: userId },
            data: { online: false },
          });
          io.emit("offline", userId);
        } catch (error) {
          console.error("Failed to update offline status:", error);
        }
      }
    });

    socket.on("disconnect", async () => {
      const userId = socket.data.userId;
      if (!userId) return;

      connectedUsers.get(userId)?.delete(socket.id);

      if (connectedUsers.get(userId)?.size === 0) {
        try {
          await prisma.profile.update({
            where: { id: userId },
            data: {
              online: false,
            },
          });
          io.emit("offline", userId);
          clearInterval(interval);
        } catch (error) {
          console.error("Failed to update offline status on disconnect:", error);
        }
      }
    });
  });

  nitroApp.router.use(
    "/socket.io/",
    defineEventHandler({
      handler(event) {
        // @ts-expect-error
        engine.handleRequest(event.node.req, event.node.res);
        event._handled = true;
      },
      websocket: {
        open(peer) {
          // @ts-expect-error private method and property
          engine.prepare(peer._internal.nodeReq);
          // @ts-expect-error private method and property
          engine.onWebSocket(peer._internal.nodeReq, peer._internal.nodeReq.socket, peer.websocket);
        },
      },
    })
  );
});
