import { Profile } from "@prisma/client"

interface IMessage {
	text: string
	created_at: Date
}

interface IRoom {
	[id: string]: IMessage[]
}

const rooms: IRoom = {}

export default defineWebSocketHandler({
	open(peer) {
		// console.log("WebSocket открыт", peer)
	},

	close(peer) {
		// console.log("WebSocket закрыт", peer)
	},

	error(peer, error) {
		// console.log("WebSocket ошибка", peer, error)
	},

	message(peer, message) {
		try {
			const { room, sender, text, action } = JSON.parse(message.text()) as {
				room: string
				sender: Profile
				text: string
				action: string
			}

			if (action === "subscribe") {
				peer.subscribe(room)

				if (!rooms[room]) {
					rooms[room] = []
				}
			} else if (action === "message") {
				if (rooms[room]) {
					rooms[room].push({ text, created_at: new Date() })
				}

				peer.publish(room, JSON.stringify({ room, sender, text, created_at: new Date() }))
			} else if (action === "typing") {
				const typingMessage: IMessage = { text: "typing", created_at: new Date() }

				peer.publish(
					room,
					JSON.stringify({
						room,
						text,
						sender,
						action: "typing",
						created_at: new Date(),
					})
				)

				setTimeout(() => {
					if (rooms[room]) {
						const index = rooms[room].findIndex(
							(msg) =>
								msg.text === "typing" && msg.created_at === typingMessage.created_at
						)
						if (index !== -1) {
							rooms[room].splice(index, 1)
						}

						peer.publish(
							room,
							JSON.stringify({
								room,
								text: "remove-typing",
								action: "remove-typing",
								sender,
							})
						)
					}
				}, 1000)
			} else if (action === "online") {
				peer.subscribe(room)
				console.log(room)

				peer.publish(
					room,
					JSON.stringify({
						room,
						sender,
						action: "online",
						created_at: new Date(),
					})
				)
			} else if (action === "offline") {
				peer.subscribe(room)
				console.log(room)

				peer.publish(
					room,
					JSON.stringify({
						room,
						sender,
						action: "offline",
						created_at: new Date(),
					})
				)
			}
		} catch (err) {
			console.error("Ошибка обработки сообщения:", err)
		}
	},
})
