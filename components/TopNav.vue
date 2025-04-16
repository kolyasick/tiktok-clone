<script setup lang="ts">
import type { IProfile } from "~/types/user.type";

const { locales, setLocale, t } = useI18n();
const localePath = useLocalePath();

const { $generalStore, $authStore } = useNuxtApp();
const { loggedIn } = useUserSession();
const { addNotification } = useNotification();

const colorMode = useColorMode();

let showMenu = ref(false);
let showSettingsModal = ref(false);

const toggleAuthModal = () => {
  $generalStore.bodySwitch(true);
  $generalStore.isLoginOpen = true;
};

const isLoggedIn = () => {
  if (loggedIn.value) {
    return navigateTo(localePath("/upload"));
  } else {
    $generalStore.isLoginOpen = true;
  }
};

const logout = async () => {
  const { handleStatus } = useChat();
  await handleStatus("offline", $authStore.profile as IProfile);
  await $authStore.logout();
  addNotification({
    message: t("authMessages.logout"),
    type: "error",
    duration: 2000,
  });
};

const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>

<template>
  <div
    id="TopNav"
    class="sticky top-0 bg-light dark:bg-dark z-30 flex items-center w-full h-[61px] border-b border-gray-200 dark:border-[#ebebeb6c]"
  >
    <div class="flex items-center justify-between container gap-2">
      <NuxtLink class="flex items-center gap-2" :to="$localePath('index')">
        <svg
          class="hidden sm:block"
          xmlns="http://www.w3.org/2000/svg"
          width="35"
          height="35"
          viewBox="0 0 24 24"
        >
          <path
            fill="#F02C56"
            d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3zm15.44 14.25l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06"
          />
        </svg>
        <div
          class="text-2xl text-gray-900 dark:text-white font-black tracking-[0.3px] sm:text-3xl font-[Montserrat]"
        >
          Clip<span class="text-[#F02C56]">ify</span>
        </div>
      </NuxtLink>

      <div class="flex items-center justify-end gap-3 max-w-[350px] w-full">
        <button
          @click="isLoggedIn()"
          class="flex items-center transition bg-gray-200 dark:bg-neutral-800 rounded-md px-3 sm:h-9 h-8 hover:bg-gray-300 dark:hover:bg-neutral-800"
        >
          <IconsPlus class="w-5 h-5" />
          <span class="px-2 font-medium text-[15px] max-[400px]:hidden">{{ $t("upload") }}</span>
        </button>

        <div v-if="!loggedIn" class="flex items-center">
          <button
            @click="toggleAuthModal()"
            class="flex items-center bg-[#F02C56] text-white rounded-md px-3 sm:h-9 h-8"
          >
            <span class="font-medium text-[15px]">{{ $t("login") }}</span>
          </button>
        </div>

        <div v-else class="flex items-center">
          <NuxtLink :to="$localePath('chat')" class="flex item-center justify-center mr-5">
            <IconsChat class="w-7 h-7" />
          </NuxtLink>

          <div class="relative">
            <button class="mt-1" @click="showMenu = !showMenu">
              <img
                class="rounded-full aspect-square object-cover"
                width="33"
                :src="'/upload/avatars/' + $authStore.profile?.avatar"
              />
            </button>

            <Transition name="modal">
              <div
                v-if="showMenu"
                id="PopupMenu"
                class="absolute bg-white dark:bg-neutral-800 rounded-md w-[200px] shadow-xl top-[43px] -right-0"
              >
                <NuxtLink
                  :to="
                    $localePath({
                      name: 'profile-name',
                      params: { name: $authStore.profile?.name },
                    })
                  "
                  @click="showMenu = false"
                  class="flex items-center justify-start py-3 px-2 dark:hover:bg-neutral-600 hover:bg-gray-200 rounded-t-md"
                >
                  <IconsUser class="w-5 h-5" />
                  <span class="pl-2 font-semibold text-sm">{{ $t("profile") }}</span>
                </NuxtLink>
                <hr class="border-gray-200 dark:border-neutral-600" />
                <div
                  @click="logout"
                  class="flex items-center rounded-b-md justify-start py-3 px-2 dark:hover:bg-neutral-600 hover:bg-gray-200 cursor-pointer"
                >
                  <IconsLogout class="w-5 h-5" />
                  <span class="pl-2 font-semibold text-sm">{{ $t("logout") }}</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
        <button
          class="flex items-center justify-center"
          @click="showSettingsModal = !showSettingsModal"
        >
          <IconsDots class="w-5 h-5" />
        </button>
        <Transition name="modal">
          <div
            v-if="showSettingsModal"
            class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
            @click.self="showSettingsModal = false"
          >
            <div class="bg-white dark:bg-neutral-800 rounded-lg p-6 w-80 max-w-full">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">{{ $t("settings") }}</h3>
                <button @click="showSettingsModal = false">
                  <IconsClose class="w-5 h-5" />
                </button>
              </div>

              <div class="space-y-4">
                <div>
                  <h4 class="font-medium mb-2">{{ $t("language") }}</h4>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="locale in locales"
                      :key="locale.code"
                      @click="setLocale(locale.code)"
                      class="px-3 py-1 rounded-md"
                      :class="{
                        'bg-[#F02C56] text-white': $i18n.locale === locale.code,
                        'bg-gray-200 dark:bg-neutral-700': $i18n.locale !== locale.code,
                      }"
                    >
                      {{ locale.name }}
                    </button>
                  </div>
                </div>

                <hr class="border-gray-200 dark:border-neutral-600" />

                <div class="flex items-center justify-between">
                  <span class="font-medium">{{ $t("theme") }}</span>
                  <button
                    @click="toggleTheme"
                    class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700"
                  >
                    <ThemeSwitcher />
                    <span>{{ colorMode.value === "dark" ? $t("lightMode") : $t("darkMode") }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
