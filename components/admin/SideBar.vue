<script setup lang="ts">
import { routes } from "./routes";
const { $authStore } = useNuxtApp();
const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};
</script>

<template>
  <div
    id="menu"
    class="lg:block bg-white dark:bg-white/10 fixed left-0 top-0 h-screen shadow-xl flex flex-col w-64 pt-6"
  >
    <div class="flex items-center mb-2">
      <NuxtLink
        to="/"
        class="text-2xl px-6 text-gray-900 dark:text-white font-black tracking-[0.3px] sm:text-3xl font-[Montserrat]"
      >
        Clip<span class="text-[#F02C56]">ify</span>
      </NuxtLink>
      <button
        @click="toggleTheme"
        class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700"
      >
        <ThemeSwitcher />
      </button>
    </div>
    <p class="text-slate-400 text-sm mb-2 px-6">Welcome back, {{ $authStore.profile?.name }}</p>

    <NuxtLink
      :to="'/profile/' + $authStore.profile?.name"
      class="flex flex-col space-y-2 px-6 md:space-y-0 md:flex-row mb-5 items-center md:space-x-2 hover:bg-white/10 group transition duration-150 ease-linear group w-full py-3"
    >
      <div>
        <img
          class="rounded-full w-10 h-10 relative object-cover"
          :src="'/upload/avatars/' + $authStore.profile?.avatar"
          alt=""
        />
      </div>
      <div>
        <p class="font-medium group-hover:text-[#F02C56] leading-4">
          {{ $authStore.profile?.name }}
        </p>
        <span class="text-xs text-slate-400">Clipify</span>
      </div>
    </NuxtLink>

    <hr class="border-slate-700" />
    <ul id="menu" class="flex flex-col">
      <li
        v-for="route in routes"
        :key="route.path"
        :class="{ 'dark:bg-white/10 bg-gray-200 text-[#F02C56]': $route.fullPath === route.path }"
        class="dark:hover:bg-white/10 hover:bg-gray-200 transition duration-150 ease-linear py-3 px-6 group"
      >
        <NuxtLink :to="route.path">
          <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 space-x-2 items-center">
            <component :is="route.icon" class="group-hover:text-[#F02C56] w-6 h-6" />
            <div>
              <p class="font-bold text-base lg:text-lg leading-4 group-hover:text-[#F02C56]">
                {{ route.name }}
              </p>
              <p class="text-slate-400 text-sm hidden md:block">
                {{ route.descr }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </li>

      <li
        @click="$authStore.logout"
        class="hover:bg-white/10 transition duration-150 ease-linear py-3 px-6 w-full group cursor-pointer absolute bottom-10 border-t border-slate-700"
      >
        <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 space-x-2 items-center">
          <IconsLogout class="group-hover:text-[#F02C56] w-6 h-6" />
          <div>
            <p
              class="font-bold text-base lg:text-lg dark:text-slate-200 text-gray-800 leading-4 group-hover:text-[#F02C56]"
            >
              Logout
            </p>
            <p class="text-slate-400 text-sm hidden md:block">Logout of account</p>
          </div>
        </div>
      </li>
    </ul>
    <p class="text-sm text-center text-gray-600 absolute bottom-4 px-6">
      v2.0.0.3 | &copy; {{ new Date().getFullYear() }} Clipify
    </p>
  </div>
</template>
