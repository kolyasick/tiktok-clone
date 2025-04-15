import prisma from "~/lib/prisma";
import { formatDate } from "~/utils/formatDate";

type Body = {
  name: string;
  password: string;
};

export default defineEventHandler(async (event) => {
  const { name, password } = await readBody<Body>(event);

  const { user } = await getUserSession(event);

  if (user) {
    throw createError({
      statusCode: 403,
      message: "Access denied",
    });
  }

  if (!name || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "All fields are required",
    });
  }

  const profile = await prisma.profile.findUnique({
    where: {
      name,
    },
    include: {
      user: {
        include: {
          role: true,
        },
      },
      followsAsFollower: true,
      followsAsFollowing: true,
    },
  });

  if (!profile) {
    throw createError({
      statusCode: 404,
      statusMessage: "User doesn't exist",
    });
  } else if (!profile.user.verified) {
    throw createError({
      statusCode: 403,
      statusMessage: "Follow the link on your email to verify account",
    });
  }

  const isPasswordValid =
    profile?.user && (await verifyPassword(profile.user.password, password));

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  if (profile.user.isBlocked) {
    const block = await prisma.block.findUnique({
      where: {
        userId: profile.userId,
      },
    });

    if (block?.until! > new Date()) {
      await clearUserSession(event);
      throw createError({
        statusCode: 403,
        statusMessage: "User is banned until " + formatDate(block?.until!, false, true),
      });
    }
  }

  const session = await setUserSession(event, {
    user: {
      id: profile.id,
      email: profile.user.email,
      name: profile.name,
      role: profile.user.role.title,
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
    following: [
      ...profile.followsAsFollower.filter((f) => f.isFollowing),
      ...profile.followsAsFollowing.filter(
        (f) => f.isFollowing && f.status === "accepted"
      ),
    ],
    followers: [
      ...profile.followsAsFollowing.filter(
        (f) => f.isFollowing && f.status !== "rejected"
      ),
      ...profile.followsAsFollower.filter(
        (f) => f.isFollowing && f.status === "accepted"
      ),
    ],
  };

  // @ts-ignore
  delete mappedProfile.followsAsFollower;
  // @ts-ignore
  delete mappedProfile.user;
  // @ts-ignore
  delete mappedProfile.followsAsFollowing;

  return mappedProfile;
});
