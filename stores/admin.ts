import type { Block, Profile, Role, User } from "@prisma/client";
import { defineStore } from "pinia";
import type { IVideo } from "~/types/user.type";

type UserWithProfile = Profile & {
  user: User & {
    role: Role;
    block: Block;
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
    changeStatus(status: string, videoId: string, reason: string | null) {
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

    async deleteComment(id: number) {
      const comment = this.selectedVideo?.comments?.findIndex((c) => c.id === id);
      if (comment !== undefined && comment !== -1) {
        this.selectedVideo?.comments?.splice(comment, 1);
        await $fetch(`/api/admin/video/comment/${id}`, {
          method: "DELETE",
        });
      }
    },

    async blockUser(userId: number, reason: string, until: Date) {
      if (!userId) return;

      try {
        const res = await $fetch("/api/admin/user/block", {
          method: "POST",
          body: {
            userId,
            reason,
            until: new Date(until),
            info: "Обратитесь в поддержку за подробной информацией",
          },
        });
        const user = this.users.find((u) => u.userId === userId);
        if (user) {
          user.user.isBlocked = true;
          user.user.block = {
            id: Date.now(),
            info: "Обратитесь в поддержку за подробной информацией",
            reason,
            until,
            userId,
            updatedAt: new Date(),
            createdAt: new Date(),
          };
        }
      } catch (error) {
        console.log(error);
      }
    },

    async unblockUser(userId: number) {
      if (!userId) return;

      try {
        await $fetch("/api/admin/user/unblock", {
          method: "POST",
          body: {
            userId,
          },
        });

        const user = this.users.find((u) => u.userId === userId);
        if (user) {
          user.user.isBlocked = false;
        }
      } catch (error) {
        console.log(error);
      }
    },

    async getUsers(limit?: number) {
      this.users = await $fetch<UserWithProfile[]>("/api/admin/user/all", {
        query: { limit },
      });
    },
    async getVideos(limit?: number) {
      this.videos = await $fetch<IVideo[]>("/api/admin/video/all", {
        query: { limit },
      });
    },
  },
});
