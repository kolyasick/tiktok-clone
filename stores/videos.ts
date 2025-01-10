import { defineStore } from "pinia"
import type { IVideo } from "~/types/user.type"
import { useAuthStore } from "~/stores/auth"
import { useGeneralStore } from "~/stores/general"

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
		clearVideos() {
			this.set([])
			this.offset = 0
			this.hasMore = true
		},

		async getVideos() {
			if (!this.hasMore || this.isLoading) return

			this.isLoading = true

			try {
				const authStore = useAuthStore()

				const { data, error, refresh } = await useFetch<IVideo[]>("/api/get-videos", {
					query: {
						offset: this.offset,
						limit: this.limit,
					},
				})
				if (!data.value) {
					await refresh()
					return
				}

				const videoData = data.value?.map((video: IVideo) => ({
					...video,
					liked: video.likes?.some((like) => like.userId === authStore.user?.id),
				}))

				this.videos.push(...(videoData || []))

				if (videoData && videoData?.length < this.limit) {
					this.hasMore = false
				} else {
					this.offset += this.limit
				}
			} catch (error) {
				console.log(error)
			} finally {
				this.isLoading = false
			}
		},
		async toggleLike(video: IVideo) {
			const authStore = useAuthStore()
			const generalStore = useGeneralStore()
			if (!authStore.isAuth) {
				generalStore.isLoginOpen = true
				return
			}

			const hasLiked = video.likes?.some((like) => like.userId === authStore.user?.id)

			const likeObject = {
				id: new Date().getTime(),
				userId: authStore.user?.id as string,
				createdAt: new Date(),
				updatedAt: new Date(),
				postId: video.id,
			}

			let updatedLikes
			if (!hasLiked) {
				video.liked = true
				updatedLikes = video.likes ? [...video.likes] : []

				const userHasLiked = updatedLikes.some((like) => like.userId === authStore.user?.id)
				if (!userHasLiked) {
					updatedLikes.push(likeObject)
				}

				video.likes = updatedLikes

				const videoItem = this.videos.find((v) => v.id === video.id)
				if (videoItem) {
					videoItem.likes = updatedLikes
					videoItem.liked = true
				}

				await this.likeVideo(video)
			} else {
				video.liked = false
				updatedLikes = video.likes?.filter((like) => like.userId !== authStore.user?.id)
				video.likes = updatedLikes

				const videoItem = this.videos.find((v) => v.id === video.id)
				if (videoItem) {
					videoItem.likes = updatedLikes || []
					videoItem.liked = false
				}

				await this.unlikeVideo(video)
			}
		},

		async likeVideo(video: IVideo) {
			const authStore = useAuthStore()
			try {
				await $fetch(`/api/like-video`, {
					method: "POST",
					body: {
						postId: video.id,
						userId: authStore.user?.id,
					},
				})
			} catch (error) {
				console.log(error)
			}
		},

		async unlikeVideo(video: IVideo) {
			const authStore = useAuthStore()
			try {
				await $fetch(`/api/unlike-video`, {
					method: "POST",
					body: {
						postId: video.id,
						userId: authStore.user?.id,
					},
				})
			} catch (error) {
				console.log(error)
			}
		},
		async createComment(video: IVideo, text: string) {
			const authStore = useAuthStore()
			try {
				await $fetch(`/api/create-comment`, {
					method: "POST",
					body: {
						postId: video.id,
						text,
						userId: authStore.user?.id,
					},
				})
			} catch (error) {
				console.log(error)
			}
		},
	},
})
