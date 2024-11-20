// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	devtools: { enabled: false },
	modules: [
		"@nuxtjs/supabase",
		"@pinia/nuxt",
		"@nuxtjs/tailwindcss",
		"@nuxt/icon",
		"@nuxt/image",
	],
	supabase: {
		redirect: false,
	},
	image: {
		domains: ["https://gcqzkhtzxxchrzuvgfwx.supabase.co"],
	},
	pages: true,
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
})
