<script setup lang="ts">
import type { IProfile } from "~/types/user.type";

const { $generalStore, $authStore } = useNuxtApp();
const { handleFileInput, files: avatar } = useFileStorage();
const router = useRouter();

const userName = ref<string>($authStore.profile!.name);
const bio = ref<string>($authStore.profile!.bio);
const isUpdated = ref<boolean>(false);

const nameError = ref<string | null>(null);
const bioError = ref<string | null>(null);
const serverError = ref<string | null>(null);

const loading = ref<boolean>(false);

const switchModal = (val: boolean) => {
  $generalStore.bodySwitch(val);
  $generalStore.isEditProfileOpen = val;
};

const validateInputs = () => {
  if (userName.value.length < 3 || userName.value.length > 10) {
    nameError.value = "Name must be 3-10 characters";
    return false;
  } else {
    nameError.value = null;
  }

  if (bio.value.length < 3 || bio.value.length > 100) {
    bioError.value = "Bio must be 3-100 characters";
    return false;
  } else {
    bioError.value = null;
  }

  return true;
};

const updateUser = async () => {
  if (!$authStore.profile || !isUpdated.value || !validateInputs()) {
    return;
  }

  try {
    serverError.value = null;
    loading.value = true;

    const profile = await $fetch<IProfile>(`/api/profile/edit/${$authStore.profile?.id}`, {
      method: "PATCH",
      body: {
        name: userName.value !== $authStore.profile.name ? userName.value : undefined,
        avatar: avatar.value[0] ? avatar.value[0] : undefined,
        bio: bio.value ? bio.value : undefined,
      },
    });

    if (!profile) {
      serverError.value = "Failed to update user";
      return;
    }

    await router.replace(`/profile/${profile.name}`);
    $authStore.$patch({ profile: { avatar: profile.avatar, bio: profile.bio, name: profile.name } });

    switchModal(false);
  } catch (error: any) {
    serverError.value = error.statusMessage ?? "Failed to update user";
  } finally {
    loading.value = false;
  }
};

watch(
  () => [userName.value, avatar.value, bio.value],
  () => {
    const isAvatarUpdated = !!avatar.value.length;
    const isBioUpdated = !!bio.value && bio.value !== $authStore.profile?.bio;
    const isUserNameUpdated = !!userName.value && userName.value !== $authStore.profile?.name;

    isUpdated.value = isAvatarUpdated || isUserNameUpdated || isBioUpdated;
  },
  { deep: true }
);
</script>

<template>
  <div v-if="$generalStore.isEditProfileOpen" class="fixed z-40 top-0 left-0 w-full h-full bg-black bg-opacity-50" @click="switchModal(false)"></div>

  <Transition name="edit-modal">
    <div
      v-if="$generalStore.isEditProfileOpen"
      class="fixed z-50 bg-[#121212] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-1rem*2)] max-w-[500px] pb-14 rounded-lg px-4"
    >
      <div class="flex items-center justify-between p-4 border-b border-[#ebebeb6c]">
        <div class="text-xl font-medium">Edit profile</div>
        <button @click="switchModal(false)">
          <IconsClose class="w-7 h-7" />
        </button>
      </div>
      <div class="p-4">
        <div class="flex flex-col items-center mb-6">
          <label for="image" class="relative cursor-pointer">
            <img
              class="rounded-full w-24 h-24 object-cover"
              :src="avatar[0]?.content ? (avatar[0]?.content) as string : '/upload/avatars/' + $authStore.profile?.avatar"
            />
            <div class="flex items-center justify-center absolute bottom-0 right-0 rounded-full bg-white shadow-xl w-8 h-8">
              <IconsPencil class="text-[#121212] w-5 h-5" />
            </div>
          </label>
          <input class="hidden" type="file" id="image" @input="(e) => handleFileInput(e)" accept="image/png, image/jpeg, image/jpg" />
        </div>

        <div class="mb-6">
          <div class="font-semibold text-sm text-gray-500 mb-2">Username</div>
          <TextInput placeholder="Username" v-model:input="userName" inputType="text" max="30" class="w-full" />
          <span v-if="nameError" class="text-red-500 text-sm block mt-1">
            {{ nameError }}
          </span>
          <div class="text-xs text-gray-500 mt-2">Changing your username will also change your profile link.</div>
          <div class="flex items-end gap-2 my-2">
            <div class="font-semibold text-sm text-gray-500">Bio</div>
            <div class="text-gray-400 text-[12px]">{{ bio ? bio.length : 0 }}/100</div>
          </div>

          <textarea
            autocomplete="off"
            placeholder="Bio"
            maxlength="100"
            v-model="bio"
            class="w-full block bg-[#222222] text-white rounded-md py-2.5 px-3 focus:outline-none"
          ></textarea>
          <span v-if="bioError" class="text-red-500 text-sm block mt-1">
            {{ bioError }}
          </span>
        </div>

        <span v-if="serverError" class="text-red-500 text-sm block text-center my-4">
          {{ serverError }}
        </span>
      </div>

      <div class="p-4 border-t border-[#ebebeb6c] absolute bottom-0 right-0 w-full">
        <div class="flex justify-end gap-3">
          <button @click="switchModal(false)" class="px-4 py-2 bg-[#3a3a3a] rounded-md hover:-translate-y-1 hover:shadow-2xl transition">
            Cancel
          </button>
          <button
            :disabled="!isUpdated"
            @click="updateUser()"
            :class="!isUpdated ? 'bg-gray-200' : 'bg-[#F02C56] '"
            class="flex items-center hover:-translate-y-1 hover:shadow-2xl bg-[#F02C56] rounded-md px-5 py-[6px] disabled:text-[#121212] disabled:pointer-events-none text-white"
          >
            <span class="font-medium text-[15px]">Save</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <IconsLoader class="animate-spin w-20 h-20" />
  </div>
</template>

<style scoped>
.edit-modal-enter-active,
.edit-modal-leave-active {
  transition: opacity 0.2s ease, margin 0.2s ease;
}

.edit-modal-enter-from,
.edit-modal-leave-to {
  opacity: 0;
  margin: 0px 40px;
}
</style>
