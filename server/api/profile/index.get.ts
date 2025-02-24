import { PrismaClient } from "@prisma/client"
import { prisma } from "~/server/composables/prisma"

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
