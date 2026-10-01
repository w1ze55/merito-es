// Espelham os records de backend/src/main/java/com/merito_es/merito/dto.
// BigDecimal chega como número; LocalDateTime chega e vai como texto ISO sem fuso.

export type TipoCombustivel = {
  id: number
  nome: string
  precoPorLitro: number
}

export type TipoCombustivelRequest = {
  nome: string
  precoPorLitro: number | null
}

export type BombaCombustivel = {
  id: number
  nome: string
  tipoCombustivel: TipoCombustivel
}

export type BombaCombustivelRequest = {
  nome: string
  tipoCombustivelId: number | null
}

export type Abastecimento = {
  id: number
  bomba: BombaCombustivel
  dataAbastecimento: string
  litros: number
  valorTotal: number
}

export type AbastecimentoRequest = {
  bombaId: number | null
  dataAbastecimento: string | null
  litros: number | null
}
