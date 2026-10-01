import { useId, type ReactNode } from 'react'
import { Icone } from './Icone'

// Rótulo, controle e a mensagem da API logo abaixo, ligada ao controle por aria-describedby.
export function Campo({
  rotulo,
  erro,
  dica,
  className,
  children,
}: {
  rotulo: string
  erro?: string
  dica?: ReactNode
  className?: string
  children: (props: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode
}) {
  const id = useId()
  const descricao = erro ? `${id}-erro` : dica ? `${id}-dica` : undefined
  return (
    <div className={['campo', className].filter(Boolean).join(' ')} data-erro={erro ? true : undefined}>
      <label className="campo__rotulo" htmlFor={id}>
        {rotulo}
      </label>
      {children({ id, 'aria-invalid': erro ? true : undefined, 'aria-describedby': descricao })}
      {erro ? (
        <p className="campo__erro" id={`${id}-erro`}>
          {erro}
        </p>
      ) : (
        dica && (
          <p className="campo__dica" id={`${id}-dica`}>
            {dica}
          </p>
        )
      )}
    </div>
  )
}

// Grupo de opções (bombas, combustíveis) com a mensagem de erro da API.
export function Opcoes({ legenda, erro, children }: { legenda: string; erro?: string; children: ReactNode }) {
  const id = useId()
  return (
    <fieldset className="opcoes" aria-describedby={erro ? id : undefined} data-erro={erro ? true : undefined}>
      <legend className="campo__rotulo">{legenda}</legend>
      <div className="opcoes__grade">{children}</div>
      {erro && (
        <p className="campo__erro" id={id}>
          {erro}
        </p>
      )}
    </fieldset>
  )
}

export function AvisoDeErro({ mensagens }: { mensagens: string[] }) {
  if (mensagens.length === 0) return null
  return (
    <div className="aviso aviso--erro" role="alert">
      <Icone nome="alerta" tamanho={18} />
      <div>
        {mensagens.map((mensagem) => (
          <p key={mensagem}>{mensagem}</p>
        ))}
      </div>
    </div>
  )
}
