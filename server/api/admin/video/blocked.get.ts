import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const videos = await prisma.video.findMany({
    where: {
      status: {
        title: "blocked",
      },
    },
    select: {
      id: true,
    },
  });

  return videos.map((video) => video.id) || [];
});
