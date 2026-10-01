import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import type { Abastecimento, TipoCombustivel } from '../api/types'
import { useCadastro } from '../api/useCadastro'
import { ApiForaDoAr, CadeiaDeCadastro } from '../components/Estados'
import { GraficoDiario, type Coluna } from '../components/GraficoDiario'
import { Icone } from '../components/Icone'
import { Combustivel, Tinteiro } from '../components/Preco'
import { Folha, Tela } from '../components/Tela'
import { dataHora, diaCurto, inteiro, lerDataHora, litros, moeda, porcento } from '../lib/formato'

const PERIODOS = [
  { id: 'hoje', rotulo: 'Hoje', dias: 1 },
  { id: '7d', rotulo: '7 dias', dias: 7 },
  { id: '30d', rotulo: '30 dias', dias: 30 },
  { id: 'tudo', rotulo: 'Tudo', dias: null },
] as const

type Soma = { quantidade: number; litros: number; valor: number }
const somaVazia = (): Soma => ({ quantidade: 0, litros: 0, valor: 0 })

function somar(soma: Soma, item: Abastecimento) {
  soma.quantidade += 1
  soma.litros += item.litros
  soma.valor += item.valorTotal
}

function inicioDoDia(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function chaveDoDia(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

// Uma coluna por dia do período, com o valor de cada combustível empilhado.
function colunasPorDia(itens: Abastecimento[], tipos: TipoCombustivel[], inicio: Date, fim: Date): Coluna[] {
  const porDia = new Map<string, Map<number, number>>()
  for (const item of itens) {
    const chave = chaveDoDia(lerDataHora(item.dataAbastecimento))
    const dia = porDia.get(chave) ?? new Map<number, number>()
    dia.set(item.bomba.tipoCombustivel.id, (dia.get(item.bomba.tipoCombustivel.id) ?? 0) + item.valorTotal)
    porDia.set(chave, dia)
  }
  const colunas: Coluna[] = []
  for (const d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
    const dia = porDia.get(chaveDoDia(d))
    colunas.push({
      rotulo: diaCurto(d),
      partes: tipos.map((tipo) => ({ tipoId: tipo.id, valor: dia?.get(tipo.id) ?? 0 })),
    })
  }
  return colunas
}

export function VisaoGeral() {
  const { tipos, bombas, abastecimentos, tintaDe, carregando, apiForaDoAr, semConexao, recarregar } = useCadastro()
  const [params, setParams] = useSearchParams()
  const periodo = PERIODOS.find((item) => item.id === params.get('periodo')) ?? PERIODOS[2]
  const [hoje] = useState(() => inicioDoDia(new Date()))

  const resumo = useMemo(() => {
    const datas = abastecimentos.map((item) => lerDataHora(item.dataAbastecimento))
    const maisAntigo = datas.reduce((menor, d) => (d < menor ? d : menor), hoje)
    const inicio = periodo.dias === null ? inicioDoDia(maisAntigo) : new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - (periodo.dias - 1))
    const itens = abastecimentos.filter((_, i) => datas[i] >= inicio)

    const total = somaVazia()
    const porTipo = new Map<number, Soma>()
    const porBomba = new Map<number, Soma & { ultimo: string | null }>()
    for (const item of itens) {
      somar(total, item)
      const tipo = porTipo.get(item.bomba.tipoCombustivel.id) ?? somaVazia()
      somar(tipo, item)
      porTipo.set(item.bomba.tipoCombustivel.id, tipo)
      const bomba = porBomba.get(item.bomba.id) ?? { ...somaVazia(), ultimo: null }
      somar(bomba, item)
      if (!bomba.ultimo || item.dataAbastecimento > bomba.ultimo) bomba.ultimo = item.dataAbastecimento
      porBomba.set(item.bomba.id, bomba)
    }

    // Mais de dois meses vira gráfico ilegível por dia: limita o gráfico aos últimos 62 dias.
    // O eixo começa no primeiro registro do período: dias antes de qualquer movimento só gastariam largura.
    const primeiroNoPeriodo = itens.reduce((menor, item) => {
      const d = inicioDoDia(lerDataHora(item.dataAbastecimento))
      return d < menor ? d : menor
    }, hoje)
    const inicioGrafico = new Date(Math.max(inicio.getTime(), primeiroNoPeriodo.getTime(), new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 61).getTime()))
    const tiposComVenda = tipos.filter((tipo) => porTipo.has(tipo.id))
    return {
      total,
      porTipo,
      porBomba,
      colunas: colunasPorDia(itens, tiposComVenda, inicioGrafico, hoje),
      tiposComVenda,
      graficoCortado: inicioGrafico > primeiroNoPeriodo,
    }
  }, [abastecimentos, tipos, periodo.dias, hoje])

  const vazio = !carregando && abastecimentos.length === 0
  const semVendasNoPeriodo = !vazio && resumo.total.quantidade === 0
  const tiposOrdenados = [...tipos].sort((a, b) => (resumo.porTipo.get(b.id)?.valor ?? 0) - (resumo.porTipo.get(a.id)?.valor ?? 0))

  function escolherPeriodo(id: string) {
    setParams(id === PERIODOS[2].id ? {} : { periodo: id }, { replace: true })
  }


  if (semConexao) {
    return (
      <Tela titulo="Visão geral">
        <ApiForaDoAr aoTentar={recarregar} />
      </Tela>
    )
  }
  return (
    <Tela
      titulo="Visão geral"
      resumo={
        resumo.total.quantidade > 0 && (
          <>
            <strong>{moeda(resumo.total.valor)}</strong> em {inteiro(resumo.total.quantidade)} {resumo.total.quantidade === 1 ? 'abastecimento' : 'abastecimentos'} · {litros(resumo.total.litros)}
          </>
        )
      }
    >
      {apiForaDoAr && <ApiForaDoAr aoTentar={recarregar} />}

      {vazio && !apiForaDoAr ? (
        <CadeiaDeCadastro />
      ) : (
        <>
          <div className="periodo" role="radiogroup" aria-label="Período">
            {PERIODOS.map((item) => (
              <label key={item.id} className="periodo__opcao">
                <input type="radio" name="periodo" checked={periodo.id === item.id} onChange={() => escolherPeriodo(item.id)} />
                <span>{item.rotulo}</span>
              </label>
            ))}
          </div>

          {semVendasNoPeriodo && (
            <div className="aviso aviso--falta">
              <Icone nome="alerta" tamanho={18} />
              <p>Nenhum abastecimento {periodo.id === 'hoje' ? 'hoje' : `nos últimos ${periodo.rotulo}`}.</p>
              <button type="button" className="aviso__acao" onClick={() => escolherPeriodo('tudo')}>
                Ver tudo <Icone nome="seta" tamanho={16} />
              </button>
            </div>
          )}

          <Folha id="por-combustivel" titulo="Vendas por combustível">
            <div className="tabela-rolagem">
              <table className="tabela tabela--participacao">
                <thead>
                  <tr>
                    <th scope="col">Combustível</th>
                    <th scope="col" className="col-valor">Abastecimentos</th>
                    <th scope="col" className="col-valor">Litros</th>
                    <th scope="col" className="col-valor">Valor</th>
                    <th scope="col" className="col-participacao">Participação no valor</th>
                  </tr>
                </thead>
                <tbody>
                  {tiposOrdenados.map((tipo) => {
                    const soma = resumo.porTipo.get(tipo.id) ?? somaVazia()
                    const parte = resumo.total.valor > 0 ? soma.valor / resumo.total.valor : 0
                    const tinta = tintaDe(tipo.id)
                    return (
                      <tr key={tipo.id}>
                        <td><Combustivel nome={tipo.nome} tinta={tinta} /></td>
                        <td className="col-valor" data-rotulo="Abastecimentos">{soma.quantidade === 0 ? <span className="apagado">nenhum</span> : inteiro(soma.quantidade)}</td>
                        <td className="col-valor">{soma.quantidade === 0 ? <span className="apagado">{litros(0)}</span> : litros(soma.litros)}</td>
                        <td className="col-valor col-forte">{soma.quantidade === 0 ? <span className="apagado">{moeda(0)}</span> : moeda(soma.valor)}</td>
                        <td className="col-participacao">
                          <span className="participacao">
                            <span className="participacao__trilho">
                              <span className="participacao__barra" style={{ width: `${parte * 100}%`, background: tinta.fundo }} />
                            </span>
                            <span className="participacao__numero">{porcento(parte)}</span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {resumo.total.quantidade > 0 && (
                  <tfoot>
                    <tr>
                      <th scope="row">Total</th>
                      <td className="col-valor" data-rotulo="Abastecimentos">{inteiro(resumo.total.quantidade)}</td>
                      <td className="col-valor">{litros(resumo.total.litros)}</td>
                      <td className="col-valor">{moeda(resumo.total.valor)}</td>
                      <td className="col-participacao" />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Folha>

          {resumo.total.quantidade > 0 && (
            <Folha
              id="por-dia"
              titulo="Valor vendido por dia"
              extra={
                <ul className="legenda" aria-label="Legenda">
                  {resumo.tiposComVenda.map((tipo) => (
                    <li key={tipo.id}>
                      <Tinteiro tinta={tintaDe(tipo.id)} />
                      {tipo.nome}
                    </li>
                  ))}
                </ul>
              }
            >
              <GraficoDiario colunas={resumo.colunas} tipos={resumo.tiposComVenda} tintaDe={tintaDe} />
              {resumo.graficoCortado && <p className="folha__rodape">O gráfico mostra os últimos 62 dias; as tabelas consideram o período inteiro.</p>}
            </Folha>
          )}

          <Folha id="por-bomba" titulo="Por bomba">
            <div className="tabela-rolagem">
              <table className="tabela tabela--por-bomba">
                <thead>
                  <tr>
                    <th scope="col">Bomba</th>
                    <th scope="col">Combustível</th>
                    <th scope="col" className="col-valor">Abastecimentos</th>
                    <th scope="col" className="col-valor">Litros</th>
                    <th scope="col" className="col-valor">Valor</th>
                    <th scope="col" className="col-data">Último</th>
                  </tr>
                </thead>
                <tbody>
                  {bombas.length === 0 && (
                    <tr className="linha-vazia">
                      <td colSpan={6}>
                        Nenhuma bomba cadastrada. <Link to="/bombas">Cadastrar bomba</Link>
                      </td>
                    </tr>
                  )}
                  {[...bombas]
                    .sort((a, b) => (resumo.porBomba.get(b.id)?.valor ?? 0) - (resumo.porBomba.get(a.id)?.valor ?? 0))
                    .map((bomba) => {
                      const soma = resumo.porBomba.get(bomba.id)
                      return (
                        <tr key={bomba.id}>
                          <td className="col-forte">{bomba.nome}</td>
                          <td><Combustivel nome={bomba.tipoCombustivel.nome} tinta={tintaDe(bomba.tipoCombustivel.id)} /></td>
                          <td className="col-valor" data-rotulo="Abastecimentos">{soma ? inteiro(soma.quantidade) : <span className="apagado">nenhum</span>}</td>
                          <td className="col-valor">{soma ? litros(soma.litros) : <span className="apagado">{litros(0)}</span>}</td>
                          <td className="col-valor col-forte">{soma ? moeda(soma.valor) : <span className="apagado">{moeda(0)}</span>}</td>
                          <td className="col-data" data-rotulo="Último">{soma?.ultimo ? dataHora(soma.ultimo) : <span className="apagado">sem movimento</span>}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </Folha>
        </>
      )}
    </Tela>
  )
}
