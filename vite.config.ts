import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import dotenv from 'dotenv'
import { geminiConvertPlugin } from './plugins/geminiConvertPlugin.ts'

dotenv.config({ quiet: true })

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), geminiConvertPlugin()],
})
