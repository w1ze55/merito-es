import '@fontsource/barlow/latin-400.css'
import '@fontsource/barlow/latin-500.css'
import '@fontsource/barlow/latin-600.css'
import '@fontsource/barlow-semi-condensed/latin-500.css'
import '@fontsource/barlow-semi-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-500.css'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-700.css'
import './styles/base.css'
import './styles/totem.css'
import './styles/patio.css'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { ApiError } from './api/client'
import { router } from './router'

const cliente = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000,
      // Erro de regra ou validação não melhora tentando de novo; só a queda da API merece nova tentativa.
      retry: (tentativas, erro) => erro instanceof ApiError && erro.tipo === 'fora-do-ar' && tentativas < 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={cliente}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
