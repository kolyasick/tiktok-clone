<script setup lang="ts">
const { $generalStore, $authStore } = useNuxtApp();

let isRegister = ref(true);

const switchForm = () => {
  isRegister.value = !isRegister.value;
  $authStore.clearErrors();
};

const closeModal = () => {
  $generalStore.bodySwitch(false);
  $generalStore.isLoginOpen = false;
  $authStore.clearErrors();
  $authStore.confirmationCredentials = null;
};
</script>

<template>
  <div
    v-if="$generalStore.isLoginOpen"
    id="AuthOverlay"
    @click="closeModal"
    class="fixed flex items-center justify-center z-40 top-0 left-0 w-full h-full bg-black bg-opacity-50"
  ></div>

  <Transition name="modal-fade">
    <div
      v-if="$generalStore.isLoginOpen"
      class="absolute z-50 bg-light dark:bg-dark top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[500px] w-[95%] h-[500px] mx-auto rounded-lg"
    >
      <div class="w-full flex justify-end">
        <button @click="closeModal" class="p-3 text-black dark:text-white">
          <IconsClose class="w-7 h-7" />
        </button>
      </div>

      <Transition name="form-switch" mode="out-in">
        <AuthLogin
          @close-modal="closeModal"
          v-if="isRegister && !$authStore.confirmationCredentials"
          key="login"
        />
        <AuthRegister
          @close-modal="closeModal"
          v-else-if="!$authStore.confirmationCredentials && !isRegister"
          key="register"
        />
        <AuthEmailActivation v-else />
      </Transition>

      <div
        v-if="!$authStore.confirmationCredentials"
        class="absolute flex items-center justify-center py-5 left-0 bottom-0 border-t border-gray-200 dark:border-neutral-800 w-full"
      >
        <span class="text-[14px] text-gray-500">{{
          isRegister ? $t("haveAcc") : $t("dHaveAcc")
        }}</span>
        <button @click="switchForm" class="text-[14px] text-[#F02C56] font-semibold pl-1">
          <span v-if="isRegister">{{ $t("register") }}</span>
          <span v-else>{{ $t("login") }}</span>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, margin 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  margin: 40px 0px;
}

.form-switch-enter-active,
.form-switch-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.form-switch-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.form-switch-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
