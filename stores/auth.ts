import type { IUser } from "./../types/user.type"
import { defineStore } from "pinia"
import { useGeneralStore } from "~/stores/general"
import { useVideosStore } from "~/stores/videos"
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

		async register(email: string, password: string, name: string) {
			if (
				!validateName(name, this.errors) ||
				!validateEmail(email, this.errors) ||
				!validatePassword(password, this.errors)
			) {
				return
			}

			try {
				this.clearErrors()
				this.isLoading = true

				const { data, error } = await useSupabaseClient().auth.signUp({
					email,
					password,
				})

				if (error) {
					this.errors.other = error.message
					return
				}

				const { data: user } = await useFetch<IUser>("/api/create-user", {
					method: "POST",
					body: {
						id: data.user?.id,
						email,
						name,
					},
				})

				this.set(true, user.value)
				email = ""
				password = ""
				name = ""

				window.location.reload()
				useGeneralStore().isLoginOpen = false
			} catch (error: any) {
				this.errors.other = error.message
			} finally {
				this.isLoading = false
			}
		},
		async login(email: string, password: string) {
			if (!validateEmail(email, this.errors) || !validatePassword(password, this.errors)) {
				return
			}

			try {
				this.clearErrors()
				this.isLoading = true

				const { data, error } = await useSupabaseClient().auth.signInWithPassword({
					email,
					password,
				})
				if (error) {
					this.errors.other = error.message
					return
				}

				const { data: user } = await useFetch<IUser>(`/api/get-user/${data.user?.id}`)

				this.set(true, user.value)
				email = ""
				password = ""

				window.location.reload()
				useGeneralStore().isLoginOpen = false
			} catch (error: any) {
				this.errors.other = error.message
			} finally {
				this.isLoading = false
			}
		},
		async getUser() {
			const user = useSupabaseUser()

			if (!user.value) return

			try {
				const { data } = await useFetch<IUser>(`/api/get-user/${user.value?.id}`)
				this.set(true, data.value)
			} catch (error) {
				throw error
			}
		},

		async logout() {
			await useSupabaseClient().auth.signOut()
			this.set(false, null)
			window.location.reload()
		},
	},
})
