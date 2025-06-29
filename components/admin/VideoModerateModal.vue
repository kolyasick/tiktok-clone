<script setup lang="ts">
const { $adminStore } = useNuxtApp();
const { selectedVideo } = $adminStore;
const { locale } = useI18n();
const isBlockModalVisible = ref<boolean>(false);
const blockReason = ref<string | null>(null);
const isConfirmModalVisible = ref<boolean>(false);
const confirmMessage = ref<string>("");
const actionToConfirm = ref<() => Promise<void>>(() => Promise.resolve());

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
    if (status === "blocked") {
      // @ts-ignore
      $adminStore.blockedVideos.push(selectedVideo?.id);
    }
  }
};

const deleteVideo = async () => {
  confirmMessage.value =
    locale.value === "en" ? "Are you sure you want to delete this video?" : "Вы уверены, что хотите удалить это видео?";
  actionToConfirm.value = async () => {
    $adminStore.changeStatus("deleted", selectedVideo!.id, null);
    const video = await $fetch(`/api/admin/video/${$adminStore.selectedVideo?.id}`, {
      method: "DELETE",
    });

    if (video) {
      $adminStore.isEditModalVisible = false;
    }
  };
  isConfirmModalVisible.value = true;
};

const deleteComment = async (commentId: number) => {
  confirmMessage.value =
    locale.value === "en"
      ? "Are you sure you want to delete this comment?"
      : "Вы уверены, что хотите удалить этот комментарий?";
  actionToConfirm.value = async () => {
    await $adminStore.deleteComment(commentId);
  };
  isConfirmModalVisible.value = true;
};

const handleConfirm = async () => {
  await actionToConfirm.value();
  isConfirmModalVisible.value = false;
};

const handleCancel = () => {
  isConfirmModalVisible.value = false;
};
</script>

<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    @click.self="$adminStore.isEditModalVisible = false"
  >
    <div class="dark:bg-[#1a1a1a] bg-white rounded-lg overflow-hidden w-full max-w-[500px] mx-2 sm:mx-0">
      <video
        :src="'/upload/videos/' + selectedVideo?.url"
        class="w-full max-h-[40vh] object-cover"
        muted
        preload="metadata"
        controls
      ></video>
      <div class="p-2 sm:p-4">
        <h2 class="text-2xl font-bold mb-5 case">{{ $t("admin.comments") }}</h2>
        <ul v-if="selectedVideo?.comments?.length" class="mb-5 overflow-y-auto max-h-32 grid gap-3">
          <li
            class="border rounded-md p-1 border-[#3a3a3a]"
            v-for="comment in selectedVideo?.comments"
            :key="comment.id"
          >
            <div class="flex items-center gap-2 relative">
              <NuxtLink :to="'/profile/' + comment.profile?.name">
                <img
                  class="w-7 aspect-square object-cover rounded-full"
                  :src="'/upload/avatars/' + comment.profile?.avatar"
                  alt=""
                />
              </NuxtLink>
              <div>
                <p class="text-sm text-gray-600">{{ comment.profile?.name }}</p>
                <p class="text-sm">{{ comment.text }}</p>
              </div>
              <div class="absolute bottom-0 right-0 flex items-center gap-1">
                <p class="text-[12px] text-gray-600">{{ formatDate(comment.createdAt) }}</p>
                <IconsTrash @click="deleteComment(comment.id)" class="w-5 h-5 text-red-500 ml-auto cursor-pointer" />
              </div>
            </div>
          </li>
        </ul>
        <p v-else class="text-sm text-gray-600 text-center">{{ $t("admin.noComments") }}</p>
        <h2 class="text-2xl font-bold mb-5">{{ selectedVideo?.title }}</h2>
        <div class="flex items-end justify-between text-sm text-gray-600">
          <div>
            <NuxtLink
              :to="`/profile/${selectedVideo?.profile?.name}`"
              class="flex items-center mb-3 gap-2 hover:underline"
            >
              <img
                class="w-10 aspect-square object-cover rounded-full"
                :src="'/upload/avatars/' + $adminStore.selectedVideo?.profile?.avatar"
                alt=""
              />
              <span> {{ selectedVideo?.profile?.name }} </span>
            </NuxtLink>
            <span>{{ $t("admin.uploaded") }}: {{ formatDate(selectedVideo!.createdAt) }}</span>
            <span
              class="block mt-4"
              :class="[
                {
                  'text-green-400': selectedVideo?.status?.title === 'published',
                  'text-red-400': selectedVideo?.status?.title === 'blocked',
                },
                'font-semibold',
              ]"
              >{{ $t(`admin.status.${selectedVideo?.status?.title}`) }}</span
            >
          </div>
          <div class="flex justify-end items-center mt-4 gap-1">
            <div v-if="selectedVideo?.status?.title !== 'published'" class="relative group">
              <IconsCheck
                @click="changeStatus('published')"
                class="text-green-500 cursor-pointer hover:-translate-y-1 w-9 h-9"
              />
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {{ $t("admin.approve") }}
              </div>
            </div>

            <div class="relative group">
              <IconsClose
                class="text-red-500 cursor-pointer hover:-translate-y-1 w-7 h-7 border border-red-500 rounded-full"
                @click="openBlockModal"
              />
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {{ $t("admin.block") }}
              </div>
            </div>

            <div class="relative group">
              <IconsTrash @click="deleteVideo" class="text-red-500 cursor-pointer hover:-translate-y-1 w-9 h-9" />
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {{ $t("admin.delete") }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Transition name="block-modal">
      <div
        v-if="isBlockModalVisible"
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      >
        <div class="dark:bg-[#1a1a1a] bg-white rounded-lg p-6 w-[400px] max-w-full">
          <h3 class="text-xl font-bold mb-4">{{ $t("admin.blockModal.title") }}</h3>
          <textarea
            v-model="blockReason"
            class="w-full p-2 dark:bg-[#2a2a2a] bg-gray-200 dark:text-white text-gray-800 rounded-lg focus:outline-none"
            :placeholder="$t('admin.blockModal.descr')"
            rows="4"
          ></textarea>
          <div class="flex justify-end gap-3 mt-4">
            <button
              @click="closeBlockModal"
              class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
            <button
              @click="changeStatus('blocked')"
              :disabled="!blockReason"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              {{ $t("admin.block") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <AdminConfirmModal
      :isVisible="isConfirmModalVisible"
      :message="confirmMessage"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    />
  </div>
</template>

<style scoped>
.block-modal-enter-active,
.block-modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.block-modal-enter-from,
.block-modal-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
