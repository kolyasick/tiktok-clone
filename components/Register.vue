<script setup lang="ts">
const { $authStore } = useNuxtApp();

const name = ref("");
const email = ref("");
const password = ref("");

const emit = defineEmits(["closeModal"]);

const register = async () => {
  console.log('123')
  const { handleStatus } = useChat();

  await $authStore.register(name.value, email.value, password.value);
  if ($authStore.profile) {
    await handleStatus("online", $authStore.profile.id);
  }
};
</script>

<template>
  <div>
    <div class="text-center text-[28px] mb-4 font-bold text-black dark:text-white">
      {{ $t("register") }}
    </div>
    <div class="px-6 pb-2">
      <TextInput
        :placeholder="$t('userName')"
        @update:input="$authStore.errors.name = ''"
        v-model:input="name"
        inputType="text"
        :error="$authStore.errors ? $authStore.errors.name : ''"
      />
    </div>

    <div class="px-6 pb-2">
      <TextInput
        :placeholder="$t('email')"
        @update:input="$authStore.errors.email = ''"
        v-model:input="email"
        inputType="email"
        :error="$authStore.errors ? $authStore.errors.email : ''"
      />
    </div>

    <div class="px-6 pb-2">
      <TextInput
        :placeholder="$t('password')"
        @update:input="$authStore.errors.password = ''"
        v-model:input="password"
        inputType="password"
        :error="$authStore.errors ? $authStore.errors.password : ''"
      />
    </div>

    <div class="px-6 pb-2 mt-6">
      <button
        :disabled="!name || !email || !password || $authStore.isLoading"
        :class="!name || !email || !password ? 'bg-gray-200' : 'bg-[#F02C56]'"
        @click="register"
        class="w-full text-[17px] font-semibold text-white bg-[#F02C56] hover:bg-[#b02140] py-3 rounded-md disabled:bg-gray-400"
      >
        {{ $authStore.isLoading ? $t("loading") : $t("register") }}
      </button>
    </div>
    <span class="px-6 text-[14px] text-red-500" v-if="$authStore.errors.other">
      {{ $authStore.errors.other }}
    </span>
    <span class="px-6 text-[14px] text-orange-500" v-if="$authStore.message">
      {{ $authStore.message }}
    </span>
  </div>
</template>
