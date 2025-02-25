import prisma from "~/server/composables/prisma";

type Body = {
  email: string;
  password: string;
};

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<Body>(event);

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "All fields are required",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  const isPasswordValid = user && (await verifyPassword(user.password, password));

  if (!user || !isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  const profile = await prisma.profile.findUnique({
    where: {
      userId: user.id,
    },
  });

  const session = await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      role: user.roleId,
    },
    loggedInAt: new Date(),
  });

  if (!session) {
    throw createError({
      statusCode: 500,
      statusMessage: "Error creating session",
    });
  }

  return profile;
});
