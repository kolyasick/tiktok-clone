import prisma from "~/server/composables/prisma"
type Query = {
	userId?: string
}
export default defineEventHandler(async (event) => {
	const { userId } = getQuery<Query>(event)

	let videos
	if (userId) {
		videos = await prisma.video.findMany({
			where: {
				profileId: parseInt(userId),
			},
			include: {
				profile: true,
				comments: true,
				likes: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		})
	} else {
		videos = await prisma.video.findMany({
			include: {
				profile: true,
				comments: true,
				likes: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		})
	}

	return videos ?? []
})
