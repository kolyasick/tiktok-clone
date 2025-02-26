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
    include: {
      friendshipsAsFriend: true,
      friendshipsAsUser: true,
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

  const mappedProfile = {
    ...profile,
    following: [...profile.friendshipsAsUser, ...profile.friendshipsAsFriend.filter((f) => f.status === "accepted")],
    followers: [...profile.friendshipsAsFriend, ...profile.friendshipsAsUser.filter((f) => f.status === "accepted")],
  };

  // @ts-ignore
  delete mappedProfile.friendshipsAsFriend;
  // @ts-ignore
  delete mappedProfile.friendshipsAsUser;

  return mappedProfile;
});
