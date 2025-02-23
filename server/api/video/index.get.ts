import { prisma } from "~/server/composables/prisma"
type Query = {
	userId?: string
}
export default defineEventHandler(async (event) => {
	const { userId } = getQuery<Query>(event)

	let videos
	if (userId) {
		videos = await prisma.video.findMany({
			where: {
				profileId: parseInt(userId, 10),
			},
			include: {
				profile: true,
				comments: true,
				likes: true,
			},
		})
	} else {
		videos = await prisma.video.findMany({
			include: {
				profile: true,
				comments: true,
				likes: true,
			},
		})
	}

	return videos ?? []
})
