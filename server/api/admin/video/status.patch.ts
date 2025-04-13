import prisma from "~/server/composables/prisma";

interface IBody {
  videoId: number;
  status: string;
  reason: string | null;
}
export default defineEventHandler(async (event) => {
  const { videoId, reason, status } = await readBody<IBody>(event);

  if (!videoId || !status) {
    throw createError({
      statusCode: 400,
      message: "Video id and status are required",
    });
  }

  const video = await prisma.video.update({
    where: {
      id: videoId,
    },
    data: {
      status: {
        connect: {
          title: status,
        },
      },
      isBlocked: status === "blocked",
      blockReason: reason,
    },
  });

  return video;
});
