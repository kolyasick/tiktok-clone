<script setup lang="ts">
import type { IProfile } from "~/types/user.type";

const { $generalStore, $authStore } = useNuxtApp();
const { loggedIn, user } = useUserSession();

const router = useRouter();

let showMenu = ref(false);

const toggleAuthModal = () => {
  $generalStore.bodySwitch(true);
  $generalStore.isLoginOpen = true;
};

const isLoggedIn = () => {
  if (loggedIn.value) {
    return router.push("/upload");
  } else {
    $generalStore.isLoginOpen = true;
  }
};

const logout = async () => {
  const { handleStatus } = useChat();
  await handleStatus("offline", $authStore.profile as IProfile);
  await $authStore.logout();
};
</script>
<template>
  <div id="TopNav" class="sticky top-0 bg-[#121212] z-30 flex items-center w-full h-[61px] border-b border-[#ebebeb6c]">
    <div class="flex items-center justify-between container">
      <div>
        <NuxtLink to="/"> <img class="-ml-1" width="155" height="40" src="/tiktok-logo-white.png" /> </NuxtLink>
      </div>

      <div class="flex items-center justify-end gap-3 max-w-[250px] w-full">
        <button
          @click="isLoggedIn()"
          class="flex items-center transition bg-[#3a3a3a] rounded-md px-3 py-[6px] hover:bg-[#303030]"
        >
          <IconsPlus class="w-5 h-5" />
          <span class="px-2 font-medium text-[15px]">Upload</span>
        </button>

        <div v-if="!loggedIn" class="flex items-center">
          <button @click="toggleAuthModal()" class="flex items-center bg-[#F02C56] text-white rounded-md px-3 py-[6px]">
            <span class="mx-4 font-medium text-[15px]">Log in</span>
          </button>
          <IconsDots class="w-7 h-7" />
        </div>

        <div v-else class="flex items-center">
          <NuxtLink to="/chat" class="flex item-center justify-center mr-5">
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

            <div
              v-if="showMenu"
              id="PopupMenu"
              class="absolute bg-[#3a3a3a] rounded-lg py-1.5 w-[200px] shadow-xl top-[43px] -right-2"
            >
              <NuxtLink
                :to="`/profile/${$authStore.profile?.name}`"
                @click="showMenu = false"
                class="flex items-center justify-start py-3 px-2 hover:bg-[#303030] cursor-pointer"
              >
                <IconsUser class="w-5 h-5" />
                <span class="pl-2 font-semibold text-sm">Profile</span>
              </NuxtLink>
              <div
                @click="logout"
                class="flex items-center justify-start py-3 px-1.5 hover:bg-[#303030] border-t cursor-pointer"
              >
                <IconsLogout class="w-5 h-5" />
                <span class="pl-2 font-semibold text-sm">Log out</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
