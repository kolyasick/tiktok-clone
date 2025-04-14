import { mail } from "~/server/composables/mailer";
import prisma from "~/server/composables/prisma";
import { validateEmail, validateName, validatePassword } from "~/server/composables/validators";

type Body = {
  name: string;
  email: string;
  password: string;
};

export default defineEventHandler(async (event) => {
  const { name, email, password } = await readBody<Body>(event);

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

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: {
        connect: {
          title: "user",
        },
      },
    },
    include: {
      role: true,
    },
  });

  const profile = await prisma.profile.create({
    data: {
      name,
      userId: user.id,
    },
  });

  if (!profile) {
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong",
    });
  }

  return mail(user);
});
