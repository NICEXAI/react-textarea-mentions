import react from '@vitejs/plugin-react'
import { readFileSync } from 'fs'
import path from 'path'
import { defineConfig } from 'vite'

const packageJson = JSON.parse(
  readFileSync('./package.json', { encoding: 'utf-8' }),
)
const globals = {
  ...(packageJson?.dependencies || {}),
}

function resolve(str: string) {
  return path.resolve(__dirname, str)
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    preprocessorOptions: {
      less: {
        math: "always",
        relativeUrls: true,
        javascriptEnabled: true
      },
    },
  },
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve('packages/index.ts'),
      name: 'react-textarea-mentions',
      fileName: 'react-textarea-mentions',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', ...Object.keys(globals)],
    },
  },
  server: {
    port: 3000,
  }
})
