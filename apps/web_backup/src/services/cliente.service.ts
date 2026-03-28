import { api } from './api'
import type { ClienteDTO, CreateClienteDTO } from '@greenly/shared'

export const clienteService = {
  async listar() {
    const { data } = await api.get<ClienteDTO[]>('/clientes')
    return data
  },

  async buscarPorId(id: string) {
    const { data } = await api.get<ClienteDTO>(`/clientes/${id}`)
    return data
  },

  async criar(payload: CreateClienteDTO) {
    const { data } = await api.post<ClienteDTO>('/clientes', payload)
    return data
  },

  async atualizar(id: string, payload: Partial<CreateClienteDTO>) {
    const { data } = await api.put<ClienteDTO>(`/clientes/${id}`, payload)
    return data
  },

  async excluir(id: string) {
    await api.delete(`/clientes/${id}`)
  }
}
