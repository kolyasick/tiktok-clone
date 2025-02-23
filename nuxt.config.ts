// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	devtools: { enabled: false },
	modules: [
		"@pinia/nuxt",
		"@nuxtjs/tailwindcss",
		"@nuxt/image",
		"@nuxt/icon",
		"nuxt-auth-utils",
		"nuxt-file-storage",
	],
	pages: true,
	fileStorage: {
		mount: "public/upload",
	},
	app: {
		head: {
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1, maximum-scale=1",
			link: [
				{
					rel: "icon",
					type: "image/x-icon",
					href: "/tiktok-logo-small.png",
				},
			],
		},
	},

	compatibilityDate: "2025-02-22",
})
