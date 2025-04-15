<script setup lang="ts">
const { $authStore } = useNuxtApp();
const { handleFileInput, files: video } = useFileStorage();

definePageMeta({
  layout: "upload-layout",
  middleware: "auth",
});

interface IErrors {
  video: string | null;
  caption: string | null;
}
const errors = reactive({
  video: null,
  caption: null,
}) as IErrors;

const caption = ref<string | null>(null);
const succes = ref<string | null>(null);
const fileName = ref<string>("");
const loading = ref<boolean>(false);
const uploadProgress = ref<number>(0);
let progressInterval: NodeJS.Timeout | null = null;

const createVideo = async () => {
  errors.video = null;
  errors.caption = null;
  succes.value = null;

  if (!caption.value) {
    errors.caption = "Please add a caption";
    return;
  }

  if (!video.value[0]) {
    errors.video = "Please upload a video";
    return;
  }

  try {
    loading.value = true;
    uploadProgress.value = 0;

    // Запускаем имитацию прогресса
    progressInterval = setInterval(() => {
      uploadProgress.value = Math.min(
        uploadProgress.value + Math.floor(Math.random() * 10) + 5,
        90
      );
    }, 500);

    const res = await $fetch("/api/video/add", {
      method: "POST",
      body: {
        title: caption.value,
        file: video.value[0],
        userId: $authStore.profile?.id,
      },
    });

    // Завершаем прогресс
    if (progressInterval) clearInterval(progressInterval);
    uploadProgress.value = 100;
    await new Promise((resolve) => setTimeout(resolve, 300)); // Даем анимации завершиться

    discard();
    if (res.id) {
      succes.value = "Video uploaded successfully";
    }
  } catch (error) {
    console.log(error);
    if (progressInterval) clearInterval(progressInterval);
    errors.video = "Error uploading video";
  } finally {
    loading.value = false;
    setTimeout(() => {
      uploadProgress.value = 0;
    }, 500);
  }
};

const discard = () => {
  video.value = [];
  caption.value = "";
  fileName.value = "";
};

let timeout: NodeJS.Timeout;

watch(errors, () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    errors.video = null;
    errors.caption = null;
  }, 500);
});

useSeoMeta({
  title: "Clipify | Upload video",
  ogTitle: "Clipify | Upload video",
  description: "Create and share videos with your friends on Clipify",
  ogDescription: "Create and share videos with your friends on Clipify",
  ogImage: "/clipify-logo.png",
  ogUrl: useRuntimeConfig().public.appUrl,
});
</script>

<template>
  <div
    v-if="loading"
    class="fixed flex flex-col items-center justify-center top-0 left-0 w-full h-screen bg-black z-50 bg-opacity-80"
  >
    <div
      class="bg-white dark:bg-[#222222] p-8 rounded-lg shadow-xl w-[90%] max-w-md"
    >
      <div class="flex flex-col items-center">
        <IconsLoader class="animate-spin w-16 h-16 text-[#F02C56]" />
        <h3 class="mt-4 text-lg font-medium dark:text-white">
          {{ $t("uploadLoadingTitle") }}
        </h3>
        <p class="mt-2 text-gray-500 dark:text-gray-400">
          {{ $t("uploadLoadingDescr") }}
        </p>

        <div class="w-full mt-6">
          <div
            class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1"
          >
            <span>{{ $t("progress") }}</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              class="bg-[#F02C56] h-2.5 rounded-full transition-all duration-300 ease-out"
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="w-full">
    <div
      class="my-5 dark:bg-neutral-800/30 bg-gray-100 shadow-lg rounded-md py-6 md:px-10 px-4"
    >
      <div>
        <div class="text-[23px] font-semibold">{{ $t("uploadTitle") }}</div>
        <div class="text-gray-400 mt-1">{{ $t("uploadDescr") }}</div>
      </div>

      <div class="mt-8 md:flex gap-6">
        <label
          v-if="!video[0]"
          for="fileInput"
          class="md:mx-0 mx-auto mt-4 mb-6 flex flex-col items-center justify-center w-full max-w-[260px] transition h-[470px] text-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-white dark:hover:bg-[#161616] cursor-pointer"
        >
          <IconsUpload class="w-12 h-12" />
          <div class="mt-4 text-[17px]">{{ $t("selectVideo") }}</div>
          <div class="mt-1.5 text-gray-500 text-[13px]">
            {{ $t("dragDrop") }}
          </div>
          <div class="mt-12 text-gray-400 text-sm">MP4</div>
          <div class="mt-2 text-gray-400 text-[13px]">{{ $t("upToMin") }}</div>
          <div class="mt-2 text-gray-400 text-[13px]">
            {{ $t("lessThanFifty") }}
          </div>
          <div
            class="px-2 py-1.5 mt-8 text-white text-[15px] w-[80%] bg-[#F02C56] rounded-md"
          >
            {{ $t("selectFile") }}
          </div>
          <input
            ref="file"
            type="file"
            id="fileInput"
            @input="(e) => handleFileInput(e)"
            hidden
            accept=".mp4"
          />
        </label>

        <div
          v-else
          class="md:mx-0 mx-auto mt-4 md:mb-12 mb-16 flex items-center justify-center w-full max-w-[260px] h-[540px] p-3 rounded-2xl cursor-pointer relative"
        >
          <img
            class="absolute z-20 pointer-events-none w-full h-full"
            src="/mobile-case.png"
          />
          <img
            class="absolute right-4 bottom-6 z-20"
            width="90"
            src="/tiktok-logo-white.png"
          />
          <video
            autoplay
            loop
            muted
            class="absolute rounded-xl object-cover z-10 p-[13px] w-full h-full"
            :src="video[0].content?.toString()"
          />

          <div
            class="absolute -bottom-12 flex items-center justify-between z-20 rounded-xl border w-full p-2 border-gray-300"
          >
            <div class="flex items-center truncate">
              <IconsCheck class="w-5 h-5" />
              <div class="text-[11px] pl-1 truncate text-ellipsis">
                {{ video[0].name }}
              </div>
            </div>
            <button @click="video = []" class="text-[11px] ml-2 font-semibold">
              {{ $t("change") }}
            </button>
          </div>
        </div>

        <div class="mt-4 mb-6">
          <div class="flex dark:bg-[#222222] bg-gray-200 py-4 px-6">
            <div>
              <IconsCutter class="w-5 h-5 mr-4" />
            </div>
            <div>
              <div class="text-semibold text-[15px] mb-1.5">
                {{ $t("divide") }}
              </div>
              <div class="text-semibold text-[13px] text-gray-400">
                {{ $t("divideDescr") }}
              </div>
            </div>
          </div>

          <div class="mt-5">
            <div class="flex items-center justify-between">
              <div class="mb-1 text-[15px]">{{ $t("title") }}</div>
              <div class="text-gray-400 text-[12px]">
                {{ caption ? caption.length : 0 }}/150
              </div>
            </div>
            <input
              v-model="caption"
              @input="errors.caption = null"
              maxlength="150"
              :placeholder="$t('addTitle')"
              type="text"
              class="w-full border border-gray-300 dark:border-neutral-700 p-2.5 rounded-md focus:outline-none bg-gray-200 dark:bg-[#222222]"
            />
          </div>

          <div class="flex gap-3">
            <button
              @click="discard()"
              class="px-10 py-2.5 mt-8 transition dark:bg-[#525252] bg-gray-300 text-[16px] dark:hover:bg-[#707070] hover:bg-gray-400 rounded-md"
            >
              {{ $t("cancel") }}
            </button>
            <button
              @click="createVideo()"
              class="px-10 py-2.5 mt-8 transition text-[16px] text-white bg-[#F02C56] hover:bg-[#ff1548] rounded-md"
            >
              {{ $t("post") }}
            </button>
          </div>

          <Transition name="bounce">
            <div v-if="errors.video || errors.caption" class="mt-4">
              <div class="text-red-600">
                {{ errors.video || errors.caption }}
              </div>
            </div>
          </Transition>
          <div v-if="succes" class="mt-4">
            <div class="text-green-600">
              {{ succes }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  50% {
    transform: translateX(10px);
  }
  75% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(0);
  }
}

.bounce-enter-active {
  animation: shake 0.5s;
}

.bounce-leave-active {
  transition: opacity 0.2s ease;
  opacity: 0;
}

.progress-bar {
  transition: width 0.3s ease-out;
}
</style>
