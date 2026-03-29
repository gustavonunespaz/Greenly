import api from '@/lib/api'

export interface DashboardMetrics {
  totalClientes: number
  licencasAVencer: number
  pendenciasCriticas: number
  condicionantesAtrasadas: number
  residuosNoMes: number
  mtrsPendentes: number
  notificacoesNaoLidas: number
}

export type DashboardMetricKey =
  | 'totalClientes'
  | 'licencasAVencer'
  | 'pendenciasCriticas'
  | 'condicionantesAtrasadas'
  | 'residuosNoMes'
  | 'mtrsPendentes'
  | 'notificacoesNaoLidas'

export interface DashboardMetricDetailItem {
  id: string
  entidade: 'CLIENTE' | 'LICENCA' | 'CONDICIONANTE' | 'MTR' | 'NOTIFICACAO'
  titulo: string
  subtitulo?: string | null
  status?: string | null
  dataReferencia?: string | null
  destino: string
}

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { data } = await api.get<DashboardMetrics>('/dashboard/metrics')
    return data
  },

  async getMetricDetails(metricKey: DashboardMetricKey): Promise<DashboardMetricDetailItem[]> {
    const { data } = await api.get<DashboardMetricDetailItem[]>(
      `/dashboard/metrics/${metricKey}/details`,
    )
    return data
  },
}
