import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface IBody {
	senderId: string
	chatName: string
	text: string
}
export default defineEventHandler(async (event) => {
	const { chatName, senderId, text } = await readBody<IBody>(event)

	if (!chatName || !senderId || !text) {
		throw createError({
			statusCode: 400,
			statusMessage: "Chat id, senderId and text required",
		})
	}

	const message = await prisma.messages.create({
		data: {
			chatName,
			senderId,
			text,
		},
	})

	return message
})
