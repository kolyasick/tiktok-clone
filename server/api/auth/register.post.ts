import { prisma } from "~/server/composables/prisma"

type Body = {
	name: string
	email: string
	password: string
}

export default defineEventHandler(async (event) => {
	const { name, email, password } = await readBody<Body>(event)

	if (!name || !email || !password) {
		throw createError({
			statusCode: 400,
			statusMessage: "All fields are required",
		})
	}

	const candidate = await prisma.users.findUnique({
		where: {
			email,
		},
	})

	if (candidate) {
		throw createError({
			statusCode: 400,
			statusMessage: "User with this email already exist",
		})
	}

	const user = await prisma.users.create({
		data: {
			name,
			email,
			password,
			roleId: 1,
		},
	})

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
