
import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { link } = event.context.params as { link: string };

  const activationLink = await prisma.activationLink.findUnique({
    where: {
      link,
    },
  });

  if (!activationLink) {
    throw createError({
      status: 404,
      statusMessage: "Invalid or expired activation link",
    });
  }

  const user = await prisma.user.update({
    where: {
      id: activationLink.userId,
    },
    data: {
      verified: true,
    },
  });

  await sendRedirect(event, "/activation-success", 302);
});
