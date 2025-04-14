import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };
  const { userId } = getQuery<{ userId: string }>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Id parameter is required",
    });
  }

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User id is required",
    });
  }

  const parsedId = parseInt(id);

  const chat = await prisma.chat.findUnique({
    where: {
      id: parsedId,
    },
    include: {
      user1: true,
      user2: true,
      messages: {
        include: {
          sender: true,
        },
      },
    },
  });

  const mappedChat = {
    ...chat,
    companion: chat?.user1Id === parseInt(userId) ? chat?.user2 : chat?.user1,
  };

  delete mappedChat.user1;
  delete mappedChat.user2;

  return mappedChat;
});
