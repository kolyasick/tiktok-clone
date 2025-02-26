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

  let role = await prisma.role.findFirst({
    where: {
      title: "user",
    },
  });

  if (!role) {
    role = await prisma.role.create({
      data: {
        title: "user",
      },
    });
  }

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      roleId: role.id,
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

  const session = await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: profile.name,
      role: user.roleId,
    },
    loggedInAt: new Date(),
  });

  if (!session) {
    throw createError({
      statusCode: 500,
      statusMessage: "Something went wrong",
    });
  }

  return profile;
});
