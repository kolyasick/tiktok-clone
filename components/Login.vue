<script setup>
const { $authStore } = useNuxtApp();

const email = ref(null);
const password = ref(null);

const login = async () => {
  const { handleStatus } = useChat();
  await $authStore.login(email.value, password.value);

  if ($authStore.profile) {
    await handleStatus("online", $authStore.profile);
  }
};
</script>
<template>
  <div>
    <div class="text-center text-[28px] mb-4 font-bold">Log in</div>
    <div class="px-6 pb-2">
      <TextInput
        placeholder="Email address"
        @input="$authStore.errors.email = ''"
        v-model:input="email"
        inputType="email"
        :autoFocus="true"
        :error="$authStore.errors.email ? $authStore.errors.email : ''"
      />
    </div>

    <div class="px-6 pb-2">
      <TextInput
        placeholder="Password"
        @input="$authStore.errors.password = ''"
        v-model:input="password"
        inputType="password"
        :error="$authStore.errors.password ? $authStore.errors.password : ''"
      />
    </div>

    <div class="px-6 pb-2 mt-6">
      <button
        :disabled="!email || !password || $authStore.isLoading"
        :class="!email || !password ? 'bg-gray-200' : 'bg-[#F02C56]'"
        @click="login"
        class="w-full text-[17px] transition font-semibold text-white py-3 rounded-md disabled:bg-gray-400"
      >
        {{ $authStore.isLoading ? "Loading..." : "Log in" }}
      </button>
    </div>
    <span class="px-6 text-[14px] text-red-600" v-if="$authStore.errors.other">
      {{ $authStore.errors.other }}
    </span>
  </div>
</template>
