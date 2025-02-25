import prisma from "~/server/composables/prisma"

interface IBody {
	userId: number
	friendId: number
}
export default defineEventHandler(async (event) => {
	const { userId, friendId } = await readBody<IBody>(event)

	if (!userId || !friendId) {
		throw createError({
			statusCode: 400,
			statusMessage: "User ids are required",
		})
	}

	const friendShip = await prisma.friendship.update({
		where: {
			userId_friendId: {
				userId,
				friendId,
			},
		},
		data: {
			status: "reply",
		},
	})

	return friendShip
})
