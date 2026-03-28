import api from '@/lib/api'

export interface Notificacao {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  urgencia: 'alta' | 'media' | 'baixa'
  lidaEm: string | null
  criadoEm: string
}

export const notificacaoService = {
  async listar(): Promise<Notificacao[]> {
    const { data } = await api.get<Notificacao[]>('/notificacoes')
    return data
  },

  async marcarComoLida(id: string): Promise<void> {
    await api.patch(`/notificacoes/${id}/lida`)
  }
}
