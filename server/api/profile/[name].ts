import prisma from "~/server/composables/prisma";

export default defineEventHandler(async (event) => {
  const { name } = event.context.params as { name?: string };

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: "Name parameter is required",
    });
  }

  const profile = await prisma.profile.findUnique({
    where: {
      name,
    },
    include: {
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
  delete mappedProfile.followsAsFollower;
  // @ts-ignore
  delete mappedProfile.followsAsFollowing;

  return mappedProfile;
});
