<script setup lang="ts">
const { $adminStore } = useNuxtApp();

const isBlockModalVisible = ref(false);
const blockReason = ref<string | null>(null);
const until = ref();
const userId = ref<number | null>(null);

const toggleModal = (val: boolean, id?: number) => {
  isBlockModalVisible.value = val;
  userId.value = id || null;
};

const blockUser = () => {
  if (!userId.value || !blockReason.value) return;
  $adminStore.blockUser(userId.value, blockReason.value, until.value).then(() => {
    toggleModal(false);
  });
};
</script>

<template>
  <div id="last-users">
    <h1 class="font-bold py-4 uppercase">Last 24h users</h1>
    <div class="">
      <table class="w-full whitespace-nowrap">
        <thead class="dark:bg-black/60 bg-white shadow-md">
          <tr>
            <th class="text-left py-3 px-2 rounded-l-lg">Name</th>
            <th class="text-left py-3 px-2">Email</th>
            <th class="text-left py-3 px-2">Status</th>
            <th class="text-left py-3 px-2">Sign-up</th>
            <th class="text-left py-3 px-2 rounded-r-lg">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="profile in $adminStore.users" :key="profile.id" class="border-b border-gray-700">
            <td class="py-3 px-2 font-bold">
              <div class="inline-flex space-x-3 items-center">
                <span>
                  <img class="rounded-full w-8 h-8" :src="'/upload/avatars/' + profile.avatar" :alt="profile.name" />
                </span>
                <span>{{ profile.name }}</span>
              </div>
            </td>
            <td class="py-3 px-2">{{ profile.user.email }}</td>
            <td :class="{ 'text-red-500': profile.user.isBlocked }" class="py-3 px-2">
              {{ profile.user.isBlocked ? "BLOCKED" : profile.online ? "Online" : "Offline" }}
              <br />
              {{ profile.user.isBlocked ? "Until: " + formatDate(profile.user.block.until, false, true) : "" }}
            </td>
            <td class="py-3 px-2">{{ formatDate(profile.user.createdAt) }}</td>
            <td class="py-3 px-2">
              <button @click="toggleModal(true, profile.userId)" class="dark:hover:text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isBlockModalVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="dark:bg-[#1a1a1a] bg-white rounded-lg p-6 w-[400px] max-w-full">
        <h3 class="text-xl font-bold mb-4">Укажите причину блокировки</h3>
        <textarea
          v-model="blockReason"
          class="w-full p-2 dark:bg-[#2a2a2a] bg-gray-200 dark:text-white text-gray-800 rounded-lg focus:outline-none"
          placeholder="Введите причину..."
          rows="4"
        ></textarea>
        <label>Заблокировать до</label>
        <input
          v-model="until"
          type="date"
          class="w-full p-2 dark:bg-[#2a2a2a] bg-gray-200 dark:text-white text-gray-800 rounded-lg focus:outline-none"
        />
        <div class="flex justify-end gap-3 mt-4">
          <button
            @click="toggleModal(false)"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Отмена
          </button>
          <button
            @click="blockUser"
            :disabled="!blockReason"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Заблокировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
