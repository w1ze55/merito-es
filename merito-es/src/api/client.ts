import { registrarChamada } from './registro'

export type TipoErro = 'fora-do-ar' | 'dados-invalidos' | 'regra-de-negocio' | 'nao-encontrado' | 'http'

// Erro da API já traduzido do ProblemDetail (RFC 7807) que o ApiExceptionHandler devolve.
export class ApiError extends Error {
  status: number | null
  tipo: TipoErro
  titulo: string
  erros: string[]

  constructor(status: number | null, tipo: TipoErro, titulo: string, detalhe: string, erros: string[] = []) {
    super(detalhe)
    this.name = 'ApiError'
    this.status = status
    this.tipo = tipo
    this.titulo = titulo
    this.erros = erros
  }

  // Mensagens que o usuário precisa ler: a lista de validação ou o detalhe.
  get mensagens() {
    return this.erros.length > 0 ? this.erros : [this.message]
  }
}

type Problema = {
  title?: string
  detail?: string
  error?: string
  erros?: string[]
}

function tipoPorStatus(status: number): TipoErro {
  if (status === 400) return 'dados-invalidos'
  if (status === 404) return 'nao-encontrado'
  if (status === 409) return 'regra-de-negocio'
  return 'http'
}

async function lerJson(resposta: Response): Promise<unknown> {
  const tipo = resposta.headers.get('content-type') ?? ''
  if (!tipo.includes('json')) return null
  try {
    return await resposta.json()
  } catch {
    return null
  }
}

async function requisicao<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const inicio = performance.now()
  const em = new Date()
  let resposta: Response

  try {
    resposta = await fetch(caminho, {
      method: metodo,
      headers: corpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    })
  } catch {
    const erro = new ApiError(null, 'fora-do-ar', 'API fora do ar', 'Não foi possível conectar à API.')
    registrarChamada({ metodo, caminho, status: null, ms: Math.round(performance.now() - inicio), em, titulo: erro.titulo, detalhe: erro.message })
    throw erro
  }

  const dados = await lerJson(resposta)
  const ms = Math.round(performance.now() - inicio)

  if (resposta.ok) {
    registrarChamada({ metodo, caminho, status: resposta.status, ms, em })
    return dados as T
  }

  // Sem JSON num 5xx: é o proxy do Vite (ou o CloudFront) avisando que o Spring não respondeu.
  if (dados === null && resposta.status >= 500) {
    const erro = new ApiError(resposta.status, 'fora-do-ar', 'API fora do ar', 'A API não respondeu.')
    registrarChamada({ metodo, caminho, status: resposta.status, ms, em, titulo: erro.titulo, detalhe: erro.message })
    throw erro
  }

  const problema = (dados ?? {}) as Problema
  const titulo = problema.title ?? problema.error ?? `Erro ${resposta.status}`
  const detalhe = problema.detail ?? 'A API recusou a operação.'
  const erro = new ApiError(resposta.status, tipoPorStatus(resposta.status), titulo, detalhe, problema.erros ?? [])
  registrarChamada({ metodo, caminho, status: resposta.status, ms, em, titulo, detalhe, erros: problema.erros })
  throw erro
}

export const api = {
  get: <T>(caminho: string) => requisicao<T>('GET', caminho),
  post: <T>(caminho: string, corpo: unknown) => requisicao<T>('POST', caminho, corpo),
  put: <T>(caminho: string, corpo: unknown) => requisicao<T>('PUT', caminho, corpo),
  delete: (caminho: string) => requisicao<void>('DELETE', caminho),
}

export function foraDoAr(erro: unknown) {
  return erro instanceof ApiError && erro.tipo === 'fora-do-ar'
}
