<script setup lang="ts">
import type { IProfile } from "~/types/user.type";

const { $generalStore, $authStore } = useNuxtApp();
const { loggedIn } = useUserSession();

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
        <NuxtLink to="/">
          <NuxtImg class="-ml-1" width="155" height="40" src="/tiktok-logo-white.png" />
        </NuxtLink>
      </div>

      <div class="flex items-center justify-end gap-3 max-w-[250px] w-full">
        <button @click="isLoggedIn()" class="flex items-center transition bg-[#3a3a3a] rounded-sm px-3 py-[6px] hover:bg-[#303030]">
          <Icon name="mdi:plus" color="#000000" size="22" />
          <span class="px-2 font-medium text-[15px]">Upload</span>
        </button>

        <div v-if="!loggedIn" class="flex items-center">
          <button @click="toggleAuthModal()" class="flex items-center bg-[#F02C56] text-white rounded-sm px-3 py-[6px]">
            <span class="mx-4 font-medium text-[15px]">Log in</span>
          </button>
          <Icon name="mdi:dots-vertical" color="#161724" size="25" />
        </div>

        <div v-else class="flex items-center">
          <NuxtLink to="/chat" class="flex item-center justify-center mr-3">
            <Icon class="" name="carbon:send-alt" color="#161724" size="30" />
          </NuxtLink>
          <NuxtLink to="/chat" class="flex item-center justify-center mr-5">
            <Icon name="bx:message-detail" color="#161724" size="27" />
          </NuxtLink>
          <div class="relative">
            <button class="mt-1" @click="showMenu = !showMenu">
              <NuxtImg format="webp" class="rounded-full" width="33" :src="'/upload/avatars/' + $authStore.profile?.avatar" />
            </button>

            <div v-if="showMenu" id="PopupMenu" class="absolute bg-[#3a3a3a] rounded-lg py-1.5 w-[200px] shadow-xl top-[43px] -right-2">
              <NuxtLink
                :to="`/profile/${$authStore.profile?.name}`"
                @click="showMenu = false"
                class="flex items-center justify-start py-3 px-2 hover:bg-[#303030] cursor-pointer"
              >
                <Icon name="ph:user" size="20" />
                <span class="pl-2 font-semibold text-sm">Profile</span>
              </NuxtLink>
              <div @click="logout" class="flex items-center justify-start py-3 px-1.5 hover:bg-[#303030] border-t cursor-pointer">
                <Icon name="ic:outline-login" size="20" />
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
