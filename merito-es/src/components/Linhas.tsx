import { useState } from 'react'
import type { FalhaNaLinha } from '../lib/falhaNaLinha'
import { Icone } from './Icone'

// Ações de uma linha da lista. A exclusão pede confirmação ali mesmo, sem diálogo.
export function AcoesDaLinha({
  descricao,
  emEdicao,
  excluindo,
  aoEditar,
  aoExcluir,
}: {
  descricao: string
  emEdicao: boolean
  excluindo: boolean
  aoEditar: () => void
  aoExcluir: () => void
}) {
  const [confirmando, setConfirmando] = useState(false)

  if (confirmando || excluindo) {
    return (
      <div className="acoes acoes--confirmar" role="group" aria-label={`Confirmar exclusão de ${descricao}`}>
        <span className="acoes__pergunta">Excluir?</span>
        <button
          type="button"
          className="botao botao--perigo botao--pequeno"
          onClick={() => {
            aoExcluir()
            setConfirmando(false)
          }}
          disabled={excluindo}
          aria-busy={excluindo || undefined}
          autoFocus
        >
          {excluindo ? 'Excluindo…' : 'Sim, excluir'}
        </button>
        <button type="button" className="botao botao--texto botao--pequeno" onClick={() => setConfirmando(false)} disabled={excluindo}>
          Não
        </button>
      </div>
    )
  }

  return (
    <div className="acoes">
      <button type="button" className="botao botao--texto botao--pequeno" onClick={aoEditar} aria-pressed={emEdicao} aria-label={`Editar ${descricao}`}>
        <Icone nome="editar" tamanho={16} />
        <span className="acoes__texto">Editar</span>
      </button>
      <button type="button" className="botao botao--texto botao--pequeno botao--excluir" onClick={() => setConfirmando(true)} aria-label={`Excluir ${descricao}`}>
        <Icone nome="excluir" tamanho={16} />
        <span className="acoes__texto">Excluir</span>
      </button>
    </div>
  )
}

// Mensagem da API logo abaixo da linha que a provocou (ex.: a regra do 409).
export function LinhaDeFalha({ falha, colunas, aoFechar }: { falha: FalhaNaLinha; colunas: number; aoFechar: () => void }) {
  return (
    <tr className="linha-falha">
      <td colSpan={colunas}>
        <div className="aviso aviso--erro" role="alert">
          <Icone nome="alerta" tamanho={18} />
          <div>
            {falha.mensagens.map((mensagem) => (
              <p key={mensagem}>{mensagem}</p>
            ))}
          </div>
          <button type="button" className="botao botao--texto botao--pequeno aviso__fechar" onClick={aoFechar} aria-label="Dispensar aviso">
            <Icone nome="fechar" tamanho={16} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export function LinhasCarregando({ colunas, linhas = 5 }: { colunas: number; linhas?: number }) {
  return (
    <>
      {Array.from({ length: linhas }, (_, i) => (
        <tr key={i} className="linha-carregando" aria-hidden="true">
          {Array.from({ length: colunas }, (_, j) => (
            <td key={j}>
              <span className="esqueleto" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
