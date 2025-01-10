import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const messages = await prisma.messages.findMany({
		include: {
			sender: true,
			chatRoom: true,
		},
	})

	return messages
})
