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
			imagesBeforeRefresh: 10,
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
		// Cache HTML pages - auto-updates based on slide interval and refresh count
		// Cache time = slideInterval * imagesBeforeRefresh
		// Default: 30s * 10 = 5 min
		"/**": {
			headers: {
				"Cache-Control": `max-age=${Math.round((Number(process.env.NUXT_PUBLIC_SLIDE_INTERVAL) || 30000) / 1000 * (Number(process.env.NUXT_PUBLIC_IMAGES_BEFORE_REFRESH) || 10))}, must-revalidate`,
			},
		},
		// Cache API responses
		"/api/images": {
			cache: {
				maxAge: 60,
				staleMaxAge: 300,
			},
		},
	},
});
