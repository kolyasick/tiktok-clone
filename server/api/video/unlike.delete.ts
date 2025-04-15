import prisma from "~/lib/prisma";

interface IBody {
  videoId: string;
}

export default defineEventHandler(async (event) => {
  const { videoId } = await readBody<IBody>(event);

  const { user } = await getUserSession(event);

  if (!user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!videoId || !user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Post id and profile id are required",
    });
  }

  const unlike = await prisma.like.delete({
    where: {
      profileId_videoId: {
        profileId: user.id,
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
