import prisma from "~/lib/prisma";
import { formatDate } from "~/utils/formatDate";

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
    const block = await prisma.block.findUnique({
      where: {
        userId: profile.userId,
      },
    });

    if (block?.until! > new Date()) {
      clearUserSession(event).then(() => {
        throw createError({
          statusCode: 403,
          statusMessage: "User is banned until " + formatDate(block?.until!, false, true),
        });
      });
    }
  }

  const mappedProfile = {
    ...profile,
    following: [
      ...profile.followsAsFollower.filter((f) => f.isFollowing),
      ...profile.followsAsFollowing.filter((f) => f.isFollowing && f.status === "accepted"),
    ],
    followers: [
      ...profile.followsAsFollowing.filter((f) => f.isFollowing && f.status !== "rejected"),
      ...profile.followsAsFollower.filter((f) => f.isFollowing && f.status === "accepted"),
    ],
  };

  // @ts-ignore
  delete mappedProfile.followsAsFollowing;
  // @ts-ignore
  delete mappedProfile.followsAsFollower;

  await prisma.$executeRaw`
    UPDATE "Video"
    SET "randomSort" = random()
  `;

  return mappedProfile;
});
