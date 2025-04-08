<script setup lang="ts">
import { routes } from "./routes";
const { $authStore } = useNuxtApp();
</script>

<template>
  <div id="menu" class="lg:block bg-white/10 fixed left-0 top-0 h-screen shadow-lg flex flex-col w-64 pt-6">
    <NuxtLink to="/" class="font-bold px-6 text-lg lg:text-3xl bg-gradient-to-br from-white via-white/50 to-transparent bg-clip-text text-transparent">
      Clipify<span class="text-indigo-400">.</span>
    </NuxtLink>
    <p class="text-slate-400 text-sm mb-2 px-6">Welcome back, {{ $authStore.profile?.name }}</p>
    <NuxtLink
      :to="'/profile/' + $authStore.profile?.name"
      class="flex flex-col space-y-2 px-6 md:space-y-0 md:flex-row mb-5 items-center md:space-x-2 hover:bg-white/10 group transition duration-150 ease-linear group w-full py-3"
    >
      <div>
        <img class="rounded-full w-10 h-10 relative object-cover" :src="'/upload/avatars/' + $authStore.profile?.avatar" alt="" />
      </div>
      <div>
        <p class="font-medium group-hover:text-indigo-400 leading-4">{{ $authStore.profile?.name }}</p>
        <span class="text-xs text-slate-400">Clipify</span>
      </div>
    </NuxtLink>

    <hr class="border-slate-700" />
    <ul id="menu" class="flex flex-col">
      <li v-for="route in routes" :key="route.path" class="hover:bg-white/10 transition duration-150 ease-linear py-3 px-6 group">
        <NuxtLink :to="route.path">
          <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 space-x-2 items-center">
            <component :is="route.icon" class="group-hover:text-indigo-400 w-6 h-6" />
            <div>
              <p class="font-bold text-base lg:text-lg text-slate-200 leading-4 group-hover:text-indigo-400">
                {{ route.name }}
              </p>
              <p class="text-slate-400 text-sm hidden md:block">{{ route.descr }}</p>
            </div>
          </div>
        </NuxtLink>
      </li>

      <li
        @click="$authStore.logout"
        class="hover:bg-white/10 transition duration-150 ease-linear py-3 px-6 w-full group cursor-pointer absolute bottom-10 border-t border-slate-700"
      >
        <div class="flex flex-col space-y-2 md:flex-row md:space-y-0 space-x-2 items-center">
          <IconsLogout class="group-hover:text-indigo-400 w-6 h-6" />
          <div>
            <p class="font-bold text-base lg:text-lg text-slate-200 leading-4 group-hover:text-indigo-400">Logout</p>
            <p class="text-slate-400 text-sm hidden md:block">Logout of account</p>
          </div>
        </div>
      </li>
    </ul>
    <p class="text-sm text-center text-gray-600 absolute bottom-4 px-6">v2.0.0.3 | &copy; {{ new Date().getFullYear() }} Clipify</p>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply bg-white/10;
}
</style>
