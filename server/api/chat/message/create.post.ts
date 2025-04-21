import prisma from "~/lib/prisma";

interface IBody {
  chatId: number;
  text: string;
  isReaded?: boolean;
}
export default defineEventHandler(async (event) => {
  const { chatId, text, isReaded } = await readBody<IBody>(event);

  await requireUserSession(event);
  const { user } = await getUserSession(event);

  if (!chatId || !user.id || !text) {
    throw createError({
      statusCode: 400,
      statusMessage: "Chat id, senderId and text required",
    });
  }

  const message = await prisma.message.create({
    data: {
      chatId,
      senderId: user.id,
      text,
      isReaded,
    },
    include: {
      sender: {
        omit: {
          createdAt: true,
          updatedAt: true,
          bio: true,
          online: true,
          lastSeen: true,
        },
      },
    },
  });

  return message;
});
