// Prévia do valor total com a mesma regra de AbastecimentoService.calcularValorTotal:
// preço × litros, arredondado para 2 casas com HALF_UP. Feito em inteiros para não herdar erro de ponto flutuante.

const milesimos = (valor: number) => BigInt(Math.round(valor * 1000))

export function calcularValorTotal(precoPorLitro: number, litros: number) {
  const produto = milesimos(precoPorLitro) * milesimos(litros) // em milionésimos de real
  const centavos = (produto + 5000n) / 10000n
  return Number(centavos) / 100
}
