import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { ApiError } from '../api/client'
import { carregarDadosDeExemplo, type Progresso } from './dadosDeExemplo'

export function useDadosDeExemplo() {
  const cliente = useQueryClient()
  const [progresso, setProgresso] = useState<Progresso | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    setErro(null)
    setProgresso({ etapa: 'Conferindo o que já existe', feito: 0, total: 1 })
    try {
      await carregarDadosDeExemplo(setProgresso)
    } catch (e) {
      setErro(e instanceof ApiError ? e.mensagens.join(' ') : 'Não foi possível carregar os dados de exemplo.')
    } finally {
      setProgresso(null)
      await cliente.invalidateQueries()
    }
  }

  return { carregar, progresso, carregando: progresso !== null, erro }
}
