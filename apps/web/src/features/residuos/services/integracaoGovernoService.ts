import api from '@/lib/api'
import {
  GovIntegrationDashboardDTO,
  GovIntegrationDetailDTO,
  GovResourceIntegrationSummaryDTO,
} from '@greenly/shared'

export const integracaoGovernoService = {
  async getDashboard(periodoHoras = 24): Promise<GovIntegrationDashboardDTO> {
    const { data } = await api.get<GovIntegrationDashboardDTO>('/integracoes/governo/dashboard', {
      params: { periodoHoras },
    })
    return data
  },

  async getMtrDetail(id: string): Promise<GovIntegrationDetailDTO> {
    const { data } = await api.get<GovIntegrationDetailDTO>(`/integracoes/governo/mtrs/${id}`)
    return data
  },

  async reenviarMtr(id: string): Promise<GovResourceIntegrationSummaryDTO | null> {
    const { data } = await api.post<GovResourceIntegrationSummaryDTO | null>(
      `/integracoes/governo/mtrs/${id}/enviar`,
    )
    return data
  },

  async reconciliarMtr(id: string): Promise<GovResourceIntegrationSummaryDTO | null> {
    const { data } = await api.post<GovResourceIntegrationSummaryDTO | null>(
      `/integracoes/governo/mtrs/${id}/reconciliar`,
    )
    return data
  },
}
