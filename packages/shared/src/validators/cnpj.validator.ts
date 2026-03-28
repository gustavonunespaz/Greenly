/** Valida CNPJ incluindo dígitos verificadores */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return false
  if (/^(\d)\1+$/.test(cleaned)) return false

  const calcDigit = (slice: string, weights: number[]) =>
    slice.split('').reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0)

  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2]
  const r1 = calcDigit(cleaned.slice(0,12), w1) % 11
  const d1 = r1 < 2 ? 0 : 11 - r1

  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]
  const r2 = calcDigit(cleaned.slice(0,13), w2) % 11
  const d2 = r2 < 2 ? 0 : 11 - r2

  return parseInt(cleaned[12]) === d1 && parseInt(cleaned[13]) === d2
}
