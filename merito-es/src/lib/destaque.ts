import { useSyncExternalStore } from 'react'

// O registro em que se acabou de mexer, por cadastro. Fica aceso até a próxima ação ou troca de tela,
// e o totem lê o mesmo valor para acender a placa do combustível salvo.

export type Cadastro = 'combustivel' | 'bomba' | 'abastecimento'

let atual: { cadastro: Cadastro; id: number } | null = null
const ouvintes = new Set<() => void>()

function avisar() {
  ouvintes.forEach((ouvinte) => ouvinte())
}

export function destacar(cadastro: Cadastro, id: number | null) {
  atual = id === null ? null : { cadastro, id }
  avisar()
}

export function apagarDestaque() {
  if (atual === null) return
  atual = null
  avisar()
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte)
  return () => ouvintes.delete(ouvinte)
}

export function useDestaque(cadastro: Cadastro) {
  const valor = useSyncExternalStore(assinar, () => atual)
  return [valor?.cadastro === cadastro ? valor.id : null, (id: number | null) => destacar(cadastro, id)] as const
}
