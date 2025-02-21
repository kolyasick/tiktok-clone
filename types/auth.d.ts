// auth.d.ts

declare module "#auth-utils" {
	interface User {
		id: number
		name: string
		email: string
		avatar: string
		role: number
	}

	interface UserSession {}

	interface SecureSessionData {
		// Add your own fields
	}
}

export {}
