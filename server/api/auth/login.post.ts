import { prisma } from "~/server/composables/prisma"

type Body = {
	email: string
	password: string
}

export default defineEventHandler(async (event) => {
	const { email, password } = await readBody<Body>(event)

	if (!email || !password) {
		throw createError({
			statusCode: 400,
			statusMessage: "All fields are required",
		})
	}

	const user = await prisma.users.findUnique({
		where: {
			email,
		},
	})

	if (!user) {
		throw createError({
			statusCode: 404,
			statusMessage: "User with this email were not found",
		})
	}

	const session = await setUserSession(event, {
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			avatar: user.avatar,
			role: user.roleId,
		},
		loggedInAt: new Date(),
	})

	if (!session) {
		throw createError({
			statusCode: 400,
			statusMessage: "Something went wrong",
		})
	}

	return session
})
