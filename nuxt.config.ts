// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  googleFonts: {
    preload: true,
    families: {
      Montserrat: [900],
      Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
  },
  modules: [
    "@pinia/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-auth-utils",
    "nuxt-file-storage",
    "nuxt-nodemailer",
    "@nuxtjs/google-fonts",
    "@nuxtjs/color-mode",
  ],
  nodemailer: {
    from: '"Clipify" <killergems122@gmail.com>',
    host: process.env.SMTP_HOST,
    port: process.env.PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
  runtimeConfig: {
    public: {
      appUrl: "https://4342349-oh47207.twc1.net",
    },
  },
  pages: true,
  nitro: {
    experimental: {
      websocket: true,
    },
    preset: "node-server",
    minify: true,
    compressPublicAssets: true,
  },
  fileStorage: {
    mount: "public/upload",
  },
  routeRules: {
    "/admin/*": { ssr: false },
    "/api/**": { cors: true },
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
  tailwindcss: {
    config: {
      theme: {
        extend: {
          container: {
            center: true,
            padding: "1rem",
            screens: {
              sm: "100%",
              md: "100%",
              lg: "1024px",
              xl: "1260px",
            },
          },
        },
      },
    },
  },
  colorMode: {
    preference: "system",
    fallback: "dark",
    classSuffix: "",
    storageKey: "tiktok-clone-theme",
  },
  compatibilityDate: "2025-02-22",
});
