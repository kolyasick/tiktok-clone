import { createError } from "h3"

export function validateName(name: string): void {
	if (!name || name.trim().length === 0) {
		throw createError({
			statusCode: 400,
			statusMessage: "Name is required",
		})
	}
}

export function validateEmail(email: string): void {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!email || !emailRegex.test(email)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Email is invalid",
		})
	}
}

export function validatePassword(password: string): void {
	if (!password || password.length < 6) {
		throw createError({
			statusCode: 400,
			statusMessage: "Password must be at least 6 characters long",
		})
	}
}
