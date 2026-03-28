import api from '@/lib/api'
import {
  LicencaResponseDTO,
  CriarLicencaDTO,
  CondicionanteResponseDTO,
  CriarCondicionanteDTO,
  AtualizarLicencaDTO,
  OrgaoAmbientalResponseDTO,
  CondicionanteListItemDTO,
  AtualizarStatusCondicionanteDTO,
} from '@greenly/shared'

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

  async atualizar(id: string, dto: AtualizarLicencaDTO): Promise<LicencaResponseDTO> {
    const { data } = await api.patch<LicencaResponseDTO>(`/licencas/${id}`, dto)
    return data
  },

  async remover(id: string): Promise<void> {
    await api.delete(`/licencas/${id}`)
  },

  async listarOrgaosAmbientais(): Promise<OrgaoAmbientalResponseDTO[]> {
    const { data } = await api.get<OrgaoAmbientalResponseDTO[]>('/licencas/orgaos-ambientais')
    return data
  },

  async criarCondicionante(licencaId: string, dto: CriarCondicionanteDTO): Promise<CondicionanteResponseDTO> {
    const { data } = await api.post<CondicionanteResponseDTO>(`/licencas/${licencaId}/condicionantes`, dto)
    return data
  },

  async listarCondicionantesConsultoria(): Promise<CondicionanteListItemDTO[]> {
    const { data } = await api.get<CondicionanteListItemDTO[]>('/licencas/condicionantes/consultoria')
    return data
  },

  async atualizarStatusCondicionante(
    id: string,
    dto: AtualizarStatusCondicionanteDTO,
  ): Promise<CondicionanteListItemDTO> {
    const { data } = await api.patch<CondicionanteListItemDTO>(`/licencas/condicionantes/${id}/status`, dto)
    return data
  },
}
