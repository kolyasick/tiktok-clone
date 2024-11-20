import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: "Id is required",
		})
	}

	const user = await prisma.users.findUnique({
		where: {
			id,
		},
		include: {
			videos: true,
		},
	})
	if (!user) {
		throw createError({
			statusCode: 404,
			statusMessage: "User with this id not found",
		})
	}
	return user
})
