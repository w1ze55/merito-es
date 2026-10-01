import { useSyncExternalStore } from 'react'

// Registro em memória de cada chamada à API, exibido no letreiro do totem.

export type Chamada = {
  id: number
  metodo: string
  caminho: string
  status: number | null
  ms: number
  em: Date
  titulo?: string
  detalhe?: string
  erros?: string[]
}

const LIMITE = 120

let chamadas: Chamada[] = []
let proximoId = 1
const ouvintes = new Set<() => void>()

export function registrarChamada(chamada: Omit<Chamada, 'id'>) {
  chamadas = [{ ...chamada, id: proximoId++ }, ...chamadas].slice(0, LIMITE)
  ouvintes.forEach((ouvinte) => ouvinte())
}

export function limparRegistro() {
  chamadas = []
  ouvintes.forEach((ouvinte) => ouvinte())
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

export function useChamadas() {
  return useSyncExternalStore(assinar, () => chamadas)
}
