
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

interface IBody {
	title: string
	url: string
	userId: string
}

export default defineEventHandler(async (event) => {
	const body = await readBody<IBody>(event)

	if (!body.title || !body.url || !body.userId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Title, url and user id are required",
		})
	}

	const video = await prisma.videos.create({
        data: {
            title: body.title,
            url: body.url,
            userId: body.userId,
        },
    })

	return video
})
