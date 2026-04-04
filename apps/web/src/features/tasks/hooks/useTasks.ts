import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { taskService } from '../services/taskService'
import { CreateTaskDTO, UpdateTaskDTO, TaskResponseDTO } from '@greenly/shared'

export function useTasks() {
  const queryClient = useQueryClient()

  const { data: tasks, isLoading, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.listar,
  })

  const criarMutation = useMutation({
    mutationFn: (dto: CreateTaskDTO) => taskService.criar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDTO }) => taskService.atualizar(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const excluirMutation = useMutation({
    mutationFn: (id: string) => taskService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  return {
    tasks: tasks || [],
    isLoading,
    error,
    criarTask: criarMutation.mutateAsync,
    atualizarTask: atualizarMutation.mutateAsync,
    excluirTask: excluirMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    isAtualizando: atualizarMutation.isPending,
    isExcluindo: excluirMutation.isPending,
  }
}
