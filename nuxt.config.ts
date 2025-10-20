// File: nuxt.config.ts

export default defineNuxtConfig({
  // 👇 This makes Nuxt use the /app folder (so it finds your pages, layouts, etc.)
  srcDir: 'app/',

  modules: [
    '@nuxthub/core',
    'shadcn-nuxt',
    '@vueuse/motion/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
  ],

  components: [
    // Application components (higher priority so app components override library ones)
    { path: '~/app/components', pathPrefix: true, priority: 20, extensions: ['vue'], ignore: ['**/index.ts'] },
    { path: '~/app/components/ui', pathPrefix: true, priority: 20, extensions: ['vue'], ignore: ['**/index.ts'] },
    // Legacy top-level components folder
    { path: '~/components', pathPrefix: true, extensions: ['vue'], ignore: ['**/index.ts'] },
    // Specific drawer override (lower priority)
    { path: '~/components/ui/drawer', priority: 10 },
  ],

  devtools: { enabled: true },
  colorMode: { classSuffix: '' },

  runtimeConfig: {
    siteToken: 'Urlsclickearn',
    redirectStatusCode: '301',
    linkCacheTtl: 60,
    redirectWithQuery: false,
    homeURL: process.env.NUXT_HOME_URL || 'http://localhost:3000',
    cfAccountId: '',
    cfApiToken: '',
    dataset: 'Urlsclickearn',
    aiModel: '@cf/meta/llama-3.1-8b-instruct',
    aiPrompt: `You are a URL shortening assistant, please shorten the URL provided by the user into a SLUG. The SLUG information must come from the URL itself, do not make any assumptions. A SLUG is human-readable and should not exceed three words and can be validated using regular expressions {slugRegex} . Only the best one is returned, the format must be JSON reference {"slug": "example-slug"}`,
    caseSensitive: false,
    listQueryLimit: 500,
    disableBotAccessLog: false,
    public: {
      previewMode: '',
      slugDefaultLength: '6',
      homeURL: process.env.NUXT_HOME_URL || 'http://localhost:3000',
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    },
  },

  routeRules: {
    '/': { prerender: false },
    '/dashboard/**': { prerender: true, ssr: false },
    '/dashboard': { redirect: '/dashboard/links' },
    '/login': { redirect: '/auth/login' },
    '/signup': { redirect: '/auth/signup' },
    'publicAssets': [
      { baseURL: '/', dir: 'public' },
    ],
  },

  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      openAPI: false,
    },
  },

  hub: {
    ai: true,
    analytics: true,
    blob: false,
    cache: false,
    database: false,
    kv: true,
    workers: true,
  },

  vite: {
    build: {
      target: 'esnext',
    },
    ssr: {
      noExternal: [
        'mime',
        'zod',
      ],
    },
    plugins: [
      {
        name: 'fix-mime-top-this',
        enforce: 'pre',
        apply: 'build',
        transform(code: string, id: string) {
          if (!/node_modules[\\/].*mime.*dist[\\/].*Mime\.js/.test(id)) {
            return null
          }
          const fixed = code.replace(
            /\bthis\b/g,
            '(typeof globalThis !== "undefined" ? globalThis : (typeof self !== "undefined" ? self : {}))',
          )
          return {
            code: fixed,
            map: null,
          }
        },
      },
    ],
    vue: {
      include: [/\.vue$/],
      exclude: [
        /middleware\/.*\.ts$/,
        /components\/.*\/index\.ts$/,
        /app\.config\.ts$/,
        /utils\/.*\.ts$/,
        /composables\/.*\.ts$/,
        /components\/.*\.ts$/,
      ],
      script: {
        defineModel: true,
        defineProps: true,
        defineEmits: true,
        defineExpose: true,
      },
    },
  },

  eslint: {
    config: {
      stylistic: true,
      standalone: false,
    },
  },

  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
})
