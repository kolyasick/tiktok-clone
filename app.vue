<template>
	<NuxtLoadingIndicator color="#F02C56" />
	<NuxtPage />

	<AuthOverlay v-if="$generalStore.isLoginOpen" />
	<EditProfileOverlay v-if="$generalStore.isEditProfileOpen" />
</template>

<script setup lang="ts">
const { $generalStore, $authStore, $videosStore } = useNuxtApp()

$authStore.getUser()
$videosStore.getVideos()
</script>

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
</style>
