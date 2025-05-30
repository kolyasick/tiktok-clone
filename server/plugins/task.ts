// ~/server/plugins/task.ts
import prisma from "~/lib/prisma";

export default defineNitroPlugin((nitroApp) => {
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
        if (user.lastSeen < oneMinute && user.online) {
          await prisma.profile.update({
            where: { id: user.id },
            data: { online: false },
          });
          console.log(`Пользователь ${user.id} помечен как оффлайн - сервер`);
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении статусов:", error);
    }
  }, 1000 * 60 * 5);

  nitroApp.hooks.hook("close", () => {
    clearInterval(interval);
  });
});
