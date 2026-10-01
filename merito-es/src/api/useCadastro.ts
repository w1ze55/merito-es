import { useMemo } from 'react'
import { mapaDeTintas, TINTA_NEUTRA } from '../lib/tinta'
import { foraDoAr } from './client'
import { abastecimentos, bombas, tiposCombustivel } from './recursos'

// As três listas juntas, com o que as telas derivam delas: tintas, contagens e estado da API.
export function useCadastro() {
  const tipos = tiposCombustivel.useLista()
  const listaBombas = bombas.useLista()
  const listaAbastecimentos = abastecimentos.useLista()

  const dadosTipos = tipos.data
  const dadosBombas = listaBombas.data
  const dadosAbastecimentos = listaAbastecimentos.data

  const derivados = useMemo(() => {
    const tintas = mapaDeTintas(dadosTipos ?? [])
    const bombasPorTipo = new Map<number, number>()
    for (const bomba of dadosBombas ?? []) {
      bombasPorTipo.set(bomba.tipoCombustivel.id, (bombasPorTipo.get(bomba.tipoCombustivel.id) ?? 0) + 1)
    }
    const abastecimentosPorBomba = new Map<number, number>()
    for (const item of dadosAbastecimentos ?? []) {
      abastecimentosPorBomba.set(item.bomba.id, (abastecimentosPorBomba.get(item.bomba.id) ?? 0) + 1)
    }
    return {
      tintaDe: (tipoId: number) => tintas.get(tipoId) ?? TINTA_NEUTRA,
      bombasPorTipo,
      abastecimentosPorBomba,
    }
  }, [dadosTipos, dadosBombas, dadosAbastecimentos])

  const consultas = [tipos, listaBombas, listaAbastecimentos]

  return {
    tipos: dadosTipos ?? [],
    bombas: dadosBombas ?? [],
    abastecimentos: dadosAbastecimentos ?? [],
    ...derivados,
    carregando: consultas.some((consulta) => consulta.isPending),
    apiForaDoAr: consultas.some((consulta) => foraDoAr(consulta.error)),
    // Sem conexão e sem nada carregado: não dá para afirmar que os cadastros estão vazios.
    semConexao: consultas.some((consulta) => foraDoAr(consulta.error)) && consultas.every((consulta) => consulta.data === undefined),
    erro: consultas.find((consulta) => consulta.error)?.error ?? null,
    recarregar: () => consultas.forEach((consulta) => consulta.refetch()),
  }
}
