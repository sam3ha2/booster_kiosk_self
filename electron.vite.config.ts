import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite'

import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(() => {
  return {
    main: {
      plugins: [externalizeDepsPlugin(), swcPlugin()],
      build: {
        watch: {},
        sourcemap: true,
      },
      resolve: {
        alias: {
          '@main': resolve('src/main'),
        },
      },
      define: {
        'process.env.GPASS_API_URL': JSON.stringify(process.env.GPASS_API_URL),
        'process.env.GPASS_DEFAULT_PUBLIC_KEY': JSON.stringify(process.env.GPASS_DEFAULT_PUBLIC_KEY),
        'process.env.GPASS_AUTH_KEY': JSON.stringify(process.env.GPASS_AUTH_KEY),
        'process.env.GPASS_USER_ID': JSON.stringify(process.env.GPASS_USER_ID),
        'process.env.GPASS_PASSWORD': JSON.stringify(process.env.GPASS_PASSWORD),
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
    },
    renderer: {
      plugins: [react()],
      resolve: {
        alias: {
          '@main': resolve('src/main'),
          '@renderer': resolve('src/renderer/src'),
        },
      },
      server: {
        port: 3000,
        strictPort: true,
      },
      build: {
        sourcemap: true,
      },
    },
  }
})
