import prisma from "~/lib/prisma";

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

  const isUserVerified = await prisma.user.findUnique({
    where: {
      id: activationLink.id,
    },
  });

  if (isUserVerified?.verified) {
    console.log("user is already verified, [link].get redirect to /");
    return sendRedirect(event, `/`, 302);
  }

  const user = await prisma.user.update({
    where: {
      id: activationLink.userId,
    },
    data: {
      verified: true,
    },
    include: {
      role: true,
      profile: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  if (!user) {
    throw createError({
      status: 500,
      statusMessage: "Something went wrong",
    });
  }

  const session = await setUserSession(event, {
    user: {
      id: user.profile?.id,
      email: user.email,
      name: user.profile?.name,
      role: user.role.title,
    },
    loggedInAt: new Date(),
  });

  if (!session) {
    throw createError({
      statusCode: 500,
      message: "Something went wrong",
    });
  }
  console.log("[link].get redirect to /verify-success");
  return sendRedirect(event, `/verify-success`, 302);
});
