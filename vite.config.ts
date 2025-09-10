import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/proj-MORO-web/',  // GitHub 레포 이름과 정확히 일치
})