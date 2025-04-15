// ~/server/plugins/task.ts
import prisma from "~/lib/prisma";

export default defineNitroPlugin((nitroApp) => {
  const interval = setInterval(async () => {
    try {
      const now = new Date();
      const oneMinute = new Date(now.getTime() - 1 * 60 * 1000);
      const fiftySeconds = new Date(now.getTime() - 1 * 50 * 1000);

      const users = await prisma.profile.findMany();

      for (const user of users) {
        if (user.updatedAt < oneMinute && user.online) {
          await prisma.profile.update({
            where: { id: user.id },
            data: { online: false },
          });
          console.log(`Пользователь ${user.id} помечен как оффлайн`);
        } else if (user.updatedAt > fiftySeconds && !user.online) {
          await prisma.profile.update({
            where: { id: user.id },
            data: { online: true },
          });
          console.log(`Пользователь ${user.id} помечен как онлайн`);
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении статусов:", error);
    }
  }, 30000);

  nitroApp.hooks.hook("close", () => {
    clearInterval(interval);
  });
});
