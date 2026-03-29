export type EstadoOption = {
  id: number
  sigla: string
  nome: string
}

export type CidadeOption = {
  id: number
  nome: string
}

export type CepLookupResult = {
  cep: string
  logradouro?: string
  bairro?: string
  complemento?: string
  cidade?: string
  estado?: string
  ibge?: string
}

type IbgeEstadoResponse = {
  id: number
  sigla: string
  nome: string
}

type IbgeCidadeResponse = {
  id: number
  nome: string
}

type ViaCepResponse = {
  cep?: string
  logradouro?: string
  complemento?: string
  bairro?: string
  localidade?: string
  uf?: string
  ibge?: string
  erro?: boolean
}

const IBGE_BASE_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades'
const VIACEP_BASE_URL = 'https://viacep.com.br/ws'

let estadosCache: EstadoOption[] | null = null
const cidadesCache = new Map<string, CidadeOption[]>()

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Falha ao carregar dados (${response.status})`)
  }

  return (await response.json()) as T
}

export const localidadeService = {
  async listarEstados(): Promise<EstadoOption[]> {
    if (estadosCache) {
      return estadosCache
    }

    const data = await fetchJson<IbgeEstadoResponse[]>(`${IBGE_BASE_URL}/estados`)
    const estados = data
      .map((estado) => ({
        id: estado.id,
        sigla: estado.sigla,
        nome: estado.nome,
      }))
      .sort((a, b) => a.sigla.localeCompare(b.sigla, 'pt-BR'))

    estadosCache = estados
    return estados
  },

  async listarCidadesPorUf(uf: string): Promise<CidadeOption[]> {
    const normalizedUf = uf.trim().toUpperCase()
    if (!normalizedUf) return []

    const cached = cidadesCache.get(normalizedUf)
    if (cached) {
      return cached
    }

    const estados = await this.listarEstados()
    const estado = estados.find((item) => item.sigla === normalizedUf)
    if (!estado) return []

    const data = await fetchJson<IbgeCidadeResponse[]>(
      `${IBGE_BASE_URL}/estados/${estado.id}/municipios`,
    )
    const cidades = data
      .map((cidade) => ({
        id: cidade.id,
        nome: cidade.nome,
      }))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

    cidadesCache.set(normalizedUf, cidades)
    return cidades
  },

  async buscarCep(cep: string): Promise<CepLookupResult | null> {
    const normalizedCep = onlyDigits(cep)
    if (normalizedCep.length !== 8) return null

    const data = await fetchJson<ViaCepResponse>(`${VIACEP_BASE_URL}/${normalizedCep}/json/`)
    if (data.erro) return null

    return {
      cep: data.cep || normalizedCep,
      logradouro: data.logradouro || undefined,
      bairro: data.bairro || undefined,
      complemento: data.complemento || undefined,
      cidade: data.localidade || undefined,
      estado: data.uf || undefined,
      ibge: data.ibge || undefined,
    }
  },
}
