<script setup lang="ts">
const { $authStore } = useNuxtApp()
const { handleFileInput, files: video } = useFileStorage()

definePageMeta({
	layout: "upload-layout",
})

interface IErrors {
	video: string | null
	caption: string | null
}
const errors =
	(reactive({
		video: null,
		caption: null,
	}) as IErrors) || null

const caption = ref<string | null>(null)
const fileDisplay = ref<string | null>(null)
const succes = ref<string | null>(null)
const fileName = ref<string>("")
const fileToUpload = ref<File | null>(null)
const loading = ref<boolean>(false)

const createVideo = async () => {
	errors.video = null
	errors.caption = null
	succes.value = null

	if (!caption.value) {
		errors.caption = "Please add a caption"
		return
	}

	if (!video.value) {
		errors.video = "Please upload a video"
		return
	}

	try {
		loading.value = true

		const res = await $fetch("/api/video/add", {
			method: "POST",
			body: {
				title: caption.value,
				file: video.value[0],
				userId: $authStore.profile?.id,
			},
		})
		discard()
		if (res.id) {
			succes.value = "Video uploaded successfully"
		}
	} catch (error) {
		console.log(error)
	} finally {
		loading.value = false
	}
}

const discard = () => {
	video.value = []
	caption.value = ""
	fileName.value = ""
}

const clearVideo = () => {
	fileDisplay.value = null
	fileToUpload.value = null
}
</script>
<template>
	<div
		v-if="loading"
		class="fixed flex items-center justify-center top-0 left-0 w-full h-screen bg-black z-50 bg-opacity-50">
		<Icon class="animate-spin ml-1" name="mingcute:loading-line" size="100" color="#FFFFFF" />
	</div>

	<NuxtLayout>
		<div
			class="w-full mt-[80px] mb-[40px] bg-[#222222] shadow-lg rounded-md py-6 md:px-10 px-4">
			<div>
				<div class="text-[23px] font-semibold">Upload video</div>
				<div class="text-gray-400 mt-1">Post a video to your account</div>
			</div>

			<div class="mt-8 md:flex gap-6">
				<label
					v-if="!video[0]"
					for="fileInput"
					class="md:mx-0 mx-auto mt-4 mb-6 flex flex-col items-center justify-center w-full max-w-[260px] transition h-[470px] text-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-[#161616] cursor-pointer">
					<Icon name="majesticons:cloud-upload" size="40" color="#b3b3b1" />
					<div class="mt-4 text-[17px]">Select video to upload</div>
					<div class="mt-1.5 text-gray-500 text-[13px]">Or drag and drop a file</div>
					<div class="mt-12 text-gray-400 text-sm">MP4</div>
					<div class="mt-2 text-gray-400 text-[13px]">Up to 1 minute</div>
					<div class="mt-2 text-gray-400 text-[13px]">Less than 50 MB</div>
					<div
						class="px-2 py-1.5 mt-8 text-white text-[15px] w-[80%] bg-[#F02C56] rounded-sm">
						Select file
					</div>
					<input
						ref="file"
						type="file"
						id="fileInput"
						@input="(e) => handleFileInput(e)"
						hidden
						accept=".mp4" />
				</label>

				<div
					v-else
					class="md:mx-0 mx-auto mt-4 md:mb-12 mb-16 flex items-center justify-center w-full max-w-[260px] h-[540px] p-3 rounded-2xl cursor-pointer relative">
					<div class="bg-black h-full w-full" />
					<NuxtImg class="absolute z-20 pointer-events-none" src="/mobile-case.png" />
					<NuxtImg
						format="webp"
						class="absolute right-4 bottom-6 z-20"
						width="90"
						src="/tiktok-logo-white.png" />
					<video
						autoplay
						loop
						muted
						class="absolute rounded-xl object-cover z-10 p-[13px] w-full h-full"
						:src="video[0].content" />

					<div
						class="absolute -bottom-12 flex items-center justify-between z-50 rounded-xl border w-full p-2 border-gray-300">
						<div class="flex items-center truncate">
							<Icon
								name="clarity:success-standard-line"
								size="16"
								class="min-w-[16px]" />
							<div class="text-[11px] pl-1 truncate text-ellipsis">
								{{ fileName }}
							</div>
						</div>
						<button @click="clearVideo" class="text-[11px] ml-2 font-semibold">
							Change
						</button>
					</div>
				</div>

				<div class="mt-4 mb-6">
					<div class="flex bg-bg-[#222222] py-4 px-6">
						<div>
							<Icon class="mr-4" size="20" name="mdi:box-cutter-off" />
						</div>
						<div>
							<div class="text-semibold text-[15px] mb-1.5">
								Divide videos and edit
							</div>
							<div class="text-semibold text-[13px] text-gray-400">
								You can quickly divide videos into multiple parts, remove redundant
								parts and turn landscape videos into portrait videos
							</div>
						</div>
					</div>

					<div class="mt-5">
						<div class="flex items-center justify-between">
							<div class="mb-1 text-[15px]">Title</div>
							<div class="text-gray-400 text-[12px]">
								{{ caption ? caption.length : 0 }}/150
							</div>
						</div>
						<input
							v-model="caption"
							@input="errors.caption = null"
							maxlength="150"
							type="text"
							class="w-full border p-2.5 rounded-md focus:outline-none bg-[#222222]" />
					</div>

					<div class="flex gap-3">
						<button
							@click="discard()"
							class="px-10 py-2.5 mt-8 transition bg-[#525252] text-[16px] hover:bg-[#707070] rounded-md">
							Discard
						</button>
						<button
							@click="createVideo()"
							class="px-10 py-2.5 mt-8 transition text-[16px] text-white bg-[#F02C56] hover:bg-[#ff1548] rounded-md">
							Post
						</button>
					</div>

					<div v-if="errors" class="mt-4">
						<div class="text-red-600" v-if="errors && errors.video">
							{{ errors.video }}
						</div>
						<div class="text-red-600" v-if="errors && errors.caption">
							{{ errors.caption }}
						</div>
					</div>
					<div v-if="succes" class="mt-4">
						<div class="text-green-600">
							{{ succes }}
						</div>
					</div>
					<div v-if="loading" class="mt-4">
						<div>loading...</div>
					</div>
				</div>
			</div>
		</div>
		<div></div>
	</NuxtLayout>
</template>
