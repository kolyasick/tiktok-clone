import { ServerFile } from "nuxt-file-storage"
import { prisma } from "~/server/composables/prisma"

interface IBody {
	title: string
	file: ServerFile
	userId: number
}

export default defineEventHandler(async (event) => {
	const body = await readBody<IBody>(event)

	if (!body.title || !body.file || !body.userId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Title, file and user id are required",
		})
	}

	const file = await storeFileLocally(body.file, 6, "/videos")

	const video = await prisma.video.create({
		data: {
			title: body.title,
			profileId: body.userId,
			url: file,
		},
	})

	if (!video.id) {
		throw createError({
			statusCode: 500,
			statusMessage: "Error creating video",
		})
	}

	return video
})
