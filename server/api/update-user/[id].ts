import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface IBody {
	name?: string
	avatar?: string
}

export default defineEventHandler(async (event) => {
	const body = await readBody<IBody>(event)
	const id = event.context.params?.id

	if (!id) {
		throw createError({
			statusCode: 400,
			statusMessage: "Id is required",
		})
	}

	const user = prisma.users.update({
		where: {
			id,
		},
		data: body,
	})

	return user
})
