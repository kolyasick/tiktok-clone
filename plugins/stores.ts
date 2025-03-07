import { useGeneralStore } from "~/stores/general";
import { useAuthStore } from "~/stores/auth";
import { useVideosStore } from "~/stores/videos";
import { useProfileStore } from "~/stores/profile";
import { useAdminStore } from "~/stores/admin";

export default defineNuxtPlugin((NuxtApp) => {
  return {
    provide: {
      videosStore: useVideosStore(),
      generalStore: useGeneralStore(),
      authStore: useAuthStore(),
      profileStore: useProfileStore(),
      adminStore: useAdminStore(),
    },
  };
});
