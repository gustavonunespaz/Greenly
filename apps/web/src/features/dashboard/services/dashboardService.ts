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

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const { data } = await api.get<DashboardMetrics>('/dashboard/metrics')
    return data
  }
}
