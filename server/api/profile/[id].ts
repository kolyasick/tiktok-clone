import { prisma } from "~/server/composables/prisma"

export default defineEventHandler(async (event) => {
	const { id } = event.context.params as { id?: string }

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: "Id parameter is required",
		})
	}

	const parsedId = parseInt(id, 10)

	const profile = await prisma.users.findUnique({
		where: {
			id: parsedId,
		},
	})

	if (!profile) {
		throw createError({
			status: 404,
			statusMessage: "User not found",
		})
	}

	const profileData = {
		id: profile.id,
		name: profile.name,
		email: profile.email,
		avatar: profile.avatar,
		role: profile.roleId, 
	}

	return profileData
})
