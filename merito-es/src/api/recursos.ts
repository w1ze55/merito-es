import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { api } from './client'
import type {
  Abastecimento,
  AbastecimentoRequest,
  BombaCombustivel,
  BombaCombustivelRequest,
  TipoCombustivel,
  TipoCombustivelRequest,
} from './types'

export const chaves = {
  tipos: ['tipos-combustivel'],
  bombas: ['bombas'],
  abastecimentos: ['abastecimentos'],
} satisfies Record<string, QueryKey>

type Salvar<TReq> = { id: number | null; dados: TReq }

// Cada recurso tem a mesma forma (listar, criar/atualizar, excluir).
// `invalida` segue as respostas aninhadas: a bomba traz o combustível, o abastecimento traz a bomba.
function recurso<T, TReq>(caminho: string, chave: QueryKey, invalida: QueryKey[]) {
  function useLista() {
    return useQuery({ queryKey: chave, queryFn: () => api.get<T[]>(caminho) })
  }

  function useSalvar() {
    const cliente = useQueryClient()
    return useMutation({
      mutationFn: ({ id, dados }: Salvar<TReq>) =>
        id === null ? api.post<T>(caminho, dados) : api.put<T>(`${caminho}/${id}`, dados),
      onSuccess: () => Promise.all([chave, ...invalida].map((queryKey) => cliente.invalidateQueries({ queryKey }))),
    })
  }

  function useExcluir() {
    const cliente = useQueryClient()
    return useMutation({
      mutationFn: (id: number) => api.delete(`${caminho}/${id}`),
      onSuccess: () => Promise.all([chave, ...invalida].map((queryKey) => cliente.invalidateQueries({ queryKey }))),
    })
  }

  return { useLista, useSalvar, useExcluir }
}

export const tiposCombustivel = recurso<TipoCombustivel, TipoCombustivelRequest>(
  '/api/tipos-combustivel',
  chaves.tipos,
  [chaves.bombas, chaves.abastecimentos],
)

export const bombas = recurso<BombaCombustivel, BombaCombustivelRequest>('/api/bombas', chaves.bombas, [
  chaves.abastecimentos,
])

export const abastecimentos = recurso<Abastecimento, AbastecimentoRequest>(
  '/api/abastecimentos',
  chaves.abastecimentos,
  [],
)
