import type { IProfile } from "~/types/user.type"

export const useChat = () => {
	const { $io: socket, $generalStore } = useNuxtApp()

	const handleStatus = async (status: "online" | "offline", sender: IProfile) => {
		socket.emit(status, sender?.id)

		socket.on(status, (userId: number) => {
			if ($generalStore.chats) {
				const user = $generalStore.chats.find((c) => c.companion.id === userId)?.companion
				const companion = $generalStore.currentChat?.companion

				if (user) {
					user.online = status === "online"
          user.updatedAt = new Date()
				}

				if (companion && companion.id === userId) {
					companion.online = status === "online"
          companion.updatedAt = new Date()
				}
			}
		})

		await $fetch(`/api/profile/edit/${sender?.id}`, {
			method: "PATCH",
			body: {
				online: status === "online",
			},
		})
	}

	return {
		handleStatus,
	}
}
