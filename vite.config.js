import { defineConfig } from 'vite'
import { resolve } from 'node:path'

const pages = [
  'index',
  'features',
  'about',
  'contact',
  'pricing',
  'blog',
  'licenses',
  'changelog',
  'style-guide',
  'signin',
  'signup',
  '401',
  '404',
]

export default defineConfig({
  root: 'site',
  base: '/vpnteco/',
  publicDir: false,
  server: { port: 5181, strictPort: true },
  preview: { port: 4181, strictPort: true },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((name) => [name, resolve(import.meta.dirname, `site/${name}.html`)]),
      ),
    },
  },
})
