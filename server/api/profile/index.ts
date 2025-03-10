import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { id } = getQuery<{ id?: string }>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Id parameter is required",
    });
  }

  const profile = await prisma.profile.findUnique({
    where: {
      id: parseInt(id),
    },

    include: {
      user: {
        select: {
          isBlocked: true,
        },
      },
      followsAsFollower: true,
      followsAsFollowing: true,
    },
  });

  if (!profile) {
    throw createError({
      status: 404,
      statusMessage: "User not found",
    });
  }

  if (profile.user.isBlocked) {
    await clearUserSession(event);
    throw createError({
      status: 403,
      statusMessage: "User is banned",
    });
  }

  const mappedProfile = {
    ...profile,
    following: [...profile.followsAsFollower, ...profile.followsAsFollowing.filter((f) => f.status == "reply")],
    followers: [...profile.followsAsFollowing, ...profile.followsAsFollower.filter((f) => f.status == "reply")],
  };

  // @ts-ignore
  delete mappedProfile.followsAsFollowing;
  // @ts-ignore
  delete mappedProfile.followsAsFollower;

  return mappedProfile;
});
