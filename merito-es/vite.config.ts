import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// A API não tem CORS: em desenvolvimento o Vite encaminha /api para o Spring Boot.
// Em produção o CloudFront faz o mesmo roteamento, então o frontend sempre usa caminhos relativos.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.API_URL ?? 'http://localhost:8080',
    },
  },
})
