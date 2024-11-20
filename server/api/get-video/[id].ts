import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
	const id = event.context.params?.id

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: "Id is required",
		})
	}

	const video = await prisma.videos.findUnique({
		where: {
			id: Number(id),
		},
		include: {
			likes: true,
			comments: {
				include: {
					user: true,
				},
			},
			user: true,
		},
	})
	if (!video) {
		throw createError({
			statusCode: 404,
			statusMessage: "Video with this id not found",
		})
	}

	return video
})
