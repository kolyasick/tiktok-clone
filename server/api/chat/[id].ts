import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const { id } = event.context.params as { id?: string };

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Id parameter is required",
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

  if (chat?.user1Id !== user.id && chat?.user2Id !== user.id) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  const mappedChat = {
    ...chat,
    companion: chat?.user1Id === parseInt(user.id) ? chat?.user2 : chat?.user1,
  };

  delete mappedChat.user1;
  delete mappedChat.user2;

  return mappedChat;
});
