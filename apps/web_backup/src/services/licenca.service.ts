import { api } from './api'
import type { LicencaDTO, CreateLicencaDTO } from '@greenly/shared'

export const licencaService = {
  async listar() {
    const { data } = await api.get<LicencaDTO[]>('/licencas')
    return data
  },

  async buscarPorId(id: string) {
    const { data } = await api.get<LicencaDTO>(`/licencas/${id}`)
    return data
  },

  async criar(payload: CreateLicencaDTO) {
    const { data } = await api.post<LicencaDTO>('/licencas', payload)
    return data
  },

  async atualizar(id: string, payload: Partial<CreateLicencaDTO>) {
    const { data } = await api.put<LicencaDTO>(`/licencas/${id}`, payload)
    return data
  },

  async excluir(id: string) {
    await api.delete(`/licencas/${id}`)
  }
}
