import api from '@/lib/api'
import { ClienteResponseDTO, CriarClienteDTO, CriarInstalacaoDTO, InstalacaoResponseDTO } from '@greenly/shared'

export const clienteService = {
  async listar(): Promise<ClienteResponseDTO[]> {
    const { data } = await api.get<ClienteResponseDTO[]>('/clientes')
    return data
  },

  async criar(dto: CriarClienteDTO): Promise<ClienteResponseDTO> {
    const { data } = await api.post<ClienteResponseDTO>('/clientes', dto)
    return data
  },

  async criarInstalacao(dto: CriarInstalacaoDTO): Promise<InstalacaoResponseDTO> {
    const { data } = await api.post<InstalacaoResponseDTO>('/clientes/instalacao', dto)
    return data
  }
}
