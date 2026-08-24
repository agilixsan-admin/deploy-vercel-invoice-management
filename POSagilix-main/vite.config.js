import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

const commitHash = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'local';
const appVersion = `${pkg.version} (${commitHash})`;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    '__APP_VERSION__': JSON.stringify(appVersion)
  }
})
