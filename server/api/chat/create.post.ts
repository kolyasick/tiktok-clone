import { prisma } from "~/server/composables/prisma"

interface IBody {
	user1Id: number
	user2Id: number
}
export default defineEventHandler(async (event) => {
	const { user1Id, user2Id } = await readBody<IBody>(event)

	if (!user1Id || !user2Id) {
		throw createError({
			statusCode: 400,
			statusMessage: "User ids are required",
		})
	}

	const isChatExist = await prisma.chat.findFirst({
		where: {
			OR: [
				{
					user1Id: user1Id,
					user2Id: user2Id,
				},
				{
					user1Id: user2Id,
					user2Id: user1Id,
				},
			],
		},
	})

	if (!isChatExist) {
		console.log("no room")

		const chatRoom = await prisma.chat.create({
			data: {
				user1Id,
				user2Id,
			},
		})

		return chatRoom
	}

	const chatRoom = await prisma.chat.findFirst({
		where: {
			OR: [
				{
					user1Id: user1Id,
					user2Id: user2Id,
				},
				{
					user1Id: user2Id,
					user2Id: user1Id,
				},
			],
		},
		include: {
			messages: {
				include: {
					sender: true,
				},
			},
		},
	})

	return chatRoom
})
