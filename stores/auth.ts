import type { Follows } from "@prisma/client";
import { defineStore } from "pinia";
import type { IProfile } from "~/types/user.type";

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
    message: null as string | null,
    followers: [] as Follows[],
    confirmationCredentials: null as null | {
      name: string;
      email: string;
      password: string;
    },
  }),
  actions: {
    clearErrors() {
      this.$patch({
        errors: { email: null, password: null, name: null, other: null },
        message: null,
      });
    },

    async register(name: string, email: string, password: string) {
      this.clearErrors();

      if (
        !validateName(name, this.errors) ||
        !validateEmail(email, this.errors) ||
        !validatePassword(password, this.errors)
      ) {
        return;
      }

      try {
        this.isLoading = true;

        const response = await $fetch<string>("/api/auth/register", {
          method: "POST",
          body: { name, email, password },
        });

        if (response === "OK") {
          this.confirmationCredentials = {
            email,
            password,
            name,
          };
        }
      } catch (error: any) {
        console.error("Registration error:", error);

        const errorMessage =
          error.data?.message ||
          error.statusMessage ||
          error.message ||
          "Registration failed. Please try again.";

        this.errors.other = errorMessage;
      } finally {
        this.isLoading = false;
      }
    },

    async login(name: string, password: string) {
      this.clearErrors();
      if (!name || !password) return;

      try {
        this.isLoading = true;
        const user = await $fetch<IProfile>("/api/auth/login", {
          method: "POST",
          body: { name, password },
        });

        this.$patch({ profile: user });

        try {
          await useUserSession().fetch();
        } catch (sessionError) {
          console.error("Session fetch error:", sessionError);
        }
      } catch (error: any) {
        console.error("Login error:", error);

        const errorMessage =
          error.data?.message || error.statusMessage || error.message || "Unknown error occurred";

        if (error.statusCode === 403) {
          this.message = errorMessage;
        } else {
          this.errors.other = errorMessage;
        }
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
      const localePath = useLocalePath();
      try {
        await useUserSession().clear();
        await $fetch("/api/auth/logout");
        this.$patch({ profile: null });
        await navigateTo(localePath("/"));
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
});
