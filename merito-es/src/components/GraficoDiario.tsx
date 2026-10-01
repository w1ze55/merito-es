import { useLayoutEffect, useRef, useState } from 'react'
import type { TipoCombustivel } from '../api/types'
import { moeda } from '../lib/formato'
import type { Tinta } from '../lib/tinta'
import { Icone } from './Icone'

export type Coluna = { rotulo: string; partes: { tipoId: number; valor: number }[] }

const ALTURA = 240
const MARGEM = { topo: 12, direita: 8, base: 28, esquerda: 64 }
const LARGURA_MAX_BARRA = 24
const VAO = 2 // espaço na cor da folha entre segmentos empilhados

const compacto = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 })

// Teto "redondo" para o eixo: 1, 2, 2,5 ou 5 × 10ⁿ.
function tetoRedondo(maximo: number) {
  if (maximo <= 0) return 100
  const ordem = 10 ** Math.floor(Math.log10(maximo))
  const passo = [1, 2, 2.5, 5, 10].find((p) => p * ordem >= maximo)!
  return passo * ordem
}

function useLargura<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [largura, setLargura] = useState(0)
  useLayoutEffect(() => {
    if (!ref.current) return
    const observador = new ResizeObserver(([entrada]) => setLargura(entrada.contentRect.width))
    observador.observe(ref.current)
    return () => observador.disconnect()
  }, [])
  return [ref, largura] as const
}

// Retângulo com cantos de 4px só no topo (a ponta do dado); a base fica reta, presa ao eixo.
function pontaArredondada(x: number, y: number, largura: number, altura: number) {
  const r = Math.min(4, largura / 2, altura)
  return `M${x},${y + altura}V${y + r}Q${x},${y} ${x + r},${y}H${x + largura - r}Q${x + largura},${y} ${x + largura},${y + r}V${y + altura}Z`
}

export function GraficoDiario({ colunas, tipos, tintaDe }: { colunas: Coluna[]; tipos: TipoCombustivel[]; tintaDe: (id: number) => Tinta }) {
  const [ref, largura] = useLargura<HTMLDivElement>()
  const [foco, setFoco] = useState<number | null>(null)

  const totais = colunas.map((coluna) => coluna.partes.reduce((soma, parte) => soma + parte.valor, 0))
  const teto = tetoRedondo(Math.max(...totais, 0))
  const areaLargura = Math.max(largura - MARGEM.esquerda - MARGEM.direita, 0)
  const areaAltura = ALTURA - MARGEM.topo - MARGEM.base
  const faixa = colunas.length > 0 ? areaLargura / colunas.length : 0
  const barra = Math.max(Math.min(LARGURA_MAX_BARRA, faixa * 0.62), 2)
  const y = (valor: number) => MARGEM.topo + areaAltura - (valor / teto) * areaAltura
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * teto)
  const cadaQuantos = Math.max(1, Math.ceil(colunas.length / Math.max(1, Math.floor(areaLargura / 56))))
  const nomeDe = new Map(tipos.map((tipo) => [tipo.id, tipo.nome]))

  return (
    <div className="grafico">
      <div className="grafico__area" ref={ref}>
        {largura > 0 && (
          <svg width={largura} height={ALTURA} role="img" aria-label="Valor vendido por dia, empilhado por combustível. Os valores estão na tabela abaixo.">
            {ticks.map((tick) => (
              <g key={tick}>
                <line className="grafico__grade" x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={y(tick)} y2={y(tick)} />
                <text className="grafico__eixo" x={MARGEM.esquerda - 10} y={y(tick)} dy="0.32em" textAnchor="end">
                  {compacto.format(tick)}
                </text>
              </g>
            ))}

            {colunas.map((coluna, i) => {
              const x = MARGEM.esquerda + i * faixa + (faixa - barra) / 2
              let acumulado = 0
              const visiveis = coluna.partes.filter((parte) => parte.valor > 0)
              return (
                <g
                  key={coluna.rotulo}
                  className="grafico__coluna"
                  data-foco={foco === i || undefined}
                  tabIndex={0}
                  aria-label={`${coluna.rotulo}: ${moeda(totais[i])}`}
                  onPointerEnter={() => setFoco(i)}
                  onPointerLeave={() => setFoco(null)}
                  onFocus={() => setFoco(i)}
                  onBlur={() => setFoco(null)}
                >
                  <rect className="grafico__alvo" x={MARGEM.esquerda + i * faixa} y={MARGEM.topo} width={faixa} height={areaAltura} />
                  {visiveis.map((parte, j) => {
                    const base = y(acumulado)
                    acumulado += parte.valor
                    const topo = y(acumulado)
                    const ultima = j === visiveis.length - 1
                    // O vão de 2px entra no topo de cada segmento que tem outro por cima.
                    const altura = Math.max(base - topo - (ultima ? 0 : VAO), 0.5)
                    const cor = tintaDe(parte.tipoId).fundo
                    return ultima ? (
                      <path key={parte.tipoId} d={pontaArredondada(x, topo, barra, altura)} fill={cor} />
                    ) : (
                      <rect key={parte.tipoId} x={x} y={topo + VAO} width={barra} height={altura} fill={cor} />
                    )
                  })}
                  {i % cadaQuantos === 0 && (
                    <text className="grafico__eixo" x={x + barra / 2} y={ALTURA - 8} textAnchor="middle">
                      {coluna.rotulo}
                    </text>
                  )}
                </g>
              )
            })}
            <line className="grafico__base" x1={MARGEM.esquerda} x2={largura - MARGEM.direita} y1={y(0)} y2={y(0)} />
          </svg>
        )}

        {foco !== null && largura > 0 && (
          <div
            className="grafico__dica"
            role="presentation"
            style={{
              left: Math.min(Math.max(MARGEM.esquerda + foco * faixa + faixa / 2, 110), largura - 110),
              top: Math.max(y(totais[foco]) - 12, 0),
            }}
          >
            <span className="grafico__dica-dia">{colunas[foco].rotulo}</span>
            <strong className="grafico__dica-total">{moeda(totais[foco])}</strong>
            <ul>
              {colunas[foco].partes
                .filter((parte) => parte.valor > 0)
                .reverse()
                .map((parte) => (
                  <li key={parte.tipoId}>
                    <span className="grafico__chave" style={{ background: tintaDe(parte.tipoId).fundo }} aria-hidden="true" />
                    <strong>{moeda(parte.valor)}</strong>
                    <span>{nomeDe.get(parte.tipoId)}</span>
                  </li>
                ))}
              {totais[foco] === 0 && <li>Sem vendas</li>}
            </ul>
          </div>
        )}
      </div>

      <details className="grafico__tabela">
        <summary>
          <Icone nome="seta" tamanho={16} />
          Ver os valores em tabela
        </summary>
        <div className="tabela-rolagem">
          <table className="tabela tabela--compacta">
            <thead>
              <tr>
                <th scope="col">Dia</th>
                {tipos.map((tipo) => (
                  <th key={tipo.id} scope="col" className="col-valor">
                    {tipo.nome}
                  </th>
                ))}
                <th scope="col" className="col-valor">Total</th>
              </tr>
            </thead>
            <tbody>
              {colunas.map((coluna, i) => (
                <tr key={coluna.rotulo}>
                  <th scope="row">{coluna.rotulo}</th>
                  {coluna.partes.map((parte) => (
                    <td key={parte.tipoId} className="col-valor">
                      {parte.valor > 0 ? moeda(parte.valor) : <span className="apagado">—</span>}
                    </td>
                  ))}
                  <td className="col-valor col-forte">{moeda(totais[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
