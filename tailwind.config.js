module.exports = {
  content: ["./components/**/*.{js,vue,ts}", "./layouts/**/*.vue", "./pages/**/*.vue", "./plugins/**/*.{js,ts}", "./app.vue"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#F02C56",
        dark: {
          DEFAULT: "#121212",
          lighter: "#1E1E1E",
          lightest: "#2D2D2D",
        },
        light: {
          DEFAULT: "#FFFFFF",
          darker: "#F5F5F5",
          darkest: "#E5E5E5",
        },
      },
    },
  },
  plugins: [],
};
