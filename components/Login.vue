<script setup>
const { $authStore } = useNuxtApp();
const { addNotification } = useNotification();
const { t } = useI18n();
const name = ref(null);
const password = ref(null);

const emit = defineEmits(["closeModal"]);

const login = async () => {
  const { handleStatus } = useChat();
  await $authStore.login(name.value, password.value);

  if ($authStore.profile) {
    emit("closeModal");
    addNotification({
      message: t("authMessages.login"),
      duration: 2000,
      type: "success",
    });

    await handleStatus("online", $authStore.profile);
  }
};
</script>
<template>
  <div>
    <div class="text-center text-[28px] mb-4 font-bold text-black dark:text-white">
      {{ $t("login") }}
    </div>
    <div class="px-6 pb-2">
      <TextInput
        :placeholder="$t('userName')"
        @input="$authStore.errors.name = ''"
        v-model:input="name"
        inputType="text"
        :error="$authStore.errors.name ? $authStore.errors.name : ''"
      />
    </div>

    <div class="px-6 pb-2">
      <TextInput
        :placeholder="$t('password')"
        @input="$authStore.errors.password = ''"
        v-model:input="password"
        inputType="password"
        :error="$authStore.errors.password ? $authStore.errors.password : ''"
      />
    </div>

    <div class="px-6 pb-2 mt-6">
      <button
        :disabled="!name || !password || $authStore.isLoading"
        :class="!name || !password ? 'bg-gray-200' : 'bg-[#F02C56]'"
        @click="login"
        class="w-full text-[17px] transition font-semibold text-white py-3 rounded-md disabled:bg-gray-400 hover:bg-[#b02140]"
      >
        {{ $authStore.isLoading ? $t("loading") : $t("login") }}
      </button>
    </div>
    <span class="px-6 text-[14px] text-red-600" v-if="$authStore.errors.other">
      {{ $authStore.errors.other }}
    </span>
    <span class="px-6 text-[14px] text-orange-500" v-if="$authStore.message">
      {{ $authStore.message }}
    </span>
  </div>
</template>
