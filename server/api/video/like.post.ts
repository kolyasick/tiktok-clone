import prisma from "~/server/composables/prisma";

interface IBody {
  videoId: number;
  profileId: number;
}

export default defineEventHandler(async (event) => {
  const { videoId, profileId } = await readBody<IBody>(event);

  if (!videoId || !profileId) {
    throw createError({
      statusCode: 400,
      message: "Post id and profile id are required",
    });
  }

  const like = await prisma.like.create({
    data: {
      videoId,
      profileId,
    },
  });

  if (!like.id) {
    throw createError({
      statusCode: 500,
      message: "Error creating like",
    });
  }

  return like;
});
