import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface IBody {
	user1Id: string
	user2Id: string
}
export default defineEventHandler(async (event) => {
	const { user1Id, user2Id } = await readBody<IBody>(event)

	if (!user1Id || !user2Id) {
		throw createError({
			statusCode: 400,
			statusMessage: "User ids are required",
		})
	}

	const isChatExist = await prisma.chatRooms.findFirst({
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

		const chatRoom = await prisma.chatRooms.create({
			data: {
				id: `room-${user1Id}-${user2Id}`,
				user1Id,
				user2Id,
			},
		})

		return chatRoom
	}

	const chatRoom = await prisma.chatRooms.findFirst({
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
