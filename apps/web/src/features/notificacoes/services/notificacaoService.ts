import api from '@/lib/api'

export interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo?: string
  urgencia?: 'alta' | 'media' | 'baixa'
  linkAcao?: string | null
  lidaEm: string | null
  criadoEm: string
}

interface MarcarTodasComoLidasResponse {
  totalAtualizadas: number
}

export const notificacaoService = {
  async listar(): Promise<Notificacao[]> {
    const { data } = await api.get<Notificacao[]>('/notificacoes')
    return data
  },

  async marcarComoLida(id: string): Promise<void> {
    await api.patch(`/notificacoes/${id}/lida`)
  },

  async marcarTodasComoLidas(): Promise<MarcarTodasComoLidasResponse> {
    const { data } = await api.patch<MarcarTodasComoLidasResponse>('/notificacoes/marcar-todas-lidas')
    return data
  },
}
