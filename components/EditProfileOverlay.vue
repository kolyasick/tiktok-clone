<script setup lang="ts">
import { Cropper, CircleStencil } from "vue-advanced-cropper"
import type { CropperResult } from "vue-advanced-cropper"
import "vue-advanced-cropper/dist/style.css"

const { $generalStore } = useNuxtApp()
const { user } = useUserSession()

const cropper = ref<CropperResult | null>(null)

const file = ref<File | null>(null)
const uploadedImage = ref<string | null>(null)
const userName = ref<string | null>(user.value?.name || null)
const isUpdated = ref<boolean>(false)

const errors = ref<string | null>(null)
const loading = ref<boolean>(false)

const getUploadedImage = (e: Event) => {
	const input = e.target as HTMLInputElement

	if (input.files && input.files.length > 0) {
		file.value = input.files[0]
		uploadedImage.value = URL.createObjectURL(file.value)
	}
}

const cropAndUpdateImage = async () => {
	if (!cropper.value) {
		errors.value = "Something went wrong"
		return
	}

	const result = (cropper.value as any).getResult()

	if (result && result.canvas) {
		result.canvas.toBlob(async (blob: Blob | null) => {
			if (blob) {
				errors.value = null
				loading.value = true

				// const path = await $generalStore.uploadFile(blob, "avatars/", errors.value)
				// await updateUser(path)

				loading.value = false
			} else {
				errors.value = "Something went wrong"
			}
		}, "image/png")
	} else {
		errors.value = "Something went wrong"
	}
}

const updateUser = async (path?: string) => {
	try {
		errors.value = null
		loading.value = true

		// const user = await $fetch<IUser>(`/api/update-user/${$authStore.user?.id}`, {
		// 	method: "POST",
		// 	body: {
		// 		name: userName.value,
		// 		avatar: path ? url : $authStore.user?.avatar,
		// 	},
		// })

		// if (!user) {
		// 	errors.value = "Failed to update user"
		// 	return
		// }

		// $authStore.set(true, user)
		// $generalStore.isEditProfileOpen = false
	} catch (error) {
		errors.value = "Failed to update user"
	} finally {
		loading.value = false
	}
}

watch(
	() => userName.value,
	() => {
		if (!userName.value || userName.value === user.value?.name) {
			isUpdated.value = false
		} else {
			isUpdated.value = true
		}
	}
)
</script>
<template>
	<div
		v-if="loading"
		class="fixed flex items-center justify-center top-0 left-0 w-full h-screen bg-black z-50 bg-opacity-50">
		<Icon class="animate-spin ml-1" name="mingcute:loading-line" size="100" color="#FFFFFF" />
	</div>
	<div
		id="EditProfileOverlay"
		class="fixed flex justify-center pt-14 md:pt-[105px] z-40 top-0 left-0 w-full h-full bg-black bg-opacity-50 overflow-auto">
		<div
			class="relative bg-[#121212] w-full max-w-[700px] sm:h-[580px] h-[655px] mx-3 p-4 rounded-lg mb-10"
			:class="!uploadedImage ? 'h-[655px]' : 'h-[580px]'">
			<div
				class="absolute flex items-center justify-between w-full p-5 left-0 top-0 border-b border-b-gray-300">
				<div class="text-[22px] font-medium">Edit profile</div>
				<button @click="$generalStore.isEditProfileOpen = false">
					<Icon name="mdi:close" size="25" />
				</button>
			</div>

			<div class="h-[calc(500px-200px)]" :class="!uploadedImage ? 'mt-16' : 'mt-[58px]'">
				<div v-if="!uploadedImage">
					<div
						id="ProfilePhotoSection"
						class="flex flex-col sm:h-[118px] h-[145px] px-1.5 py-2 w-full">
						<div
							class="font-semibold text-[15px] sm:mb-0 mb-1 text-gray-400 sm:w-[160px] sm:text-left text-center">
							Profile photo
						</div>

						<div class="flex items-center justify-center sm:-mt-6">
							<label for="image" class="relative cursor-pointer">
								<NuxtImg
									format="webp"
									class="rounded-full"
									width="95"
									:src="'/avatars/' + user?.avatar" />
								<div
									class="absolute bottom-0 right-0 rounded-full bg-white shadow-xl border p-1 border-gray-300 inline-block w-[32px]">
									<Icon
										name="ph:pencil-simple-line-bold"
										size="17"
										class="-mt-1 ml-0.5 text-[#121212]" />
								</div>
							</label>
							<input
								class="hidden"
								type="file"
								id="image"
								@input="getUploadedImage"
								accept="image/png, image/jpeg, image/jpg" />
						</div>
					</div>

					<div
						id="UsernameSectionSection"
						class="flex flex-col border-b sm:h-[130px] px-1.5 py-2 mt-1.5 w-full">
						<div
							class="font-semibold text-[15px] sm:mb-0 mb-1 text-gray-400 sm:w-[160px] sm:text-left text-center">
							Username
						</div>

						<div class="flex items-center justify-center sm:-mt-6">
							<div class="sm:w-[60%] w-full max-w-md">
								<TextInput
									placeholder="Username"
									v-model:input="userName"
									inputType="text"
									max="30" />
								<div class="text-[11px] text-gray-500 mt-4">
									Usernames can only contain letters, numbers, underscores, and
									periods. Changing your username will also change your profile
									link.
								</div>
							</div>
						</div>
					</div>
					<span
						v-if="errors"
						class="text-center flex items-center justify-center mt-4 text-red-500">
						{{ errors }}
					</span>
				</div>

				<div v-else class="w-full h-[430px]">
					<Cropper
						class="h-[430px]"
						ref="cropper"
						:stencil-component="CircleStencil"
						:src="uploadedImage" />
				</div>
			</div>

			<div
				id="ButtonSection"
				class="absolute p-5 left-0 bottom-0 border-t border-t-gray-300 w-full">
				<div
					id="UpdateInfoButtons"
					v-if="!uploadedImage"
					class="flex items-center justify-end">
					<button
						@click="$generalStore.isEditProfileOpen = false"
						class="flex items-center border rounded-sm px-3 py-[6px] hover:bg-[#303030]">
						<span class="px-2 font-medium text-[15px]">Cancel</span>
					</button>

					<button
						:disabled="!isUpdated"
						@click="updateUser()"
						:class="!isUpdated ? 'bg-gray-200' : 'bg-[#F02C56] '"
						class="flex items-center bg-[#F02C56] text-[#121212] rounded-md ml-3 px-3 py-[6px]">
						<span class="mx-4 font-medium text-[15px]">Save</span>
					</button>
				</div>

				<div id="CropperButtons" v-else class="flex items-center justify-end">
					<button
						@click="uploadedImage = null"
						class="flex items-center border rounded-sm px-3 py-[6px] hover:bg-[#303030]">
						<span class="px-2 font-medium text-[15px]">Cancel</span>
					</button>

					<button
						@click="cropAndUpdateImage()"
						class="flex items-center bg-[#F02C56] text-white border rounded-md ml-3 px-3 py-[6px]">
						<span class="mx-4 font-medium text-[15px]">Apply</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
