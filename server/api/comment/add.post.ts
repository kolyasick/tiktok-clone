import prisma from "~/server/composables/prisma";

interface IBody {
  senderId: number;
  videoId: string;
  text: string;
}
export default defineEventHandler(async (event) => {
  const { videoId, senderId, text } = await readBody<IBody>(event);

  if (!videoId || !senderId || !text) {
    throw createError({
      statusCode: 400,
      message: "Video id, senderId and text required",
    });
  }

  const message = await prisma.comment.create({
    data: {
      videoId,
      profileId: senderId,
      text,
    },
    include: {
      profile: true,
      likes: true,
    },
  });

  return message;
});
