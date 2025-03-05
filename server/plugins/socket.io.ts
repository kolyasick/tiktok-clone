import type { NitroApp } from "nitropack";
import { Server as Engine } from "engine.io";
import { Server, Socket } from "socket.io";
import { defineEventHandler } from "h3";
import { IMessage } from "~/types/user.type";

export default defineNitroPlugin((nitroApp: NitroApp) => {
  const engine = new Engine();
  const io = new Server();

  io.bind(engine);

  io.on("connection", (socket: Socket) => {
    socket.on("setUser", (userId: number) => {
      socket.data.userId = userId;
      io.emit("online", userId);
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

    socket.on("typing", (data: { name: string; chatId: string }) => {
      io.to(data.chatId).emit("typing", data.name);
    });

    socket.on("stopTyping", (chatId: string) => {
      io.to(chatId).emit("stopTyping");
    });

    socket.on("disconnect", () => {
      console.log("WS disconnected", socket.data.userId);
      io.emit("offline", socket.data.userId);
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
