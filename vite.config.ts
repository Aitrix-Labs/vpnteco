import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/vpnteco/',
  plugins: [react()],
  server: { port: 5181, strictPort: true },
  preview: { port: 4181, strictPort: true },
})
