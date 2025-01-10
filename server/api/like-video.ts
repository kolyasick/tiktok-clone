
import { Likes, PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

interface IBody {
	postId: number
    userId: string
}

export default defineEventHandler(async (event) => {
	const body = await readBody<IBody>(event)

	if (!body.postId || !body.userId) {
		throw createError({
			statusCode: 400,
			statusMessage: "Post id and user id are required",
		})
	}

	const likes = await prisma.likes.create({
        data: {
            postId: body.postId,
            userId: body.userId,
        },
    })

	return likes
})
