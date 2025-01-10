<script setup lang="ts">
import type { IVideo } from "~/types/user.type"

const { $videosStore, $authStore } = useNuxtApp()

const route = useRoute()

let videoplay = ref<HTMLVideoElement | null>(null)
let videoContainer = ref<HTMLDivElement | null>(null)
let isModalVisible = ref<boolean>(false)
let volume = ref<number>(5)
let isMuted = ref<boolean>(true)
let isPlaying = ref<boolean>(false)
let isVideoLoading = ref<boolean>(true)
const nuxt = useNuxtApp()

const { data: video, error } = await useFetch<IVideo>(`/api/get-video/${route.params.id}`, {
	key: `video-${route.params.id}`,
	getCachedData: (key) => {
		const data = nuxt.payload.data[key] || nuxt.static.data[key]
		return data
	},
})
if (error.value) {
	throw createError({
		statusCode: error.value.statusCode,
		statusMessage: error.value.statusMessage,
	})
}
if (video.value) {
	video.value = {
		...video.value,
		liked: video.value?.likes?.some((like) => like.userId === $authStore.user?.id),
	}
}

useSeoMeta({
	title: `Podvodni-Tok · ${video.value?.user?.name}`,
	ogTitle: `Podvodni-Tok · ${video.value?.user?.name}`,
	description: `Podvodni-Tok · ${video.value?.title}`,
	ogDescription: `Podvodni-Tok · ${video.value?.title}`,
	ogImage:
		"https://gcqzkhtzxxchrzuvgfwx.supabase.co/storage/v1/object/public/uploads/avatars/1732128056099",
	ogImageHeight: 300,
	ogUrl: `https://podvodni-tok.com/video/${video.value?.id}`,
})

let playTimeout: NodeJS.Timeout | null = null

const toggleVideo = () => {
	if (!videoplay.value) return

	if (videoplay.value.paused) {
		videoplay.value
			.play()
			.then(() => {
				if (playTimeout) clearTimeout(playTimeout)
				playTimeout = setTimeout(() => {
					isPlaying.value = true
				}, 100)
			})
			.catch((err) => {
				console.error("Error playing video:", err)
			})
	} else {
		videoplay.value.pause()
		isPlaying.value = false
	}
}

const handleIntersection = (entries: IntersectionObserverEntry[]) => {
	entries.forEach((entry) => {
		if (!videoplay.value) return
		if (entry.isIntersecting) {
			videoplay.value.play()
		} else {
			videoplay.value.pause()
			videoplay.value.currentTime = 0
		}
	})
}

onMounted(async () => {
	if (videoplay.value) {
		const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

		if (isMobile) {
			videoplay.value.muted = true
		}

		videoplay.value.addEventListener("timeupdate", () => {
			isVideoLoading.value = false
		})

		videoplay.value.volume = isMobile ? 0 : volume.value / 100

		videoplay.value.addEventListener("play", () => {
			isPlaying.value = true
		})

		videoplay.value.addEventListener("pause", () => {
			isPlaying.value = false
		})

		const observer = new IntersectionObserver(handleIntersection, {
			root: null,
			threshold: 0.5,
		})
		if (!videoContainer.value) return
		observer.observe(videoContainer.value)
	} else {
		console.log("videoplay element is null")
	}
})

const toggleMute = () => {
	if (!videoplay.value) return
	isMuted.value = !isMuted.value
	videoplay.value.muted = isMuted.value
	videoplay.value.volume = isMuted.value ? 0 : volume.value / 100
}
</script>

<template>
	<TopNav />
	<div class="flex justify-center items-center min-h-screen bg-[#121212]">
		<div class="flex max-[1240px]:flex-col items-center gap-2 mt-12">
			<NuxtLink
				href="/"
				class="absolute flex cursor-pointer justify-self-start text-white left-0 top-14 z-20 m-5 rounded-full bg-[#3a3a3a] p-1.5 hover:bg-[#363533]">
				<Icon name="material-symbols:close" size="27" />
			</NuxtLink>

			<div class="video-container flex justify-center items-center max-[1240px]:mt-20">
				<div
					class="w-[calc(100%-20px)] max-[1240px]:w-[calc(100%-50px)] max-w-[890px] text-white"
					ref="scrollContainer">
					<div
						v-if="isVideoLoading"
						class="fixed flex items-center justify-center top-0 left-0 w-full h-screen bg-black z-50 bg-opacity-50">
						<Icon
							class="animate-spin ml-1"
							name="mingcute:loading-line"
							size="100"
							color="#FFFFFF" />
					</div>

					<div v-if="$videosStore.videos.length">
						<div
							v-if="video"
							:id="`PostMain-${video.id}`"
							ref="videoContainer"
							class="postmain">
							<div class="pl-3 px-6 max-[1240px]:p-0">
								<div
									class="video-wrapper relative w-[600px] max-[1240px]:w-full h-[calc(100vh-111px)] flex items-center bg-black rounded-xl cursor-pointer">
									<!-- Учтем высоту навбара (61px) и добавим отступ -->
									<div
										v-if="false"
										class="loader absolute inset-0 flex items-center justify-center text-white">
										<Icon name="mdi:loading" size="80" class="animate-spin" />
									</div>

									<video
										@click="toggleVideo()"
										ref="videoplay"
										preload="auto"
										loop
										muted
										playsinline
										class="rounded-xl object-cover mx-auto h-full w-full relative"
										:src="video.url ? video.url : ''"></video>

									<div class="text-center absolute top-4 right-4">
										<button
											class="rounded-full flex items-center bg-[#3a3a3a] p-2 cursor-pointer"
											@click="toggleMute">
											<Icon
												:name="
													isMuted ? 'mdi:volume-off' : 'mdi:volume-high'
												"
												size="25"
												color="[#EBEBEB]" />
										</button>
									</div>

									<div
										v-if="!isPlaying && !isVideoLoading"
										class="play-icon absolute inset-0 flex items-center justify-center text-white">
										<Icon name="mdi:play" size="80" />
									</div>
								</div>
							</div>
						</div>

						<transition name="modal">
							<div
								v-if="isModalVisible"
								class="text-black modal fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
								<div class="bg-white p-4 rounded shadow-lg">
									<p>Video link copied to clipboard!</p>
								</div>
							</div>
						</transition>
					</div>
					<div v-else>
						<div
							class="play-icon absolute inset-0 flex items-center justify-center text-white">
							<Icon name="mdi:play" size="80" />
						</div>
					</div>
				</div>
			</div>

			<VideoOverlay v-if="video" :video="video" />
		</div>
	</div>
</template>

<style scoped>
@media (max-width: 600px) {
	.video-wrapper {
		height: 70vh;
	}
}
@media (min-width: 1200px) {
	.video-wrapper {
		min-height: 700px;
	}
}

.modal-enter-active,
.modal-leave-active {
	transition: opacity 0.5s;
}
.modal-enter,
.modal-leave-to {
	opacity: 0;
}

.modal {
	z-index: 1000;
}

.video-layout {
	position: relative;
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	background: #121212;
}

.loader {
	z-index: 10;
}

.play-icon,
.pause-icon {
	pointer-events: none;
}

.loader {
	background: rgba(0, 0, 0, 0.5);
}
</style>
