import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'https://localhost:7185',
                changeOrigin: true,
                secure: false, // keep this if using a self-signed dev cert
            }
        }
    }
})