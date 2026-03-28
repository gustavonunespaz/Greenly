import { api } from './api'
import type { MTRDTO, CreateMTRDTO } from '@greenly/shared'

export const mtrService = {
  async listar() {
    const { data } = await api.get<MTRDTO[]>('/mtrs')
    return data
  },

  async buscarPorId(id: string) {
    const { data } = await api.get<MTRDTO>(`/mtrs/${id}`)
    return data
  },

  async criar(payload: CreateMTRDTO) {
    const { data } = await api.post<MTRDTO>('/mtrs', payload)
    return data
  },

  async atualizarStatus(id: string, status: string) {
    const { data } = await api.patch<MTRDTO>(`/mtrs/${id}/status`, { status })
    return data
  },

  async excluir(id: string) {
    await api.delete(`/mtrs/${id}`)
  }
}
