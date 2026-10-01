import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const api = process.env.API_URL ?? 'http://localhost:8080'

// A API não tem CORS: em desenvolvimento o Vite encaminha /api e o Swagger para o Spring Boot.
// Em produção o CloudFront faz o mesmo roteamento, então o frontend sempre usa caminhos relativos.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': api,
      '/swagger-ui': api,
      '/v3/api-docs': api,
      '/openapi.yaml': api,
    },
  },
})
