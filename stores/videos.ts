import { defineStore } from "pinia"
import type { IVideo } from "~/types/user.type"

export const useVideosStore = defineStore("general", {
	state: () => ({
		videos: [] as IVideo[],
		offset: 0,
		limit: 1,
		hasMore: true,
		isLoading: false,
	}),

	actions: {
		set(videos: IVideo[]) {
			this.$patch({ videos })
		},
	},
})
