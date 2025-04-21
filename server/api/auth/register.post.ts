import { mail } from "~/server/composables/mailer";
import prisma from "~/lib/prisma";
import { validateEmail, validateName, validatePassword } from "~/server/composables/validators";

type Body = {
  name: string;
  email: string;
  password: string;
};

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody<Body>(event);

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

  validateName(name);
  validateEmail(email);
  validatePassword(password);

  const candidate = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  const isNameExsit = await prisma.profile.findUnique({
    where: {
      name,
    },
  });

  if (candidate) {
    throw createError({
      statusCode: 400,
      statusMessage: "User already exist",
    });
  } else if (isNameExsit) {
    throw createError({
      statusCode: 400,
      statusMessage: "Username already exist",
    });
  }

  const activationCode = await prisma.activationCode.findUnique({
    where: {
      email,
    },
  });

  if (!activationCode) {
    await prisma.activationCode.create({
      data: {
        email,
        code,
      },
    });
  } else {
    await prisma.activationCode.update({
      where: {
        email,
      },
      data: {
        code,
        createdAt: new Date(),
      },
    });
  }

  return mail(email, code);
});
