import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const query = getQuery(event)
	const offset = query.offset ? parseInt(query.offset as string) : 0
	const limit = query.limit ? parseInt(query.limit as string) : 10

	const videos = await prisma.videos.findMany({
		skip: offset,
		take: limit,
		include: {
			likes: true,
			comments: true,
			user: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	})

	return videos || []
})

