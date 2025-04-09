import prisma from "~/server/composables/prisma";

interface IBody {
  videoId: string;
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

  const unlike = await prisma.like.delete({
    where: {
      profileId_videoId: {
        profileId,
        videoId,
      },
    },
  });

  if (!unlike.id) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error deleting like",
    });
  }
  return unlike;
});
