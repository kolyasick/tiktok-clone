<script setup lang="ts">
const { $authStore } = useNuxtApp();

const name = ref("");
const email = ref("");
const password = ref("");

const register = async () => {
  const { handleStatus } = useChat();

  await $authStore.register(name.value, email.value, password.value);
  if ($authStore.profile) {
    await handleStatus("online", $authStore.profile);
  }
};
</script>

<template>
  <div class="text-center text-[28px] mb-4 font-bold">Sign up</div>
  <div class="px-6 pb-2">
    <TextInput
      placeholder="Full name"
      @update:input="$authStore.errors.name = ''"
      v-model:input="name"
      inputType="text"
      :autoFocus="true"
      :error="$authStore.errors ? $authStore.errors.name : ''"
    />
  </div>

  <div class="px-6 pb-2">
    <TextInput
      placeholder="Email address"
      @update:input="$authStore.errors.email = ''"
      v-model:input="email"
      inputType="email"
      :error="$authStore.errors ? $authStore.errors.email : ''"
    />
  </div>

  <div class="px-6 pb-2">
    <TextInput
      placeholder="Password"
      @update:input="$authStore.errors.password = ''"
      v-model:input="password"
      inputType="password"
      :error="$authStore.errors ? $authStore.errors.password : ''"
    />
  </div>

  <div class="px-6 text-[12px] text-gray-500">Forgot password?</div>

  <div class="px-6 pb-2 mt-6">
    <button
      :disabled="!name || !email || !password || $authStore.isLoading"
      :class="!name || !email || !password ? 'bg-gray-200' : 'bg-[#F02C56]'"
      @click="register"
      class="w-full text-[17px] font-semibold text-white bg-[#F02C56] py-3 rounded-sm disabled:bg-gray-400"
    >
      {{ $authStore.isLoading ? "Loading..." : "Register" }}
    </button>
  </div>
  <span class="px-6 text-[14px] text-red-500" v-if="$authStore.errors.other">
    {{ $authStore.errors.other }}
  </span>
</template>
