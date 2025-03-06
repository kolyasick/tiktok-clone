import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const videos = await prisma.video.findMany({
    include: {
      profile: true,
    },
  });

  return videos || [];
});
