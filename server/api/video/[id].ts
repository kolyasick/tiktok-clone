import { prisma } from "~/server/composables/prisma"

export default defineEventHandler(async (event) => {
	const { id } = event.context.params as { id?: string }

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: "Id parameter is required",
		})
	}

	const parsedId = parseInt(id, 10)

	const video = await prisma.video.findUnique({
		where: {
			id: parsedId,
		},
		include: {
			profile: true,
			comments: {
				include: {
					profile: true,
				},
			},
			likes: true,
		},
	})

	if (!video) {
		throw createError({
			status: 404,
			statusMessage: "Video not found",
		})
	}

	return video
})
