import type { Follows } from "@prisma/client";
import { defineStore } from "pinia";
import type { IProfile, IVideo } from "~/types/user.type";

export const useProfileStore = defineStore("profile", {
  state: () => ({
    videos: [] as IVideo[],
    currentVideos: [] as IVideo[],
    isLoading: false,
    isFollowLoading: false,
    friend: null as Follows | null,
  }),
  actions: {
    async handleFriendAction(action: "add" | "reply" | "unfollow", profile: IProfile) {
      const { $authStore, $generalStore } = useNuxtApp();

      if (!$authStore.profile) {
        $generalStore.isLoginOpen = true;
        $generalStore.bodySwitch(true);
        return;
      }

      try {
        this.isFollowLoading = true;
        const { id: userId } = $authStore.profile;
        const friendId = profile.id;

        if (action === "unfollow") {
          const res = await $fetch<Follows | null>("/api/friend/unfollow", {
            method: "PATCH",
            body: { friendId },
          });

          this.friend = res;
          const index = profile.followers?.findIndex(
            (f) => f.userId === userId || f.friendId === userId
          );

          if (index !== undefined && index !== -1) {
            profile.followers?.splice(index, 1);
          }
          return;
        }

        const endpoint = action === "add" ? "/api/friend/add" : "/api/friend/reply";
        const method = action === "add" ? "POST" : "PATCH";

        this.friend = await $fetch<Follows>(endpoint, {
          method,
          body: { friendId },
        });

        profile?.followers?.push({
          id: Date.now(),
          status: action === "add" ? "pending" : "accepted",
          userId,
          friendId,
          isFollowing: true,
          isFriend: action === "reply",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error(`Error handling friend action (${action}):`, error);
      } finally {
        this.isFollowLoading = false;
      }
    },

    async liked(id: number) {
      this.isLoading = true;
      const videos = await $fetch<IVideo[]>("/api/video/liked", {
        query: {
          userId: id,
        },
      });

      this.currentVideos = videos;
      this.isLoading = false;
    },

    allVideos() {
      this.currentVideos = this.videos;
    },
  },
});
