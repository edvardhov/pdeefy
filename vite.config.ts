import path from 'node:path'
import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const base = process.env.GITHUB_PAGES === 'true' ? '/pdeefy/' : '/'
const appVersion = JSON.parse(
  readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'),
).version as string

export default defineConfig({
  base,
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es',
  },
})
