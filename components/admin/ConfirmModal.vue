<script setup lang="ts">
const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["confirm", "cancel"]);

const onConfirm = () => {
  emit("confirm");
};

const onCancel = () => {
  emit("cancel");
};
</script>

<template>
  <Transition name="modal">
    <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="dark:bg-[#1a1a1a] bg-white rounded-lg p-6 w-[400px] max-w-full">
        <h3 class="text-xl font-bold mb-4">Confirmation</h3>
        <p class="mb-4">{{ message }}</p>
        <div class="flex justify-end gap-3">
          <button @click="onCancel" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
          <button @click="onConfirm" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
