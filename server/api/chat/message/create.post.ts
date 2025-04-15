import prisma from "~/lib/prisma";

interface IBody {
  chatId: number;
  text: string;
}
export default defineEventHandler(async (event) => {
  const { chatId, text } = await readBody<IBody>(event);

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

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
    },
  });

  return message;
});
