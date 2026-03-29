import api from '@/lib/api'
import {
  ClienteResponseDTO,
  CriarClienteDTO,
  CriarInstalacaoDTO,
  InstalacaoResponseDTO,
  AtualizarClienteDTO,
} from '@greenly/shared'

export type CnpjLookupResponseDTO = {
  cnpj: string
  razaoSocial?: string
  nomeFantasia?: string
  email?: string
  telefone?: string
  cnae?: string
  cnaeDescricao?: string
  cep?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  situacaoCadastral?: string
  dataSituacaoCadastral?: string
  porte?: string
  naturezaJuridica?: string
}

export const clienteService = {
  async listar(): Promise<ClienteResponseDTO[]> {
    const { data } = await api.get<ClienteResponseDTO[]>('/clientes')
    return data
  },

  async criar(dto: CriarClienteDTO): Promise<ClienteResponseDTO> {
    const { data } = await api.post<ClienteResponseDTO>('/clientes', dto)
    return data
  },

  async atualizar(id: string, dto: AtualizarClienteDTO): Promise<ClienteResponseDTO> {
    const { data } = await api.patch<ClienteResponseDTO>(`/clientes/${id}`, dto)
    return data
  },

  async remover(id: string): Promise<void> {
    await api.delete(`/clientes/${id}`)
  },

  async criarInstalacao(dto: CriarInstalacaoDTO): Promise<InstalacaoResponseDTO> {
    const { data } = await api.post<InstalacaoResponseDTO>('/clientes/instalacoes', dto)
    return data
  },

  async buscarCnpj(cnpj: string): Promise<CnpjLookupResponseDTO> {
    const normalizedCnpj = cnpj.replace(/\D/g, '')
    const { data } = await api.get<CnpjLookupResponseDTO>(`/clientes/cnpj/${normalizedCnpj}`)
    return data
  },
}
