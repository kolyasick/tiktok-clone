<script setup lang="ts">
const emit = defineEmits(["send-message"])
const { $authStore, $generalStore } = useNuxtApp()

let text = ref<string>("")
let typingTimeout: NodeJS.Timeout
const typingUser = ref<string | null>(null)
const { $io: socket } = useNuxtApp()

const handleSend = () => {
	emit("send-message", text.value)
	socket.emit("stopTyping", $generalStore.currentChat?.id.toString())
	text.value = ""
}
const handleTyping = () => {
	const data = {
		name: $authStore.profile?.name,
		chatId: $generalStore.currentChat?.id.toString(),
	}

	socket.emit("typing", data)

	clearTimeout(typingTimeout)
	typingTimeout = setTimeout(() => {
		socket.emit("stopTyping", data.chatId)
	}, 1000)
}

const messagesContainer = ref<HTMLDivElement | null>(null)

watch(
	() => [$generalStore.currentChat?.messages, typingUser],
	async () => {
		await nextTick()
		if (messagesContainer.value) {
			messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
		}
	},
	{ deep: true }
)

onMounted(() => {
	if (messagesContainer.value) {
		messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
	}

	socket.on("typing", (name: string) => {
		typingUser.value = name
	})

	socket.on("stopTyping", () => {
		typingUser.value = ""
	})
})

onUnmounted(() => {
	socket.off("typing")
	socket.off("stopTyping")
})

const goBack = async () => {
	socket.emit("leaveChat", $generalStore.currentChat?.id.toString())

	await navigateTo("/chat")
	$generalStore.currentChat = null
}

const companion = computed(() => {
	return $generalStore.currentChat?.companion
})
</script>

<template>
	<div
		class="absolute top-0 right-0 h-full w-full sm:static sm:w-3/4 flex flex-col max-[600px]:w-full border-r border-[#303030] bg-[#121212] z-20">
		<div class="sticky top-[61px] left-0 w-full py-2 px-6 bg-[#222222] flex items-center z-10">
			<button @click="goBack" class="inline-flex items-center">
				<Icon name="material-symbols:arrow-back-ios" size="24" class="min-w-[24px]" />
			</button>
			<span class="flex-1 text-center">
				<h1 class="text-xl">{{ companion?.name }}</h1>
				<p class="text-sm text-gray-400">
					{{ companion?.online ? "Online" : "last seen" }}
					{{ !companion?.online ? formatDate(companion!.updatedAt) : "" }}
				</p>
			</span>
			<NuxtLink :to="'/profile/' + companion?.name">
				<img
					class="rounded-full"
					width="40"
					:src="'/upload/avatars/' + companion?.avatar" />
			</NuxtLink>
		</div>
		<div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 mt-14 sm:mt-0">
			<div
				v-for="message in $generalStore.currentChat?.messages"
				:key="message.id"
				class="flex items-start mb-1"
				:class="{
					'justify-end': message.senderId === $authStore.profile?.id,
					'justify-start': message.senderId !== $authStore.profile?.id,
				}">
				<div class="flex items-start">
					<div
						:class="{
							'bg-[#F02C56] text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl':
								message.senderId === $authStore.profile?.id,
							'bg-gray-200 text-gray-800 rounded-tr-xl rounded-tl-xl rounded-br-xl':
								message.senderId !== $authStore.profile?.id,
						}"
						class="p-3 pe-10 max-w-xs w-fit break-all shadow-md min-w-20 relative">
						<span>
							{{ message.text }}
						</span>

						<span class="text-xs text-gray-400 absolute bottom-1 right-1">{{
							formatDate(message.createdAt, true)
						}}</span>
					</div>
				</div>
			</div>
			<div
				v-if="typingUser && typingUser !== $authStore.profile?.name"
				class="typing-animation mt-5">
				{{ typingUser }} is typing<span></span><span></span><span></span>
			</div>
		</div>

		<div
			class="p-4 border border-r-0 border-b-0 border-l-0 border-t-[#303030] flex items-center">
			<input
				@keyup.enter="handleSend"
				type="text"
				@input="handleTyping"
				placeholder="Type a message..."
				v-model="text"
				class="flex-1 px-4 py-2 transition text-black bg-white rounded border border-gray-300 shadow-sm focus:ring-2 focus:ring-[#F02C56] focus:outline-none" />
			<button
				@click="handleSend"
				:disabled="!text"
				class="ml-3 bg-[#F02C56] hover:bg-[#F02C56] text-white px-5 py-2 rounded shadow-lg transition-all disabled:bg-gray-4 00">
				Send
			</button>
		</div>
	</div>
</template>

<style scoped>
.typing-animation {
	display: flex;
	align-items: center;
	font-size: 1rem;
	color: #6b7280;
}

.typing-animation span {
	display: inline-block;
	width: 6px;
	height: 6px;
	margin-left: 4px;
	background-color: #6b7280;
	border-radius: 50%;
	animation: bounce 1.4s infinite ease-in-out;
}

.typing-animation span:nth-child(1) {
	animation-delay: -0.32s;
}

.typing-animation span:nth-child(2) {
	animation-delay: -0.16s;
}

.typing-animation span:nth-child(3) {
	animation-delay: 0s;
}

@keyframes bounce {
	0%,
	80%,
	100% {
		transform: scale(0);
		opacity: 0.3;
	}
	40% {
		transform: scale(1);
		opacity: 1;
	}
}
</style>
