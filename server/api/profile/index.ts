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
      friendshipsAsFriend: true,
      friendshipsAsUser: true,
    },
  });

  if (!profile) {
    throw createError({
      status: 404,
      statusMessage: "User not found",
    });
  }

  const mappedProfile = {
    ...profile,
    following: [...profile.friendshipsAsUser, ...profile.friendshipsAsFriend.filter((f) => f.status == "reply")],
    followers: [...profile.friendshipsAsFriend, ...profile.friendshipsAsUser.filter((f) => f.status == "reply")],
  };

  // @ts-ignore
  delete mappedProfile.friendshipsAsFriend;
  // @ts-ignore
  delete mappedProfile.friendshipsAsUser;

  return mappedProfile;
});
