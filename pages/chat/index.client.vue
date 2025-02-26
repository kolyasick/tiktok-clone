<script setup lang="ts">
import UserOverlay from "~/components/chat/UserOverlay.vue"

definePageMeta({
	middleware: "auth",
})

const { room, messages, isLoading, isTyping, fetchChats, chatOpen, sendMessage } = useChat()
const { $generalStore, $authStore } = useNuxtApp()
await fetchChats()

// console.log($generalStore.chats)
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
						v-for="chat in $generalStore.chats"
						:key="chat.id"
						:chat="chat"
						@chat-open="chatOpen" />
				</ul>
			</div>

			<template v-if="isLoading">
				<div class="h-full w-3/4 flex items-center justify-center max-[600px]:w-full">
					<Icon
						class="animate-spin ml-1"
						name="mingcute:loading-line"
						size="100"
						color="#FFFFFF" />
				</div>
			</template>

			<template v-else-if="!room">
				<div class="h-full w-3/4 flex items-center justify-center max-[600px]:w-full">
					Выберите, кому хотели бы написать
				</div>
			</template>

			<template v-else>
				<ChatOverlay
					:isTyping="isTyping"
					:messages="messages"
					:chatId="room?.id || 0"
					@send-message="sendMessage" />
			</template>
		</div>
	</div>
</template>

<style scoped>
/* Добавьте стили, если необходимо */
</style>
