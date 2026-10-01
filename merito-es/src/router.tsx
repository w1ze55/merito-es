import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout'
import { Abastecimentos } from './routes/Abastecimentos'
import { Bombas } from './routes/Bombas'
import { Combustiveis } from './routes/Combustiveis'
import { ErroDeRota } from './routes/ErroDeRota'
import { VisaoGeral } from './routes/VisaoGeral'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        errorElement: <ErroDeRota />,
        children: [
          { index: true, element: <VisaoGeral /> },
          { path: 'abastecimentos', element: <Abastecimentos /> },
          { path: 'bombas', element: <Bombas /> },
          { path: 'combustiveis', element: <Combustiveis /> },
          { path: '*', element: <ErroDeRota /> },
        ],
      },
    ],
  },
])
