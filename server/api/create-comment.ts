import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface IBody {
	postId: number
	userId: string
	text: string
}
export default defineEventHandler(async (event) => {
	const body = await readBody<IBody>(event)

	if (!body.postId || !body.userId || !body.text) {
		throw createError({
			statusCode: 400,
			statusMessage: "Post id, user id and comment are required",
		})
	}

	const comment = await prisma.comments.create({
		data: {
			postId: body.postId,
			userId: body.userId,
			text: body.text,
		},
	})

	return comment
})
