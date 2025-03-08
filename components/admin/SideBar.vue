<script setup lang="ts">
import { routes } from "./routes";
const { $authStore } = useNuxtApp();
</script>

<template>
  <div id="menu" class="bg-white/10 col-span-3 rounded-lg p-4">
    <NuxtLink
      to="/"
      class="font-bold text-lg lg:text-3xl bg-gradient-to-br from-white via-white/50 to-transparent bg-clip-text text-transparent"
    >
      Podvodni-Tok<span class="text-indigo-400">.</span>
    </NuxtLink>
    <p class="text-slate-400 text-sm mb-2">Welcome back, {{ $authStore.profile?.name }}</p>
    <NuxtLink
      :to="'/profile/' + $authStore.profile?.name"
      class="flex flex-col space-y-2 md:space-y-0 md:flex-row mb-5 items-center md:space-x-2 hover:bg-white/10 group transition duration-150 ease-linear rounded-lg group w-full py-3 px-2"
    >
      <div>
        <img
          class="rounded-full w-10 h-10 relative object-cover"
          :src="'/upload/avatars/' + $authStore.profile?.avatar"
          alt=""
        />
      </div>
      <div>
        <p class="font-medium group-hover:text-indigo-400 leading-4">{{ $authStore.profile?.name }}</p>
        <span class="text-xs text-slate-400">Podvodni-Tok</span>
      </div>
    </NuxtLink>
    <hr class="my-2 border-slate-700" />
    <div id="menu" class="flex flex-col space-y-2 my-5">
      <NuxtLink
        v-for="route in routes"
        :to="route.path"
        class="hover:bg-white/10 transition duration-150 ease-linear rounded-lg py-3 px-2 group"
      >
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
    </div>
    <p class="text-sm text-center text-gray-600">v2.0.0.3 | &copy; {{ new Date().getFullYear() }} Podvodni-Tok</p>
  </div>
</template>

<style scoped>
.router-link-active {
  @apply bg-white/10;
}
</style>
