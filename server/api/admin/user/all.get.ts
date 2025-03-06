import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const users = await prisma.profile.findMany({
    include: {
      user: {
        include: {
          role: true,
        },
      },
    },
  });

  return users || [];
});
