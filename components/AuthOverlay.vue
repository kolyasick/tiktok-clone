<script setup>
const { $generalStore, $authStore } = useNuxtApp()
let isRegister = ref(true)

const switchForm = () => {
	isRegister.value = !isRegister.value
	$authStore.clearErrors()
}

</script>

<template>
	<div
		v-if="$generalStore.isLoginOpen"
		id="AuthOverlay"
		@click="$generalStore.isLoginOpen = false"
		class="fixed flex items-center justify-center z-40 top-0 left-0 w-full h-full bg-black bg-opacity-50"></div>

	<Transition name="modal-fade">
		<div
			v-if="$generalStore.isLoginOpen"
			class="absolute z-50 bg-[#222222] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[500px] w-full h-[500px] mx-auto rounded-lg">
			<div class="w-full flex justify-end">
				<button
					@click="$generalStore.isLoginOpen = false"
					class="p-1.5 rounded-full bg-[#222222]">
					<Icon name="mdi:close" size="26" />
				</button>
			</div>

			<Login v-if="isRegister" />
			<Register v-else />

			<div
				class="absolute flex items-center justify-center py-5 left-0 bottom-0 border-t w-full">
				<span class="text-[14px] text-gray-500">Don’t have an account?</span>
				<button @click="switchForm" class="text-[14px] text-[#F02C56] font-semibold pl-1">
					<span v-if="isRegister">Sign up</span>
					<span v-else>Log in</span>
				</button>
			</div>
		</div>
	</Transition>
</template>
<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
	transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
	opacity: 0;
}
</style>
