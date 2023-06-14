// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon"],
  runtimeConfig: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    public: {
      apiBase: '/api'
    }
  },
})
