import { PrismaClient } from "@prisma/client"
import { getQuery } from "h3"

const prisma = new PrismaClient()
interface IQuery {
	user1: string
	user2: string
}

export default defineEventHandler(async (event) => {
	const { user1, user2 } = getQuery<IQuery>(event)

	if (!user1 || !user2) {
		throw createError({
			statusCode: 400,
			message: "All parametres are required",
		})
	}

	const room = await prisma.chatRooms.findFirst({
		where: {
			OR: [
				{
					user1Id: user1,
					user2Id: user2,
				},
				{
					user1Id: user2,
					user2Id: user1,
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

	return room ?? "no-room"
})
