import type { Chat, Profile } from "@prisma/client"
import type { IMessage, IRoom } from "~/types/user.type"

export const useChat = () => {
	const { $generalStore } = useNuxtApp()

	const protocol = window.location.protocol === "https:" ? "wss://" : "ws://"
	const { data: socketData, send } = useWebSocket(`${protocol}${location.host}/api/websocket`)
	const room = ref<IRoom | null>(null)
	const messages = ref<IMessage[]>([])
	const isLoading = ref<boolean>(false)
	const { $authStore } = useNuxtApp()
	const route = useRoute()

	interface IChat extends Chat {
		messages: IMessage[]
		user: Profile & { online: boolean }
	}

	const fetchChats = async () => {
		const chatItems = await $fetch<IChat[]>("/api/chat", {
			query: {
				userId: $authStore.profile?.id,
			},
		})

		$generalStore.chats = chatItems
	}

	const chatOpen = async (chat: IChat) => {
		navigateTo(`/chat?chatId=${chat.id}`)
	}

	watch(
		() => route.query.chatId,
		async (chatId) => {
			console.log(chatId)

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
		}
	)

	const isTyping = ref<boolean>(false)

	watchEffect(async () => {
		messages.value = messages.value.filter(
			(mes) => mes.action !== "typing" && mes.action !== "remove-typing"
		)
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

		if (message.action === "online") {
			if ($generalStore.chats) {
				console.log("on")
				const user = $generalStore.chats.find((c) => c.user.id === message.sender.id)?.user

				if (user) {
					user.online = true
				}
			}
		}

		if (message.action === "offline") {
			console.log('off')
			if ($generalStore.chats) {
				const user = $generalStore.chats.find((c) => c.user.id === message.sender.id)?.user
				
				if (user) {
					user.online = false
				}
			}
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

	const handleStatus = async (status: "online" | "offline") => {
		send(
			JSON.stringify({
				action: status,
				room: "app",
				text: status,
				sender: $authStore.profile,
			})
		)
		// console.log(status, $authStore.profile)

		await $fetch(`/api/profile/edit/${$authStore.profile?.id}`, {
			method: "PATCH",
			body: {
				online: status === "online",
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
		room,
		messages,
		isLoading,
		isTyping,
		fetchChats,
		chatOpen,
		sendMessage,
		handleStatus,
	}
}
