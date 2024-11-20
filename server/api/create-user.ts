// server/api/create-post.js
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

interface IBody {
    id: string
    name: string
    email: string
}

export default defineEventHandler(async (event) => {
	const body = await readBody<IBody>(event)

    if (!body.name || !body.email || !body.id) {
        throw createError({
            statusCode: 400,
            statusMessage: "Name, email and id are required",
        })
    } 
	

	const user = await prisma.users.create({
		data: {
            id: body.id,
            name: body.name,
            email: body.email,
		},
	})

	return user
})
