import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const users = await prisma.profile.findMany()

	if (!users) {
		throw createError({
			statusCode: 404,
			statusMessage: "Users not found",
		})
	}

	return users
})
