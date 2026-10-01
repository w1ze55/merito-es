import { useEffect, type ReactNode } from 'react'

export function Tela({ titulo, resumo, children }: { titulo: string; resumo?: ReactNode; children: ReactNode }) {
  useEffect(() => {
    document.title = `${titulo} · Posto`
  }, [titulo])

  return (
    <div className="tela">
      <header className="tela__topo">
        <h1 className="tela__titulo">{titulo}</h1>
        {resumo && <p className="tela__resumo">{resumo}</p>}
      </header>
      {children}
    </div>
  )
}

export function Folha({
  titulo,
  id,
  emEdicao,
  extra,
  children,
  className,
}: {
  titulo: ReactNode
  id: string
  emEdicao?: boolean
  extra?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={['folha', className].filter(Boolean).join(' ')} aria-labelledby={id} data-edicao={emEdicao || undefined}>
      <header className="folha__topo">
        <h2 className="folha__titulo" id={id}>
          {titulo}
        </h2>
        {extra}
      </header>
      {children}
    </section>
  )
}

// Número do registro em placa. Em sinal (magenta) quando é o registro em que se está mexendo agora.
export function Numero({ id, ativo }: { id: number; ativo?: boolean }) {
  return (
    <span className="numero" data-ativo={ativo || undefined}>
      <span className="numero__prefixo">Nº</span>
      {id}
    </span>
  )
}
