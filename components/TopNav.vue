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
    <div class="flex items-center justify-between container gap-2">
      <NuxtLink class="flex items-center gap-2" to="/">
        <svg class="hidden sm:block" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24">
          <path
            fill="#F02C56"
            d="M4.5 4.5a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h8.25a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3zm15.44 14.25l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06"
          />
        </svg>
        <div class="text-2xl text-white font-black tracking-[0.3px] sm:text-3xl font-[Montserrat]">
          Clip<span class="text-[#F02C56]">ify</span>
        </div>
      </NuxtLink>

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

            <Transition name="modal">
              <div
                v-if="showMenu"
                id="PopupMenu"
                class="absolute bg-[#3a3a3a] rounded-md w-[200px] shadow-xl top-[43px] -right-0"
              >
                <NuxtLink
                  :to="`/profile/${$authStore.profile?.name}`"
                  @click="showMenu = false"
                  class="flex items-center justify-start py-3 px-2 hover:bg-[#303030] rounded-md"
                >
                  <IconsUser class="w-5 h-5" />
                  <span class="pl-2 font-semibold text-sm">Profile</span>
                </NuxtLink>
                <hr />
                <div
                  @click="logout"
                  class="flex items-center justify-start rounded-md py-3 px-2 hover:bg-[#303030] cursor-pointer"
                >
                  <IconsLogout class="w-5 h-5" />
                  <span class="pl-2 font-semibold text-sm">Log out</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
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
