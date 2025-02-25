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
      statusMessage: "Post id and profile id are required",
    });
  }

  const like = await prisma.like.findFirst({
    where: {
      videoId,
      profileId,
    },
  });
  const unlike = await prisma.like.delete({
    where: {
      id: like?.id,
    },
  });

  if (!unlike.id) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error deleting like",
    });
  }
  return like;
});
