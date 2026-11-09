import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const from = path.join(root, 'site', 'assets')
const to = path.join(root, 'dist', 'assets')

fs.mkdirSync(to, { recursive: true })
fs.cpSync(from, to, { recursive: true })
console.log('copied assets -> dist/assets')
