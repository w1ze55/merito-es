import { api } from '../api/client'
import type { BombaCombustivel, TipoCombustivel } from '../api/types'
import { paraCampoDataHora } from '../lib/formato'

// Dados fictícios para quem abre o projeto com o banco vazio.
// Tudo passa pela própria API REST, então as validações e regras do backend valem aqui também.

const COMBUSTIVEIS = [
  { nome: 'Gasolina comum', precoPorLitro: 6.299 },
  { nome: 'Gasolina aditivada', precoPorLitro: 6.499 },
  { nome: 'Etanol', precoPorLitro: 4.199 },
  { nome: 'Diesel S10', precoPorLitro: 6.099 },
]

const BOMBAS = [
  { nome: 'Bomba 01', combustivel: 'Gasolina comum', peso: 5 },
  { nome: 'Bomba 02', combustivel: 'Gasolina aditivada', peso: 2 },
  { nome: 'Bomba 03', combustivel: 'Etanol', peso: 4 },
  { nome: 'Bomba 04', combustivel: 'Gasolina comum', peso: 4 },
  { nome: 'Bomba 05', combustivel: 'Etanol', peso: 3 },
  { nome: 'Bomba 06', combustivel: 'Diesel S10', peso: 2 },
]

export const TOTAL_ABASTECIMENTOS = 42
const DIAS = 14

export const RESUMO_DADOS_DE_EXEMPLO = `${COMBUSTIVEIS.length} combustíveis, ${BOMBAS.length} bombas e ${TOTAL_ABASTECIMENTOS} abastecimentos dos últimos ${DIAS} dias`

export type Progresso = { etapa: string; feito: number; total: number }

// Gerador pseudoaleatório com semente fixa: os mesmos dados a cada carga.
function sorteador(semente: number) {
  let estado = semente >>> 0
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0
    let t = estado
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const mesmoNome = (a: string, b: string) => a.trim().toLocaleLowerCase('pt-BR') === b.trim().toLocaleLowerCase('pt-BR')

export async function carregarDadosDeExemplo(aoProgredir: (progresso: Progresso) => void) {
  const total = COMBUSTIVEIS.length + BOMBAS.length + TOTAL_ABASTECIMENTOS
  let feito = 0
  const avancar = (etapa: string) => aoProgredir({ etapa, feito: ++feito, total })

  // Reaproveita o que já existe com o mesmo nome em vez de esbarrar na regra de nome único.
  const tiposExistentes = await api.get<TipoCombustivel[]>('/api/tipos-combustivel')
  const tipos = new Map<string, TipoCombustivel>()
  for (const combustivel of COMBUSTIVEIS) {
    const existente = tiposExistentes.find((tipo) => mesmoNome(tipo.nome, combustivel.nome))
    tipos.set(combustivel.nome, existente ?? (await api.post<TipoCombustivel>('/api/tipos-combustivel', combustivel)))
    avancar('Cadastrando combustíveis')
  }

  const bombasExistentes = await api.get<BombaCombustivel[]>('/api/bombas')
  const bombas: { bomba: BombaCombustivel; peso: number }[] = []
  for (const item of BOMBAS) {
    const existente = bombasExistentes.find((bomba) => mesmoNome(bomba.nome, item.nome))
    const bomba =
      existente ??
      (await api.post<BombaCombustivel>('/api/bombas', { nome: item.nome, tipoCombustivelId: tipos.get(item.combustivel)!.id }))
    bombas.push({ bomba, peso: item.peso })
    avancar('Cadastrando bombas')
  }

  const sortear = sorteador(2026)
  const pesoTotal = bombas.reduce((soma, item) => soma + item.peso, 0)
  const escolherBomba = () => {
    let alvo = sortear() * pesoTotal
    for (const item of bombas) {
      alvo -= item.peso
      if (alvo <= 0) return item.bomba
    }
    return bombas[0].bomba
  }

  const agora = new Date()
  const pedidos = Array.from({ length: TOTAL_ABASTECIMENTOS }, (_, i) => {
    const bomba = escolherBomba()
    const diesel = /diesel/i.test(bomba.tipoCombustivel.nome)
    const litros = diesel ? 40 + sortear() * 140 : 12 + sortear() * 43
    const data = new Date(agora)
    data.setDate(data.getDate() - Math.floor((i / TOTAL_ABASTECIMENTOS) * DIAS))
    data.setHours(6 + Math.floor(sortear() * 16), Math.floor(sortear() * 60), 0, 0)
    // @PastOrPresent: nada pode ficar depois de agora.
    if (data > agora) data.setDate(data.getDate() - 1)
    return { bombaId: bomba.id, dataAbastecimento: paraCampoDataHora(data), litros: Math.round(litros * 1000) / 1000 }
  })

  // Quatro por vez, para o letreiro mostrar o fluxo sem enfileirar 42 chamadas de uma só vez.
  for (let i = 0; i < pedidos.length; i += 4) {
    await Promise.all(
      pedidos.slice(i, i + 4).map(async (pedido) => {
        await api.post('/api/abastecimentos', pedido)
        avancar('Registrando abastecimentos')
      }),
    )
  }

  marcarDadosDeExemplo()
}

const MARCA = 'posto:dados-de-exemplo'

function marcarDadosDeExemplo() {
  try {
    localStorage.setItem(MARCA, new Date().toISOString())
  } catch {
    // Sem armazenamento local, só não mostramos a etiqueta.
  }
}

export function temDadosDeExemplo() {
  try {
    return localStorage.getItem(MARCA) !== null
  } catch {
    return false
  }
}
