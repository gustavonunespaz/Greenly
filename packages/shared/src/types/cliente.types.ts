export interface ClienteDTO {
  id: string
  consultoriaId: string
  nome: string
  cnpj: string
  email?: string | null
  telefone?: string | null
  setor?: string | null
  cnae?: string | null
  ativo: boolean
  cep?: string | null
  logradouro?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  criadoEm: string | Date
}

export interface CreateClienteDTO {
  nome: string
  cnpj: string
  email?: string
  telefone?: string
  setor?: string
  cnae?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}
