<script setup lang="ts">
const { $generalStore, $authStore, $videosStore } = useNuxtApp()
const { user } = useUserSession()

if (user.value) {
	const profile = await $authStore.getProfileById(user.value.id)
	$authStore.profile = profile
}

onMounted(async () => {
	const { handleStatus, fetchChats } = useChat()
	await fetchChats()
	await handleStatus("online")

	const handleVisibilityChange = async () => {
		if (document.visibilityState === "visible") {
			await handleStatus("online")
			console.log("1")
		} else {
			await handleStatus("offline")
			console.log("2")
		}
	}

	document.addEventListener("visibilitychange", handleVisibilityChange)

	onBeforeUnmount(() => {
		document.removeEventListener("visibilitychange", handleVisibilityChange)
	})
})
await $videosStore.getVideos()
</script>
<template>
	<NuxtLoadingIndicator color="#F02C56" />
	<NuxtPage />

	<AuthOverlay />

	<EditProfileOverlay v-if="$generalStore.isEditProfileOpen" />
</template>

<style>
body {
	@apply bg-[#121212];
	@apply text-[#ffffff];
}

::-webkit-scrollbar {
	width: 12px;
	background-color: #333;
}

::-webkit-scrollbar-thumb {
	background-color: #555;
	border-radius: 10px;
	border: 2px solid #333;
}

::-webkit-scrollbar-track {
	background-color: #333;
}

::-webkit-scrollbar-thumb:hover {
	background-color: #777;
}

.modal-fadeenter-active,
.modal-fade-leave-active {
	transition: opacity 0.5s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
	opacity: 0;
}
</style>
