import { mail } from "~/server/composables/mailer";
import prisma from "~/lib/prisma";

type Body = {
  email: string;
};

export default defineEventHandler(async (event) => {
  const { email } = await readBody<Body>(event);

  const { user: currentUser } = await getUserSession(event);

  if (currentUser) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  const code = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  const candidate = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (candidate) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied",
    });
  }

  const activationCode = await prisma.activationCode.findUnique({
    where: {
      email,
    },
  });

  if (!activationCode) {
    throw createError({
      statusCode: 403,
      statusMessage: "Access denied",
    });
  }

  await prisma.activationCode.update({
    where: {
      email,
    },
    data: {
      code,
      createdAt: new Date(),
    },
  });

  return mail(email, code);
});
