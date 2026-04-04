import api from '@/lib/api'
import { TaskResponseDTO, CreateTaskDTO, UpdateTaskDTO } from '@greenly/shared'

export const taskService = {
  async listar(): Promise<TaskResponseDTO[]> {
    const { data } = await api.get<TaskResponseDTO[]>('/tasks')
    return data
  },

  async obter(id: string): Promise<TaskResponseDTO> {
    const { data } = await api.get<TaskResponseDTO>(`/tasks/${id}`)
    return data
  },

  async criar(dto: CreateTaskDTO): Promise<TaskResponseDTO> {
    const { data } = await api.post<TaskResponseDTO>('/tasks', dto)
    return data
  },

  async atualizar(id: string, dto: UpdateTaskDTO): Promise<TaskResponseDTO> {
    const { data } = await api.patch<TaskResponseDTO>(`/tasks/${id}`, dto)
    return data
  },

  async excluir(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  }
}
