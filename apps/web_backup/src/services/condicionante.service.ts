import { api } from './api'
import type { CondicionanteDTO, CreateCondicionanteDTO } from '@greenly/shared'

export const condicionanteService = {
  async listarPorLicenca(licencaId: string) {
    const { data } = await api.get<CondicionanteDTO[]>(`/licencas/${licencaId}/condicionantes`)
    return data
  },

  async buscarPorId(id: string) {
    const { data } = await api.get<CondicionanteDTO>(`/condicionantes/${id}`)
    return data
  },

  async criar(payload: CreateCondicionanteDTO) {
    const { data } = await api.post<CondicionanteDTO>('/condicionantes', payload)
    return data
  },

  async atualizar(id: string, payload: Partial<CreateCondicionanteDTO>) {
    const { data } = await api.put<CondicionanteDTO>(`/condicionantes/${id}`, payload)
    return data
  },

  async excluir(id: string) {
    await api.delete(`/condicionantes/${id}`)
  }
}
