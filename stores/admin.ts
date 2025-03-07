import type { Profile, Role, User } from "@prisma/client";
import { defineStore } from "pinia";
import type { IVideo } from "~/types/user.type";

type UserWithProfile = Profile & {
  user: User & {
    role: Role;
  };
};

export const useAdminStore = defineStore("admin", {
  state: () => ({
    videos: [] as IVideo[] | [],
    users: [] as UserWithProfile[] | [],
    selectedVideo: null as IVideo | null,
    isEditModalVisible: false as boolean,
  }),
  actions: {
    changeStatus(status: string, videoId: number, reason: string | null) {
      const video = this.videos.find((video) => video.id === videoId);
      if (video) {
        if (status !== "deleted") {
          video.status = {
            id: Date.now(),
            title: status,
          };
          video.blockReason = reason;
        } else {
          const index = this.videos.findIndex((video) => video.id === videoId);
          this.videos.splice(index, 1);
        }
      }
    },

    async getUsers() {
      this.users = await $fetch<UserWithProfile[]>("/api/admin/user/all");
    },
    async getVideos(limit?: number) {
      this.videos = await $fetch<IVideo[]>("/api/admin/video/all", {
        query: { limit },
      });
    },
  },
});
