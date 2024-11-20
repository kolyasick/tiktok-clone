import { useGeneralStore } from "~/stores/general"
import { useAuthStore } from "~/stores/auth"
import { useVideosStore } from "~/stores/videos"

export default defineNuxtPlugin((NuxtApp) => {
	return {
		provide: {
			videosStore: useVideosStore(),
			generalStore: useGeneralStore(),
			authStore: useAuthStore(),
		},
	}
})
