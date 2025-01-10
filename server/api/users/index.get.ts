import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const users = await prisma.users.findMany({
		include: {
			chatRoomsCreated: true,
			chatRoomsJoined: true,
		},
	})

	if (!users) {
		throw createError({
			statusCode: 404,
			statusMessage: "Users not found",
		})
	}

	return users
})
