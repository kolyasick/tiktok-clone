import type { Friendship } from "@prisma/client";
import { defineStore } from "pinia";
import type { IProfile, IVideo } from "~/types/user.type";

export const useProfileStore = defineStore("profile", {
  state: () => ({
    videos: [] as IVideo[],
    currentVideos: [] as IVideo[],
    isLoading: false,
    friend: null as Friendship | null,
  }),
  actions: {
    async handleFriendAction(action: "add" | "apply" | "reject", profile: IProfile) {
      const { $authStore, $generalStore } = useNuxtApp();
      if (!$authStore.profile) {
        $generalStore.isLoginOpen = true;
        return;
      }
      try {
        let endpoint: string;
        let body: Record<string, any> = {};

        switch (action) {
          case "add":
            endpoint = "/api/friend/add";
            body = {
              userId: $authStore.profile.id,
              friendId: profile?.id,
            };
            break;

          case "apply":
            endpoint = "/api/friend/apply";
            body = {
              userId: profile?.id || 0,
              friendId: $authStore.profile.id || 0,
            };
            break;

          case "reject":
            endpoint = "/api/friend/reject";
            break;

          default:
            throw new Error(`Unknown action: ${action}`);
        }

        if (action === "add" || action === "apply") {
          profile?.followers?.push({
            id: new Date().getTime(),
            status: "accept",
            userId: $authStore.profile.id,
            friendId: profile?.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        this.friend = await $fetch<Friendship>(endpoint, {
          method: action === "add" ? "POST" : "PATCH",
          body,
        });
      } catch (error) {
        console.error(`Error handling friend action (${action}):`, error);
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
