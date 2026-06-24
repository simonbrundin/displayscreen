// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: true },

	vite: {
		optimizeDeps: {
			include: ["@vue/devtools-core", "@vue/devtools-kit"],
		},
	},

	modules: [],

	runtimeConfig: {
		// Server-side only (private)
		googleDriveFolderId: "",
		googleServiceAccountKey: "",
		slideInterval: 30000,

		// Public (exposed to client)
		public: {
			slideInterval: 30000,
		},
	},

	app: {
		head: {
			htmlAttrs: {
				lang: "sv",
			},
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{ name: "theme-color", content: "#000000" },
			],
		},
	},

	css: [],

	nitro: {
		// Enable server-side rendering
		preset: "node-server",
	},

	routeRules: {
		// Cache API responses for better performance
		"/api/images": {
			cache: {
				maxAge: 60, // 1 minute
				staleMaxAge: 300, // 5 minutes
			},
		},
	},
});
