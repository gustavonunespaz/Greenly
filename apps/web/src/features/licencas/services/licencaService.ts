import api from '@/lib/api'
import { LicencaResponseDTO, CriarLicencaDTO, CondicionanteResponseDTO, CriarCondicionanteDTO } from '@greenly/shared'

export const licencaService = {
  async listarPorConsultoria(): Promise<LicencaResponseDTO[]> {
    const { data } = await api.get<LicencaResponseDTO[]>('/licencas/consultoria')
    return data
  },

  async listarPorCliente(clienteId: string): Promise<LicencaResponseDTO[]> {
    const { data } = await api.get<LicencaResponseDTO[]>(`/licencas/cliente/${clienteId}`)
    return data
  },

  async criar(dto: CriarLicencaDTO): Promise<LicencaResponseDTO> {
    const { data } = await api.post<LicencaResponseDTO>('/licencas', dto)
    return data
  },

  async criarCondicionante(licencaId: string, dto: CriarCondicionanteDTO): Promise<CondicionanteResponseDTO> {
    const { data } = await api.post<CondicionanteResponseDTO>(`/licencas/${licencaId}/condicionantes`, dto)
    return data
  }
}
