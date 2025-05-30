import { defineStore } from "pinia";
import type { IVideo } from "~/types/user.type";

export const useVideosStore = defineStore("general", {
  state: () => ({
    videos: [] as IVideo[],
    offset: 0,
    limit: 3,
    hasMore: true,
    isLoading: false,
  }),

  actions: {
    async getVideos(excludeId?: string, userId?: string) {
      if (this.isLoading || !this.hasMore) return;

      this.isLoading = true;

      try {
        const $authStore = useAuthStore();
        const res = await $fetch<IVideo[]>(`/api/video`, {
          query: {
            offset: this.offset,
            limit: this.limit,
            excludeId: excludeId,
            userId: userId ?? undefined,
          },
        });

        if (res.length > 0) {
          this.videos = [
            ...this.videos,
            ...res.map((v) => ({
              ...v,
              liked: v?.likes?.some((like) => like.profileId === $authStore.profile?.id),
            })),
          ];

          this.offset += this.limit;

          if (res.length < this.limit) {
            this.hasMore = false;
          }
        } else {
          this.hasMore = false;
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        this.isLoading = false;
      }
    },

    async toggleLike(video: IVideo) {
      const $authStore = useAuthStore();
      const $generalStore = useGeneralStore();

      if (!$authStore.profile) {
        $generalStore.isLoginOpen = true;
        $generalStore.bodySwitch(true);
        return;
      }

      if (video.liked) {
        video.liked = false;
        video.likes = video.likes?.filter((like) => like.profileId !== $authStore.profile?.id);

        await $fetch(`/api/video/unlike`, {
          method: "DELETE",
          body: {
            videoId: video.id,
            profileId: $authStore.profile?.id,
          },
        });
      } else {
        video.liked = true;
        video.likes?.push({
          id: new Date().getTime(),
          profileId: $authStore.profile?.id || 0,
          videoId: video.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await $fetch(`/api/video/like`, {
          method: "POST",
          body: {
            videoId: video.id,
            profileId: $authStore.profile?.id,
          },
        });
      }
    },
  },
});
