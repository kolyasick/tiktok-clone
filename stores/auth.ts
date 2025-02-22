import type { User, UserSession } from "#auth-utils"
import type { Error } from "~/types/error.type"
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
		status: false as boolean,
		errors: <IErrors>{},
		isLoading: false,
	}),
	getters: {
		isAuth: (state) => state.status,
	},
	actions: {
		clearErrors() {
			this.$patch({
				errors: { email: null, password: null, name: null, other: null },
			})
		},

		async register(name: string, email: string, password: string) {
			if (
				!validateName(name, this.errors) ||
				!validateEmail(email, this.errors) ||
				!validatePassword(password, this.errors)
			)
				return

			try {
				this.isLoading = true
				await $fetch<UserSession>("/api/auth/register", {
					method: "POST",
					body: {
						name,
						email,
						password,
					},
				})

				const { $generalStore } = useNuxtApp()

				await useUserSession()
					.fetch()
					.then(() => {
						this.isLoading = false
						$generalStore.isLoginOpen = false
					})
			} catch (error: any) {
				this.errors.other = error.statusMessage
			} finally {
				this.isLoading = false
			}
		},

		async login(email: string, password: string) {
			if (!email || !password) return

			try {
				this.isLoading = true
				await $fetch<UserSession>("/api/auth/login", {
					method: "POST",
					body: {
						email,
						password,
					},
				})

				const { $generalStore } = useNuxtApp()
				await useUserSession()
					.fetch()
					.then(() => {
						$generalStore.isLoginOpen = false
					})
			} catch (error: any) {
				this.errors.other = error.statusMessage
			} finally {
				this.isLoading = false
			}
		},
	},
})
