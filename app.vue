<script setup lang="ts">
const { $generalStore } = useNuxtApp()

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
