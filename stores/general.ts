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
	},
})
