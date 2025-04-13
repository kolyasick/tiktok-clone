import prisma from "~/server/composables/prisma";
import { formatDate } from "~/utils/formatDate";

export default defineEventHandler(async (event) => {
  const { id } = getQuery<{ id?: string }>(event);

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Id parameter is required",
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
      message: "User not found",
    });
  }

  if (profile.user.isBlocked) {
    const block = await prisma.block.findUnique({
      where: {
        userId: profile.userId,
      },
    });

    if (block?.until! > new Date()) {
      clearUserSession(event).then(() => {
        throw createError({
          statusCode: 403,
          message:
            "User is banned until " + formatDate(block?.until!, false, true),
        });
      });
    }
  }

  const mappedProfile = {
    ...profile,
    following: [
      ...profile.followsAsFollower,
      ...profile.followsAsFollowing.filter((f) => f.status == "reply"),
    ],
    followers: [
      ...profile.followsAsFollowing,
      ...profile.followsAsFollower.filter((f) => f.status == "reply"),
    ],
  };

  // @ts-ignore
  delete mappedProfile.followsAsFollowing;
  // @ts-ignore
  delete mappedProfile.followsAsFollower;

  return mappedProfile;
});
