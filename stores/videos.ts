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

		async getVideos() {
			const { $authStore } = useNuxtApp()
			await $fetch<IVideo[]>(`/api/video`).then((res) => {
				this.videos = res.map((v) => ({
					...v,
					liked: v?.likes?.some((like) => like.profileId === $authStore.profile?.id),
				}))
			})
		},

		async toggleLike(video: IVideo) {
			const { $authStore } = useNuxtApp()
			if (!$authStore.profile) return
			
			if (video.liked) {
				video.liked = false
				video.likes = video.likes?.filter(
					(like) => like.profileId !== $authStore.profile?.id
				)

				await $fetch(`/api/video/unlike`, {
					method: "DELETE",
					body: {
						videoId: video.id,
						profileId: $authStore.profile?.id,
					},
				})
			} else {
				video.liked = true
				video.likes?.push({
					id: new Date().getTime(),
					profileId: $authStore.profile?.id || 0,
					videoId: video.id,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				await $fetch(`/api/video/like`, {
					method: "POST",
					body: {
						videoId: video.id,
						profileId: $authStore.profile?.id,
					},
				})
			}
		},
	},
})
