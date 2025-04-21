<template>
  <div class="p-8 text-black dark:text-white rounded-lg text-center">
    <h1 class="text-2xl font-bold mb-6">{{ $t("emailConfirmation.title") }}</h1>
    <p class="text-gray-600 mb-8">{{ $t("emailConfirmation.descr") }}</p>

    <div class="flex justify-center space-x-4 mb-8">
      <input
        v-for="(digit, index) in digits"
        :key="index"
        ref="inputs"
        v-model="digits[index]"
        @input="handleInput(index, $event)"
        @keydown.delete="handleBackspace(index, $event)"
        @paste="handlePaste($event)"
        type="text"
        maxlength="1"
        inputmode="numeric"
        pattern="[0-9]*"
        class="w-16 h-16 text-3xl text-center bg-gray-100 dark:bg-[#222222] text-gray-900 dark:text-white rounded-lg focus:border-blue-500 focus:outline-none"
        :class="{ 'border-blue-500': activeIndex === index }"
        @focus="activeIndex = index"
      />
    </div>

    <button
      @click="submitCode"
      class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
      :disabled="!isCodeComplete || $authStore.isLoading"
    >
      <IconsLoader v-if="$authStore.isLoading" class="w-7 h-7 animate-spin" />
      <span v-else>{{ $t("emailConfirmation.confirm") }}</span>
    </button>
    <button
      @click="resendCode"
      class="w-full py-3 bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg transition duration-200 flex items-center justify-center mb-3 disabled:opacity-60 disabled:cursor-not-allowed"
      :disabled="isResendDisabled"
    >
      <IconsLoader v-if="$authStore.isLoading" class="w-7 h-7 animate-spin" />
      <span v-else>
        {{
          cooldown > 0
            ? $t("emailConfirmation.resendCountdown", { seconds: cooldown })
            : $t("emailConfirmation.resend")
        }}
      </span>
    </button>
    <span class="text-[14px] text-red-600 text-center" v-if="$authStore.errors.other">
      {{ $authStore.errors.other }}
    </span>
  </div>
</template>

<script setup lang="ts">
const digits = ref(["", "", "", ""]);
const inputs = ref<HTMLInputElement[]>([]);
const activeIndex = ref(0);

const cooldown = ref(0);

const { fetch } = useUserSession();
const { $authStore, $generalStore } = useNuxtApp();

const isResendDisabled = computed(() => {
  return $authStore.isLoading || cooldown.value > 0;
});

const isCodeComplete = computed(() => {
  return digits.value.every((digit) => digit !== "");
});

const startCooldown = () => {
  cooldown.value = 60;
  const timer = setInterval(() => {
    cooldown.value--;
    if (cooldown.value <= 0) {
      clearInterval(timer);
    }
  }, 1000);
};

onMounted(() => {
  startCooldown();
});

const handleInput = (index: number, event: any) => {
  const value = event.target?.value;

  if (!/^\d*$/.test(value)) {
    digits.value[index] = "";
    return;
  }

  digits.value[index] = value;

  if (value && index < 3) {
    activeIndex.value = index + 1;
    nextTick(() => {
      inputs.value[activeIndex.value].focus();
    });
  }
};

const handleBackspace = (index: number, event: any) => {
  if (!digits.value[index] && index > 0) {
    activeIndex.value = index - 1;
    nextTick(() => {
      inputs.value[activeIndex.value].focus();
    });
  }
};

const handlePaste = (event: any) => {
  event.preventDefault();
  const pasteData = event.clipboardData.getData("text/plain").trim();

  if (/^\d{4}$/.test(pasteData)) {
    digits.value = pasteData.split("").slice(0, 4);
    activeIndex.value = 3;
    nextTick(() => {
      inputs.value[activeIndex.value].focus();
    });
  }
};

const submitCode = async () => {
  if (isCodeComplete.value) {
    const code = digits.value.join("");
    try {
      $authStore.clearErrors();
      $authStore.isLoading = true;
      await $fetch("/api/auth/verify", {
        method: "POST",
        body: {
          email: $authStore.confirmationCredentials?.email,
          name: $authStore.confirmationCredentials?.name,
          password: $authStore.confirmationCredentials?.password,
          code,
        },
      });
      window.location.reload();
      $authStore.confirmationCredentials = null;
      $generalStore.isLoginOpen = false;
    } catch (error: any) {
      const errorMessage =
        error.data?.message || error.statusMessage || error.message || "Something went wrong";
      $authStore.errors.other = errorMessage;
    } finally {
      $authStore.isLoading = false;
    }
  }
};

const resendCode = async () => {
  if (cooldown.value > 0) return;
  try {
    $authStore.clearErrors();
    $authStore.isLoading = true;
    await $fetch("/api/auth/verify/resend", {
      method: "POST",
      body: {
        email: $authStore.confirmationCredentials?.email,
      },
    });
    startCooldown();
  } catch (error: any) {
    console.error(error);
    const errorMessage =
      error.data?.message || error.statusMessage || error.message || "Something went wrong";
    $authStore.errors.other = errorMessage;
  } finally {
    $authStore.isLoading = false;
  }
};
</script>
