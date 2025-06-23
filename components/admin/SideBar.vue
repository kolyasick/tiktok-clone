<script setup lang="ts">
const { $authStore } = useNuxtApp();
const colorMode = useColorMode();
import { IconsDashboard, IconsPeople, IconsVideos } from "#components";

const { locale, setLocale } = useI18n();
const toggleTheme = () => {
  colorMode.preference = colorMode.value === "dark" ? "light" : "dark";
};

const { t } = useI18n();
import type { Component } from "vue";

type Route = {
  name: string;
  descr: string;
  path: string;
  icon: Component;
};
const routes = shallowRef<Route[]>([]);

const updateRoutes = () => {
  routes.value = [
    {
      name: t("admin.sidebar.dashboard"),
      descr: t("admin.sidebar.dashboardDescr"),
      path: "/admin/dashboard",
      icon: IconsDashboard,
    },
    {
      name: t("admin.sidebar.videos"),
      descr: t("admin.sidebar.videosDescr"),
      path: "/admin/videos",
      icon: IconsVideos,
    },
    {
      name: t("admin.sidebar.users"),
      descr: t("admin.sidebar.usersDescr"),
      path: "/admin/users",
      icon: IconsPeople,
    },
  ];
};

updateRoutes();

watch(locale, () => {
  updateRoutes();
});

const props = defineProps({
  mobileOpen: { type: Boolean, default: false },
});
const emit = defineEmits(["close-mobile"]);
</script>

<template>
  <!-- Мобильный offcanvas -->
  <transition name="fade">
    <div v-if="props.mobileOpen" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click.self="emit('close-mobile')">
      <div class="fixed left-0 top-0 h-full w-64 bg-white dark:bg-dark shadow-xl flex flex-col pt-6 z-50 animate-slide-in">
        <!-- Кнопка закрытия -->
        <button class="absolute top-4 right-4" @click="emit('close-mobile')">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <!-- Контент меню -->
        <div class="px-4">
          <div class="flex items-center mb-2">
            <NuxtLink to="/" class="text-2xl px-6 text-gray-900 dark:text-white font-black tracking-[0.3px] sm:text-3xl font-[Montserrat]">
              Clip<span class="text-[#F02C56]">ify</span>
            </NuxtLink>
            <button @click="toggleTheme" class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700">
              <ThemeSwitcher />
            </button>
            <button
              @click="setLocale(locale === 'en' ? 'ru' : 'en')"
              class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700"
            >
              {{ locale === "en" ? "RU" : "EN" }}
            </button>
          </div>
          <p class="text-slate-400 text-sm mb-2 px-6">{{ $t("admin.sidebar.description") }}, {{ $authStore.profile?.name }}</p>

          <NuxtLink
            :to="$localePath('/profile/' + $authStore.profile?.name)"
            class="flex flex-col space-y-2 px-6 md:space-y-0 md:flex-row mb-5 items-center md:space-x-2 hover:bg-neutral-800 group transition duration-150 ease-linear group w-full py-3"
          >
            <div>
              <img class="rounded-full w-10 h-10 relative object-cover" :src="'/upload/avatars/' + $authStore.profile?.avatar" alt="" />
            </div>
            <div>
              <p class="font-medium group-hover:text-[#F02C56] leading-4">
                {{ $authStore.profile?.name }}
              </p>
              <span class="text-xs text-slate-400">Clipify</span>
            </div>
          </NuxtLink>

          <hr class="border-neutral-800" />
          <ul id="menu" class="flex flex-col">
            <li
              v-for="route in routes"
              :key="route.path"
              :class="{ 'dark:bg-neutral-800 bg-gray-200 text-[#F02C56]': $route.fullPath === route.path }"
              class="dark:hover:bg-neutral-800 hover:bg-gray-200 transition duration-150 ease-linear py-3 px-6 group"
            >
              <NuxtLink :to="$localePath(route.path)">
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
              class="hover:bg-neutral-800 transition duration-150 ease-linear py-3 px-6 w-full group cursor-pointer absolute bottom-10 border-t border-neutral-800"
            >
              <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 space-x-2 items-center">
                <IconsLogout class="group-hover:text-[#F02C56] w-6 h-6" />
                <div>
                  <p class="font-bold text-base lg:text-lg dark:text-slate-200 text-gray-800 leading-4 group-hover:text-[#F02C56]">
                    {{ $t("admin.sidebar.logout") }}
                  </p>
                  <p class="text-slate-400 text-sm hidden md:block">
                    {{ $t("admin.sidebar.logoutDescr") }}
                  </p>
                </div>
              </div>
            </li>
          </ul>
          <p class="text-sm text-center text-gray-600 absolute bottom-4 px-6">v2.0.0.3 | &copy; {{ new Date().getFullYear() }} Clipify</p>
        </div>
      </div>
    </div>
  </transition>
  <!-- Desktop sidebar -->
  <div id="menu" class="hidden lg:block bg-white dark:bg-dark fixed left-0 top-0 h-screen shadow-xl flex flex-col w-72 pt-6 z-30">
    <div class="flex items-center mb-2">
      <NuxtLink to="/" class="text-2xl px-6 text-gray-900 dark:text-white font-black tracking-[0.3px] sm:text-3xl font-[Montserrat]">
        Clip<span class="text-[#F02C56]">ify</span>
      </NuxtLink>
      <button @click="toggleTheme" class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700">
        <ThemeSwitcher />
      </button>
      <button
        @click="setLocale(locale === 'en' ? 'ru' : 'en')"
        class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700"
      >
        {{ locale === "en" ? "RU" : "EN" }}
      </button>
    </div>
    <p class="text-slate-400 text-sm mb-2 px-6">{{ $t("admin.sidebar.description") }}, {{ $authStore.profile?.name }}</p>

    <NuxtLink
      :to="$localePath('/profile/' + $authStore.profile?.name)"
      class="flex flex-col space-y-2 px-6 md:space-y-0 md:flex-row mb-5 items-center md:space-x-2 hover:bg-neutral-800 group transition duration-150 ease-linear group w-full py-3"
    >
      <div>
        <img class="rounded-full w-10 h-10 relative object-cover" :src="'/upload/avatars/' + $authStore.profile?.avatar" alt="" />
      </div>
      <div>
        <p class="font-medium group-hover:text-[#F02C56] leading-4">
          {{ $authStore.profile?.name }}
        </p>
        <span class="text-xs text-slate-400">Clipify</span>
      </div>
    </NuxtLink>

    <hr class="border-neutral-800" />
    <ul id="menu" class="flex flex-col">
      <li
        v-for="route in routes"
        :key="route.path"
        :class="{ 'dark:bg-neutral-800 bg-gray-200 text-[#F02C56]': $route.fullPath === route.path }"
        class="dark:hover:bg-neutral-800 hover:bg-gray-200 transition duration-150 ease-linear py-3 px-6 group"
      >
        <NuxtLink :to="$localePath(route.path)">
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
        class="hover:bg-neutral-800 transition duration-150 ease-linear py-3 px-6 w-full group cursor-pointer absolute bottom-10 border-t border-neutral-800"
      >
        <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 space-x-2 items-center">
          <IconsLogout class="group-hover:text-[#F02C56] w-6 h-6" />
          <div>
            <p class="font-bold text-base lg:text-lg dark:text-slate-200 text-gray-800 leading-4 group-hover:text-[#F02C56]">
              {{ $t("admin.sidebar.logout") }}
            </p>
            <p class="text-slate-400 text-sm hidden md:block">
              {{ $t("admin.sidebar.logoutDescr") }}
            </p>
          </div>
        </div>
      </li>
    </ul>
    <p class="text-sm text-center text-gray-600 absolute bottom-4 px-6">v2.0.0.3 | &copy; {{ new Date().getFullYear() }} Clipify</p>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@keyframes slide-in {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
.animate-slide-in {
  animation: slide-in 0.2s;
}
</style>
