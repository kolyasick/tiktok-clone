// auth.d.ts

declare module "#auth-utils" {
	interface User {
		id: number
		email: string
		role: number
	}

	interface UserSession {}

	interface SecureSessionData {
		// Add your own fields
	}
}

export {}
