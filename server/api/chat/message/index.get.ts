import { prisma } from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const messages = await prisma.message.findMany({
    include: {
      sender: true,
      chat: true,
    },
  });

  return messages;
});
