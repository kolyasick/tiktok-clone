<script setup lang="ts">
const { $adminStore } = useNuxtApp();
const { selectedVideo } = $adminStore;

const isBlockModalVisible = ref<boolean>(false);
const blockReason = ref<string | null>(null);

const openBlockModal = () => {
  isBlockModalVisible.value = true;
};

const closeBlockModal = () => {
  isBlockModalVisible.value = false;
  blockReason.value = "";
};

const changeStatus = async (status: string) => {
  $adminStore.changeStatus(status, selectedVideo!.id, blockReason.value);
  const video = await $fetch("/api/admin/video/status", {
    method: "PATCH",
    body: {
      videoId: selectedVideo?.id,
      status,
      reason: blockReason.value,
    },
  });

  if (video) {
    $adminStore.isEditModalVisible = false;
  }
};

const deleteVideo = async () => {
  $adminStore.changeStatus("deleted", selectedVideo!.id, null);
  const video = await $fetch(`/api/admin/video/${$adminStore.selectedVideo?.id}`, {
    method: "DELETE",
  });

  if (video) {
    $adminStore.isEditModalVisible;
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" @click.self="$adminStore.isEditModalVisible = false">
    <div class="bg-[#1a1a1a] rounded-lg overflow-hidden w-[500px] max-w-full">
      <video :src="'/upload/videos/0DideL.mp4'" class="w-full h-[300px] object-cover" muted preload="metadata" controls></video>
      <div class="p-4">
        <h2 class="text-2xl font-bold mb-5">{{ selectedVideo?.title }}</h2>
        <div class="flex items-end justify-between text-sm text-gray-600">
          <div>
            <NuxtLink :to="`/profile/${selectedVideo?.profile?.name}`" class="flex items-center mb-3 gap-2 hover:underline">
              <img
                class="w-10 aspect-square object-cover rounded-full"
                :src="'/upload/avatars/' + $adminStore.selectedVideo?.profile?.avatar"
                alt=""
              />
              <span> {{ selectedVideo?.profile?.name }} </span>
            </NuxtLink>
            <span>Загружен: {{ formatDate(selectedVideo!.createdAt) }}</span>
          </div>
          <div class="flex justify-end mt-4 gap-1">
            <div class="relative group">
              <Icon
                @click="changeStatus('published')"
                size="30"
                class="text-green-500 cursor-pointer hover:-translate-y-1"
                name="material-symbols-light:check-circle-outline"
              />
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                Approve
              </div>
            </div>

            <div class="relative group">
              <Icon
                size="30"
                class="text-red-500 cursor-pointer hover:-translate-y-1"
                name="material-symbols-light:cancel-outline"
                @click="openBlockModal"
              />
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                Block
              </div>
            </div>

            <div class="relative group">
              <Icon
                @click="deleteVideo"
                size="30"
                class="text-red-500 cursor-pointer hover:-translate-y-1"
                name="material-symbols-light:delete-outline-rounded"
              />
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                Delete
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isBlockModalVisible" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-[#1a1a1a] rounded-lg p-6 w-[400px] max-w-full">
        <h3 class="text-xl font-bold mb-4">Укажите причину блокировки</h3>
        <textarea
          v-model="blockReason"
          class="w-full p-2 bg-[#2a2a2a] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Введите причину..."
          rows="4"
        ></textarea>
        <div class="flex justify-end gap-3 mt-4">
          <button @click="closeBlockModal" class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors">Отмена</button>
          <button
            @click="changeStatus('blocked')"
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
