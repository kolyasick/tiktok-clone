import prisma from "~/server/composables/prisma";
type Query = {
  userId?: string;
};

export default defineEventHandler(async (event) => {
  const { userId } = getQuery<Query>(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      message: "User id is required",
    });
  }

  const parsedUserId = parseInt(userId);

  const videos = await prisma.video.findMany({
    where: {
      likes: {
        some: {
          profileId: parsedUserId,
        },
      },
    },
  });

  return videos ?? [];
});
