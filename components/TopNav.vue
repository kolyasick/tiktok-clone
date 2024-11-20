<script setup lang="ts">
const { $generalStore, $authStore } = useNuxtApp()

const route = useRoute()
const router = useRouter()

let showMenu = ref(false)

const isLoggedIn = () => {
	if ($authStore.isAuth) {
		router.push("/upload")
	} else {
		$generalStore.isLoginOpen = true
	}
}
</script>
<template>
	<div
		id="TopNav"
		class="fixed bg-[#121212] z-30 flex items-center w-full h-[61px]">
		<div class="flex items-center justify-between w-full px-2 mx-auto max-w-[1260px]">
			<div :class="route.fullPath === '/' ? 'w-[80%]' : 'lg:w-[20%] w-[70%]'">
				<NuxtLink to="/">
					<NuxtImg width="155" src="/tiktok-logo-white.png" />
				</NuxtLink>
			</div>

			<div class="flex items-center justify-end gap-3 min-w-[275px] max-w-[320px] w-full">
				<button
					@click="isLoggedIn()"
					class="flex items-center transition bg-[#3a3a3a] rounded-sm px-3 py-[6px] hover:bg-[#303030]">
					<Icon name="mdi:plus" color="#000000" size="22" />
					<span class="px-2 font-medium text-[15px]">Upload</span>
				</button>

				<div v-if="!$authStore.isAuth" class="flex items-center">
					<button
						@click="$generalStore.isLoginOpen = true"
						class="flex items-center bg-[#F02C56] text-white rounded-sm px-3 py-[6px]">
						<span class="mx-4 font-medium text-[15px]">Log in</span>
					</button>
					<Icon name="mdi:dots-vertical" color="#161724" size="25" />
				</div>

				<div v-else class="flex items-center">
					<Icon class="ml-1 mr-4" name="carbon:send-alt" color="#161724" size="30" />
					<Icon class="mr-5" name="bx:message-detail" color="#161724" size="27" />
					<div class="relative">
						<button class="mt-1" @click="showMenu = !showMenu">
							<NuxtImg
								format="webp"
								class="rounded-full"
								width="33"
								:src="$authStore.user?.avatar" />
						</button>

						<div
							v-if="showMenu"
							id="PopupMenu"
							class="absolute bg-[#3a3a3a] rounded-lg py-1.5 w-[200px] shadow-xl top-[43px] -right-2">
							<NuxtLink
								:to="`/profile/${$authStore.user?.id}`"
								@click="showMenu = false"
								class="flex items-center justify-start py-3 px-2 hover:bg-[#303030] cursor-pointer">
								<Icon name="ph:user" size="20" />
								<span class="pl-2 font-semibold text-sm">Profile</span>
							</NuxtLink>
							<div
								@click="$authStore.logout()"
								class="flex items-center justify-start py-3 px-1.5 hover:bg-[#303030] border-t cursor-pointer">
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
<style scoped>
#TopNav {
	border-bottom: 1px solid #ebebeb6c;
}
</style>
