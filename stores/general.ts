import { defineStore } from "pinia"

export const useGeneralStore = defineStore("gen", {
	state: () => ({
		isLoginOpen: false as boolean,
		isEditProfileOpen: false as boolean,
		isBackUrl: "/" as string,
	}),
	actions: {
		bodySwitch(val: boolean) {
			if (val) {
				document.body.style.overflow = "hidden"
				return
			}
			document.body.style.overflow = "visible"
		},

		allLowerCaseNoCaps(str: string) {
			return str.split(" ").join("").toLowerCase()
		},

		setBackUrl(url: string) {
			this.isBackUrl = url
		},
		async uploadFile(file: File | Blob, path: string, errors: string | null) {
			const supabase = useSupabaseClient()

			if (!file) {
				errors = "Please upload a video"
				return
			}

			const { data, error } = await supabase.storage
				.from("uploads")
				.upload(`${path}${Date.now()}`, file)

			if (error) {
				errors = "Something went wrong"
				return
			}

			return data.fullPath
		},
	},
})
