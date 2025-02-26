import type { Profile } from "@prisma/client";
import { defineStore } from "pinia";
import type { IProfile } from "~/types/user.type";
import { validateEmail, validatePassword, validateName } from "~/utils/validationUtils";

interface IErrors {
  email: string | null;
  password: string | null;
  name: string | null;
  other: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    profile: null as IProfile | null,
    errors: <IErrors>{},
    isLoading: false,
    status: "offline" as string,
  }),
  actions: {
    clearErrors() {
      this.$patch({
        errors: { email: null, password: null, name: null, other: null },
      });
    },

    async register(name: string, email: string, password: string) {
      if (!validateName(name, this.errors) || !validateEmail(email, this.errors) || !validatePassword(password, this.errors)) return;

      try {
        this.isLoading = true;
        const user = await $fetch<Profile>("/api/auth/register", {
          method: "POST",
          body: {
            name,
            email,
            password,
          },
        });
        this.$patch({ profile: user });

        const { $generalStore } = useNuxtApp();

        await useUserSession()
          .fetch()
          .then(() => {
            this.isLoading = false;
            $generalStore.isLoginOpen = false;
          });
      } catch (error: any) {
        this.errors.other = error.statusMessage;
      } finally {
        this.isLoading = false;
      }
    },

    async login(email: string, password: string) {
      if (!email || !password) return;

      try {
        this.isLoading = true;
        const user = await $fetch<IProfile>("/api/auth/login", {
          method: "POST",
          body: {
            email,
            password,
          },
        });
        this.$patch({ profile: user });

        const { $generalStore } = useNuxtApp();
        await useUserSession()
          .fetch()
          .then(() => {
            $generalStore.isLoginOpen = false;
          });
      } catch (error: any) {
        this.errors.other = error.statusMessage;
      } finally {
        this.isLoading = false;
      }
    },

    async getProfileByName(name: string): Promise<IProfile> {
      return $fetch<IProfile>(`/api/profile/${name}`);
    },

    async getProfileById(id: number): Promise<IProfile> {
      return $fetch<IProfile>(`/api/profile/`, {
        query: { id },
      });
    },

    async logout() {
      await useUserSession().clear();
      this.$patch({ profile: null });
    },
  },
});
