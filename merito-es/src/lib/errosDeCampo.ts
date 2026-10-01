import { ApiError } from '../api/client'

// A API devolve as mensagens de validação sem o nome do campo (ProblemDetail.erros).
// Aqui cada mensagem vai para o campo de que ela fala; o que sobrar aparece no formulário.

const REGRAS: [RegExp, string][] = [
  [/tipo de combust[ií]vel da bomba/i, 'tipoCombustivelId'],
  [/bomba do abastecimento|^Bomba .* n[ãa]o encontrada/i, 'bombaId'],
  [/^Tipo de combust[ií]vel .* n[ãa]o encontrado/i, 'tipoCombustivelId'],
  [/data do abastecimento/i, 'dataAbastecimento'],
  [/litros/i, 'litros'],
  [/pre[çc]o por litro/i, 'precoPorLitro'],
  [/nome/i, 'nome'],
]

export type ErrosDeCampo = { campos: Record<string, string>; gerais: string[] }

export function errosDeCampo(erro: unknown, camposDoFormulario: string[]): ErrosDeCampo {
  if (!(erro instanceof ApiError)) {
    return { campos: {}, gerais: erro ? ['Ocorreu um erro inesperado.'] : [] }
  }
  if (erro.tipo === 'fora-do-ar') {
    return { campos: {}, gerais: ['A API não respondeu. Verifique se ela está rodando e tente de novo.'] }
  }

  const campos: Record<string, string> = {}
  const gerais: string[] = []
  for (const mensagem of erro.mensagens) {
    const campo = REGRAS.find(([padrao, nome]) => camposDoFormulario.includes(nome) && padrao.test(mensagem))?.[1]
    if (campo && !campos[campo]) {
      campos[campo] = mensagem
    } else {
      gerais.push(mensagem)
    }
  }
  return { campos, gerais }
}
