<script setup>
const router = useRouter();

onMounted(() => {
  setTimeout(() => {
    router.replace('/');
  }, 2000);
});
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500">
    <div class="bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
      <svg
        class="w-16 h-16 mx-auto text-green-500 animate-check"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
      <h1 class="mt-4 text-3xl font-bold text-gray-800">Email Successfully Activated!</h1>
      <p class="mt-2 text-gray-600">Your email has been verified. You can now log in to your account.</p>
      <p class="mt-4 text-sm text-gray-500">You will be redirected to the homepage shortly...</p>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}


@keyframes check {
  0% {
    stroke-dashoffset: 50;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-check path {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: check 0.5s ease-in-out forwards;
}
</style>