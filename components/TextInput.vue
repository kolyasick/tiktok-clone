<template>
  <div>
    <input
      :id="`input-${placeholder}`"
      :placeholder="placeholder"
      class="block w-full bg-gray-100 dark:bg-[#222222] text-gray-900 dark:text-white rounded-md py-2.5 px-3 focus:outline-none"
      :type="inputType"
      v-model="inputComputed"
      autocomplete="off"
      :maxlength="max"
    />
    <span v-if="error" class="text-red-500 text-[14px] font-semibold">
      {{ error }}
    </span>
  </div>
</template>

<script setup>
const emit = defineEmits(["update:input"]);

const props = defineProps(["input", "placeholder", "inputType", "max", "autoFocus", "error"]);
const { input, placeholder, inputType, max, autoFocus, error } = toRefs(props);

onMounted(() => {
  if (autoFocus.value) {
    document.getElementById(`input-${placeholder.value}`).focus();
  }
});

const inputComputed = computed({
  get: () => input.value,
  set: (val) => emit("update:input", val),
});
</script>
