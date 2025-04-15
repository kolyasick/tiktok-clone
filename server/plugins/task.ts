// ~/server/plugins/task.ts
import prisma from "~/lib/prisma";

export default defineNitroPlugin((nitroApp) => {
  const interval = setInterval(async () => {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const users = await prisma.profile.findMany();

      console.log(`Проверка ${users.length} пользователей...`);

      for (const user of users) {
        if (user.updatedAt < fiveMinutesAgo && user.online) {
          await prisma.profile.update({
            where: { id: user.id },
            data: { online: false },
          });
          console.log(`Пользователь ${user.id} помечен как оффлайн`);
        }
      }
    } catch (error) {
      console.error("Ошибка при обновлении статусов:", error);
    }
  }, 1000 * 60 * 1);

  nitroApp.hooks.hook("close", () => {
    clearInterval(interval);
  });
});
