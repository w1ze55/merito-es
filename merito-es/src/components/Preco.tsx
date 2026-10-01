import { partesDoPreco, precoPorLitro } from '../lib/formato'
import type { Tinta } from '../lib/tinta'

// Preço por litro como no totem: o milésimo vai em corpo menor, alinhado ao topo ("6,29⁹").
export function Preco({ valor, moeda = true, porLitro = false }: { valor: number; moeda?: boolean; porLitro?: boolean }) {
  const { principal, milesimo } = partesDoPreco(valor)
  return (
    <span className="preco" aria-label={`${precoPorLitro(valor)}${porLitro ? ' por litro' : ''}`}>
      <span aria-hidden="true">
        {moeda && <span className="preco__moeda">R$</span>}
        {principal}
        <span className="preco__milesimo">{milesimo}</span>
        {porLitro && <span className="preco__unidade">/L</span>}
      </span>
    </span>
  )
}

export function Tinteiro({ tinta }: { tinta: Tinta }) {
  return <span className="tinteiro" style={{ background: tinta.fundo }} aria-hidden="true" />
}

// Nome do combustível acompanhado da sua tinta fixa.
export function Combustivel({ nome, tinta }: { nome: string; tinta: Tinta }) {
  return (
    <span className="combustivel">
      <Tinteiro tinta={tinta} />
      {nome}
    </span>
  )
}
