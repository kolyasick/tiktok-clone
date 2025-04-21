import prisma from "~/lib/prisma";

type Body = {
  code: string;
  name: string;
  email: string;
  password: string;
};

export default defineEventHandler(async (event) => {
  const { code, email, password, name } = await readBody<Body>(event);

  const activationCode = await prisma.activationCode.findUnique({
    where: {
      code,
    },
  });

  const oneMinute = new Date(new Date().getTime() - 1 * 60 * 1000);

  if (activationCode?.code !== code || activationCode?.createdAt < oneMinute) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid or expired activation code",
    });
  }
  const passHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: passHash,
      verified: true,
      role: {
        connect: {
          title: "user",
        },
      },
      profile: {
        create: {
          name,
        },
      },
    },
    select: {
      email: true,
      role: {
        select: {
          title: true,
        },
      },
      profile: true,
    },
  });

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

  return sendRedirect(event, `/profile/${user.profile?.name}`, 302);
});
