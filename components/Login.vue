<template>
	<div class="text-center text-[28px] mb-4 font-bold">Log in</div>

	<div class="px-6 pb-1.5 text-[15px]">Email address</div>

	<div class="px-6 pb-2">
		<TextInput
			class="bg-[#222222]"
			placeholder="Email address"
			@input="$authStore.errors.email = ''"
			v-model:input="email"
			inputType="email"
			:autoFocus="true"
			:error="$authStore.errors.email ? $authStore.errors.email : ''" />
	</div>

	<div class="px-6 pb-2">
		<TextInput
			placeholder="Password"
			@input="$authStore.errors.password = ''"
			v-model:input="password"
			inputType="password"
			:error="$authStore.errors.password ? $authStore.errors.password : ''" />
	</div>

	<div class="px-6 pb-2 mt-6">
		<button
			:disabled="!email || !password || $authStore.isLoading"
			:class="!email || !password ? 'bg-gray-200' : 'bg-[#F02C56]'"
			@click="$authStore.login(email, password)"
			class="w-full text-[17px] transition font-semibold text-white py-3 rounded-sm disabled:bg-gray-400">
			{{ $authStore.isLoading ? "Loading..." : "Log in" }}
		</button>
	</div>
	<span class="px-6 text-[14px] text-red-600" v-if="$authStore.errors.other">
		{{ $authStore.errors.other }}
	</span>
</template>

<script setup>
const { $authStore } = useNuxtApp()

let email = ref(null)
let password = ref(null)
</script>
