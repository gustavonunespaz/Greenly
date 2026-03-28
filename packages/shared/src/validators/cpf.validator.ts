/** Valida CPF incluindo dígitos verificadores */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  if (/^(\d)\1+$/.test(cleaned)) return false

  const calcDigit = (slice: string, len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(slice[i]) * (len + 1 - i)
    const rem = (sum * 10) % 11
    return rem >= 10 ? 0 : rem
  }

  return calcDigit(cleaned, 9) === parseInt(cleaned[9]) &&
         calcDigit(cleaned, 10) === parseInt(cleaned[10])
}
