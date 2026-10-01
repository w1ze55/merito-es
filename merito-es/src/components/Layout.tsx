import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { apagarDestaque } from '../lib/destaque'
import { Totem } from './Totem'

export function Layout() {
  const { pathname } = useLocation()

  // Trocar de tela é uma nova ação: o destaque do último registro salvo se apaga.
  useEffect(() => apagarDestaque(), [pathname])

  return (
    <div className="posto">
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Totem />
      <main className="patio" id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
