import type { UserSession } from "#auth-utils"
import type { IUser } from "./../types/user.type"
import { defineStore } from "pinia"
import { validateEmail, validatePassword, validateName } from "~/utils/validationUtils"

interface IErrors {
	email: string | null
	password: string | null
	name: string | null
	other: string | null
}

export const useAuthStore = defineStore("auth", {
	state: () => ({
		user: <IUser | null>{},
		status: false as boolean,
		errors: <IErrors>{},
		isLoading: false,
	}),
	getters: {
		isAuth: (state) => state.status,
	},
	actions: {
		set(status: boolean, user: IUser | null) {
			this.$patch({
				status,
				user,
			})
		},

		clearErrors() {
			this.$patch({
				errors: { email: null, password: null, name: null, other: null },
			})
		},

		async register(name: string, email: string, password: string) {
			if (!name || !email || !password) return

			const res = await $fetch<UserSession>("/api/auth/register", {
				method: "POST",
				body: {
					name,
					email,
					password,
				},
			})

			if (res) {
				console.log("login...")

				await useUserSession().fetch()
			}
		},
	},
})
