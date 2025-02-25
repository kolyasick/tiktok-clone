import type { Chat, Profile } from "@prisma/client"
import type { IMessage, IRoom } from "~/types/user.type"

export const useChat = () => {
	const protocol = window.location.protocol === "https:" ? "wss://" : "ws://"
	const { data: socketData, send } = useWebSocket(`${protocol}${location.host}/api/websocket`)
	const room = ref<IRoom | null>(null)
	const messages = ref<IMessage[]>([])
	const isLoading = ref<boolean>(false)
	const { $authStore } = useNuxtApp()
	const route = useRoute()

	interface IChat extends Chat {
		messages: IMessage[]
		user: Profile
	}

	const chats = ref<IChat[]>([])

	const fetchChats = async () => {
		chats.value = await $fetch<IChat[]>("/api/chat", {
			query: {
				userId: $authStore.profile?.id,
			},
		})
	}

	const users = computed(() => {
		return chats.value?.map((chat) => chat.user)
	})

	const chatOpen = async (chatId: string) => {
		navigateTo(`/chat?chatId=${chatId}`)
	}

	const isTyping = ref<boolean>(false)

	watchEffect(async () => {
		const chatId = route.query.chatId
		if (chatId) {
			isLoading.value = true
			const chat = await $fetch<IRoom>(`/api/chat/${chatId}`)
			room.value = chat ?? null
			messages.value = (room.value?.messages ?? []) as IMessage[]
			isLoading.value = false

			send(
				JSON.stringify({
					action: "subscribe",
					text: "Пользователь онлайн!",
					room: chat?.id,
				})
			)

			messages.value = messages.value.filter(
				(mes) => mes.action !== "typing" && mes.action !== "remove-typing"
			)
		}
	})

	watch(socketData, (newValue) => {
		const message = JSON.parse(newValue)

		if (message.room === room.value?.id && room.value) {
			messages.value.push(createMessage(message.text, message.action, message.sender))
		}

		if (message.action === "remove-typing") {
			messages.value = messages.value.filter(
				(m) => m.action !== "typing" && m.action !== "remove-typing"
			)
		}
	})

	const sendMessage = async (text: string) => {
		if (!text.trim()) return

		const message = createMessage(text)
		messages.value.push(message)

		send(
			JSON.stringify({
				action: "message",
				room: room.value?.id,
				text: text,
				sender: $authStore.profile,
			})
		)

		await $fetch("/api/chat/message/create", {
			method: "POST",
			body: {
				text,
				senderId: $authStore.profile?.id,
				chatId: room.value?.id,
			},
		})
	}

	const createMessage = (text: string, action?: string, sender?: Profile): IMessage => ({
		id: Date.now(),
		text, // @ts-ignore
		sender: sender || $authStore.profile, // @ts-ignore
		senderId: sender?.id || $authStore.profile?.id, // @ts-ignore
		chatId: room.value?.id,
		createdAt: new Date(),
		updatedAt: new Date(),
		action,
	})

	return {
		chats,
		users,
		room,
		messages,
		isLoading,
		isTyping,
		fetchChats,
		chatOpen,
		sendMessage,
	}
}
