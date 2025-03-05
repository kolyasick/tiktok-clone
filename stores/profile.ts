import type { Follows } from "@prisma/client"
import { defineStore } from "pinia"
import type { IProfile, IVideo } from "~/types/user.type"

export const useProfileStore = defineStore("profile", {
	state: () => ({
		videos: [] as IVideo[],
		currentVideos: [] as IVideo[],
		isLoading: false,
		friend: null as Follows | null,
	}),
	actions: {
		async handleFriendAction(action: "add" | "reply", profile: IProfile) {
			const { $authStore, $generalStore } = useNuxtApp()
			if (!$authStore.profile) {
				$generalStore.isLoginOpen = true
				return
			}
			try {
				profile?.followers?.push({
					id: new Date().getTime(),
					status: "accept",
					userId: $authStore.profile.id,
					friendId: profile?.id,
					createdAt: new Date(),
					updatedAt: new Date(),
				})

				if (action === "add") {
					this.friend = await $fetch<Follows>("/api/friend/add", {
						method: "POST",
						body: {
							userId: $authStore.profile.id,
							friendId: profile.id,
						},
					})
				} else {
					this.friend = await $fetch<Follows>("/api/friend/reply", {
						method: "PATCH",
						body: {
							userId: $authStore.profile.id,
							friendId: profile.id,
						},
					})
				}
			} catch (error) {
				console.error(`Error handling friend action (${action}):`, error)
			}
		},

		async liked(id: number) {
			this.isLoading = true
			const videos = await $fetch<IVideo[]>("/api/video/liked", {
				query: {
					userId: id,
				},
			})

			this.currentVideos = videos
			this.isLoading = false
		},

		allVideos() {
			this.currentVideos = this.videos
		},
	},
})
