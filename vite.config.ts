import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import VitePluginStyleInject from 'vite-plugin-style-inject'

const packageJson = JSON.parse(readFileSync('./package.json', { encoding: 'utf-8' }))
const globals = {
  ...(packageJson?.dependencies || {}),
}

function resolve(str: string) {
  return path.resolve(__dirname, str)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: 'packages/**/*.{ts,tsx}',
      outDir: 'dist',
    }),
    VitePluginStyleInject(),
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      less: {
        math: 'always',
        relativeUrls: true,
        javascriptEnabled: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve('packages/index.ts'),
      name: 'TextareaMentions',
      fileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', ...Object.keys(globals)],
    },
  },
  server: {
    port: 3000,
  },
})
