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
    "@nuxtjs/i18n",
    "nuxt-security",
  ],

  i18n: {
    defaultLocale: "ru",
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "ru", name: "Русский", file: "ru.json" },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },

  runtimeConfig: {
    public: {
      appUrl: "https://clipify.ru",
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
  $development: {
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
    fileStorage: {
      mount: "public/upload",
    },
  },
  $production: {
    fileStorage: {
      mount: "/var/www/upload",
    },
    nodemailer: {
      from: '"Clipify" <killergems122@gmail.com>',
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
  },
  security: {
    rateLimiter: false,
    requestSizeLimiter: false,
    headers: false,
    corsHandler: false,
    allowedMethodsRestricter: false,
    basicAuth: false,
    hidePoweredBy: false,
    csrf: false,
    strict: false,
    xssValidator: false,
    nonce: false,
    removeLoggers: false,
  },
  routeRules: {
    "/admin/*": { ssr: false },
    "/api/**": { cors: true },
    "/api/video/like": {
      security: {
        rateLimiter: {
          headers: true,
          tokensPerInterval: 5,
          interval: 3000,
        },
      },
    },
    "/api/comment/:id/like": {
      security: {
        rateLimiter: {
          headers: true,
          tokensPerInterval: 5,
          interval: 3000,
        },
      },
    },
    "/api/comment/add": {
      security: {
        rateLimiter: {
          headers: true,
          tokensPerInterval: 5,
          interval: 3000,
        },
      },
    },
    "/api/chat/message/create": {
      security: {
        rateLimiter: {
          headers: true,
          tokensPerInterval: 5,
          interval: 3000,
        },
      },
    },
    "/api/auth/login": {
      security: {
        rateLimiter: {
          headers: true,
          tokensPerInterval: 10,
          interval: 60000,
        },
      },
    },
  },

  app: {
    head: {
      // meta: [
      //   { charset: "utf-8" },
      //   { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },

      //   { name: "title", content: "Clipify – Create and Share Videos with Friends" },
      //   {
      //     name: "description",
      //     content:
      //       "Create and share videos with your friends on Clipify. Edit, add effects, and post your clips in seconds!",
      //   },
      //   {
      //     name: "keywords",
      //     content: "video, social media, clips, sharing, editing, friends, short videos",
      //   },
      //   { name: "author", content: "Clipify" },
      //   { name: "robots", content: "index, follow" },

      //   { property: "og:type", content: "website" },
      //   { property: "og:url", content: "https://clipify.ru" },
      //   { property: "og:title", content: "Clipify – Create and Share Videos with Friends" },
      //   {
      //     property: "og:description",
      //     content:
      //       "Create and share videos with your friends on Clipify. Edit, add effects, and post your clips in seconds!",
      //   },
      //   { property: "og:image", content: "https://clipify.ru/clipify-logo.png" },

      //   { name: "twitter:card", content: "https://clipify.ru/clipify-logo.png" },
      //   { name: "twitter:site", content: "@kolya_sick" },
      //   { name: "twitter:title", content: "Clipify – Create and Share Videos with Friends" },
      //   {
      //     name: "twitter:description",
      //     content: "Create and share videos with your friends on Clipify!",
      //   },
      //   { name: "twitter:image", content: "https://clipify.ru/clipify-logo.png" },
      // ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/logo.ico",
        },
        {
          rel: "apple-touch-icon",
          href: "/logo.ico",
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
              lg: "100%",
              xl: "100%",
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
