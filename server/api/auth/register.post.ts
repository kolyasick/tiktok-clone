import { prisma } from "~/server/composables/prisma"
import { validateEmail, validateName, validatePassword } from "~/server/composables/validators"

type Body = {
	name: string
	email: string
	password: string
}

export default defineEventHandler(async (event) => {
	const { name, email, password } = await readBody<Body>(event)

	validateName(name)
	validateEmail(email)
	validatePassword(password)

	const candidate = await prisma.user.findUnique({
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
	const hashedPassword = await hashPassword(password)

	const user = await prisma.user.create({
		data: {
			email,
			password: hashedPassword,
			roleId: 1,
		},
	})

	const profile = await prisma.profile.create({
		data: {
			name,
			userId: user.id,
		},
	})

	const session = await setUserSession(event, {
		user: {
			id: user.id,
			email: user.email,
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

	return profile
})
