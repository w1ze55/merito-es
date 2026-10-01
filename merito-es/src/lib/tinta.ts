import type { TipoCombustivel } from '../api/types'

// Cada combustível tem uma tinta fixa, usada em todo lugar onde ele aparece:
// faixa da placa, bomba, histórico e totais. A família vem do nome; um segundo
// combustível da mesma família, ou um nome sem família, recebe a próxima tinta avulsa.
// Paleta validada (contraste por daltonismo entre vizinhas) com o validador do skill de dataviz.

export type Tinta = { fundo: string; texto: string }

const ESCURO = '#101614'
const CLARO = '#ffffff'

const FAMILIAS: { padrao: RegExp; tinta: Tinta }[] = [
  { padrao: /aditivad|premium|podium|v-?power/i, tinta: { fundo: '#2557c4', texto: CLARO } },
  { padrao: /etanol|[aá]lcool/i, tinta: { fundo: '#1f7f45', texto: CLARO } },
  { padrao: /diesel|s-?10|s-?500/i, tinta: { fundo: '#e0a419', texto: ESCURO } },
  { padrao: /gnv|g[aá]s natural/i, tinta: { fundo: '#14968a', texto: ESCURO } },
  { padrao: /gasolina/i, tinta: { fundo: '#c93a2b', texto: CLARO } },
]

const AVULSAS: Tinta[] = [
  { fundo: '#9a4fd0', texto: CLARO },
  { fundo: '#14968a', texto: ESCURO },
]

export const TINTA_NEUTRA: Tinta = { fundo: '#5b676e', texto: CLARO }

const CHAVE = 'posto:tintas'

function lerAtribuicoes(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? '{}') as Record<number, string>
  } catch {
    return {}
  }
}

function gravarAtribuicoes(atribuicoes: Record<number, string>) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(atribuicoes))
  } catch {
    // Sem armazenamento local as tintas continuam valendo nesta visita.
  }
}

const PALETA = [...FAMILIAS.map((familia) => familia.tinta), ...AVULSAS, TINTA_NEUTRA]

// A tinta, uma vez dada, fica com o combustível: excluir ou cadastrar outro não repinta os que existem.
// `fixar: false` calcula sem gravar (prévia de um combustível que ainda não existe).
export function mapaDeTintas(tipos: TipoCombustivel[], fixar = true) {
  const gravadas = lerAtribuicoes()
  const mapa = new Map<number, Tinta>()
  const usadas = new Set<string>()
  const ordenados = [...tipos].sort((a, b) => a.id - b.id)

  // Primeiro honra o que já foi atribuído; só depois distribui para os novos.
  for (const tipo of ordenados) {
    const tinta = PALETA.find((item) => item.fundo === gravadas[tipo.id])
    if (tinta && (tinta === TINTA_NEUTRA || !usadas.has(tinta.fundo))) {
      mapa.set(tipo.id, tinta)
      usadas.add(tinta.fundo)
    }
  }
  for (const tipo of ordenados) {
    if (mapa.has(tipo.id)) continue
    const familia = FAMILIAS.find((item) => item.padrao.test(tipo.nome))?.tinta
    const tinta = familia && !usadas.has(familia.fundo) ? familia : (AVULSAS.find((item) => !usadas.has(item.fundo)) ?? TINTA_NEUTRA)
    usadas.add(tinta.fundo)
    mapa.set(tipo.id, tinta)
  }

  if (fixar && tipos.length > 0) {
    gravarAtribuicoes(Object.fromEntries(ordenados.map((tipo) => [tipo.id, mapa.get(tipo.id)!.fundo])))
  }
  return mapa
}
