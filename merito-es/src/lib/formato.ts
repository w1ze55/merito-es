// Os mesmos formatos de backend/.../view/Formatos.java, para web e desktop mostrarem os números iguais.

const LOCALE = 'pt-BR'

const moedaFormato = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const precoFormato = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'BRL', minimumFractionDigits: 3, maximumFractionDigits: 3 })
const litrosFormato = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 3, maximumFractionDigits: 3 })
const decimalEdicao = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 0, maximumFractionDigits: 3, useGrouping: false })
const inteiroFormato = new Intl.NumberFormat(LOCALE)
const porcentoFormato = new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 0 })

export const moeda = (valor: number) => moedaFormato.format(valor)
export const precoPorLitro = (valor: number) => precoFormato.format(valor)
export const litros = (valor: number) => `${litrosFormato.format(valor)} L`
export const litrosNumero = (valor: number) => litrosFormato.format(valor)
export const inteiro = (valor: number) => inteiroFormato.format(valor)
export const porcento = (valor: number) => porcentoFormato.format(valor)

// Para preencher um campo de edição: "32,418", sem separador de milhar.
export const decimalParaCampo = (valor: number) => decimalEdicao.format(valor)

// Preço em placa de totem: "6,29" + o milésimo em corpo menor ("9").
export function partesDoPreco(valor: number) {
  const [inteiros, decimais] = valor.toFixed(3).split('.')
  return { principal: `${inteiros},${decimais.slice(0, 2)}`, milesimo: decimais.slice(2) }
}

const doisDigitos = (n: number) => String(n).padStart(2, '0')

// LocalDateTime chega como "2026-10-01T10:30:00" (sem fuso): lido como hora local.
export function lerDataHora(iso: string) {
  const [data, hora = '00:00'] = iso.split('T')
  const [ano, mes, dia] = data.split('-').map(Number)
  const [h, m] = hora.split(':').map(Number)
  return new Date(ano, mes - 1, dia, h, m)
}

export function dataHora(iso: string) {
  const d = lerDataHora(iso)
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}/${d.getFullYear()} ${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`
}

export function diaCurto(d: Date) {
  return `${doisDigitos(d.getDate())}/${doisDigitos(d.getMonth() + 1)}`
}

export function horaMinuto(d: Date) {
  return `${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}:${doisDigitos(d.getSeconds())}`
}

// Valor de <input type="datetime-local">, e também o formato que a API aceita: "2026-10-01T10:30".
export function paraCampoDataHora(d: Date) {
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}T${doisDigitos(d.getHours())}:${doisDigitos(d.getMinutes())}`
}

export function paraCampoData(d: Date) {
  return paraCampoDataHora(d).slice(0, 10)
}

// Lê "1.234,5", "1234,5" ou "1234.5". Devolve null para vazio e NaN para texto que não é número.
export function lerDecimal(texto: string): number | null {
  const limpo = texto.trim().replace(/\s/g, '').replace(/^R\$/, '')
  if (limpo === '') return null
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo
  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) return Number.NaN
  return Number(normalizado)
}
