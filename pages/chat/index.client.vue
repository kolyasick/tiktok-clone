<script setup lang="ts">
import type { Users } from "@prisma/client"
import UserOverlay from "~/components/chat/UserOverlay.vue"
import type { IMessage, IRoom } from "~/types/user.type"

const {
	status,
	data: socketData,
	send,
	open,
	close,
} = useWebSocket(`ws://${location.host}/api/websocket`)
const nuxt = useNuxtApp()

const room = ref<IRoom | null>(null)
const messages = ref<IMessage[]>([])

let isLoading = ref<boolean>(false)

const { $authStore } = useNuxtApp()

const { data } = await useFetch<Users[]>("/api/users")

const users = computed(() => data.value?.filter((user) => user.id !== $authStore.user?.id))

const chatOpen = async (userId: string) => {
	isLoading.value = true

	const { data: chat } = await useFetch<IRoom>("/api/chat/create", {
		key: `chat-${$authStore.user?.id}-${userId}`,
		method: "POST",
		body: {
			user1Id: $authStore.user?.id,
			user2Id: userId,
		},
	})
	console.log(messages.value );
	
	room.value = chat.value ?? null
	messages.value = (room.value?.messages ?? []) as IMessage[]

	isLoading.value = false

	send(
		JSON.stringify({ action: "subscribe", text: "Пользователь онлайн!", room: chat.value?.id })
	)

	messages.value = messages.value.filter(
		(mes) => mes.action !== "typing" && mes.action !== "remove-typing"
	)
}

const isTyping = ref<boolean>(false)

watch(socketData, (newValue) => {
	const message = JSON.parse(newValue)
	console.log(message)

	if (message.room === room.value?.id && room.value) {
		messages.value.push({
			id: Date.now(),
			text: message.text,
			sender: message.sender,
			action: message.action,
			senderId: message.sender?.id || "Notification",
			chatName: room.value?.id,
			createdAt: new Date(),
			updatedAt: new Date(),
		} as IMessage)
	}

	if (message.action === "remove-typing") {
		messages.value = messages.value.filter(
			(m) => m.action !== "typing" && m.action !== "remove-typing"
		)
	}
})

const sendMessage = async (text: string) => {
	if (!text.trim()) return

	const m = {
		id: Date.now(),
		text: text,
		sender: $authStore.user,
		senderId: $authStore.user?.id,
		chatName: room.value?.id,
		createdAt: new Date(),
		updatedAt: new Date(),
	} as IMessage

	messages.value.push(m)

	send(
		JSON.stringify({
			action: "message",
			room: room.value?.id,
			text: text,
			sender: $authStore.user,
		})
	)

	const r = await useFetch("/api/chat/message/create", {
		method: "POST",
		body: {
			text: text,
			senderId: $authStore.user?.id,
			chatName: room.value?.id,
		},
	})
}
</script>

<template>
	<div>
		<TopNav />
		<div
			class="flex h-screen max-w-[1260px] mx-auto pt-[60px] border border-b-0 border-[#303030] max-[600px]:flex-col">
			<div class="w-1/4 bg-[#303030] max-[600px]:w-full">
				<div class="p-4 border-b border-[#ebebeb6c]">
					<h2 class="text-xl font-semibold">Friends</h2>
				</div>
				<ul>
					<UserOverlay
						v-for="user in users"
						:key="user.id"
						:user="user"
						@chat-open="chatOpen" />
				</ul>
			</div>

			<div
				v-if="isLoading"
				class="h-full w-3/4 flex items-center justify-center max-[600px]:w-full">
				<div>
					<Icon
						class="animate-spin ml-1"
						name="mingcute:loading-line"
						size="100"
						color="#FFFFFF" />
				</div>
			</div>
			<div
				v-else-if="!room && !isLoading"
				class="h-full w-3/4 flex items-center justify-center max-[600px]:w-full">
				Выберите, кому хотели бы написать
			</div>

			<ChatOverlay
				v-else
				:isTyping="isTyping"
				:messages="messages"
				:chatId="room?.id || ''"
				@send-message="sendMessage" />
		</div>
	</div>
</template>

<style>
/* Дополнительный стиль, если потребуется */
</style>
