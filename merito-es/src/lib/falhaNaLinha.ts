import { ApiError } from '../api/client'

// Mensagem da API presa à linha que a provocou, como a recusa de exclusão (409).
export type FalhaNaLinha = { id: number; mensagens: string[] }

export function falhaDe(id: number, erro: unknown): FalhaNaLinha {
  return { id, mensagens: erro instanceof ApiError ? erro.mensagens : ['Não foi possível excluir. Tente de novo.'] }
}
