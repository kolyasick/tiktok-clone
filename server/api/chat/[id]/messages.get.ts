import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id: string };
  const { limit, offset } = getQuery<{ limit: string; offset: string }>(event);

  await requireUserSession(event);
  const { user } = await getUserSession(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "ChatId  parameter is missing",
    });
  }

  const messages = await prisma.message.findMany({
    where: {
      chatId: parseInt(id),
    },
    select: {
      id: true,
      createdAt: true,
      isReaded: true,
      senderId: true,
      text: true,
      sender: {
        select: {
          avatar: true,
          name: true,
          lastSeen: true,
          online: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit ? parseInt(limit) : undefined,
    skip: offset ? parseInt(offset) : undefined,
  });

//   if (messages.length && !messages.some((m) => m.senderId === user.id)) {
//     throw createError({
//       statusCode: 403,
//       message: "Access denied",
//     });
//   }

  return messages;
});
