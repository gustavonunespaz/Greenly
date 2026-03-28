import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AtualizarStatusCondicionanteDTO, CriarCondicionanteDTO } from '@greenly/shared'
import { licencaService } from '../services/licencaService'

export function useCondicionantes() {
  const queryClient = useQueryClient()

  const { data: condicionantes, isLoading, error } = useQuery({
    queryKey: ['condicionantes-consultoria'],
    queryFn: licencaService.listarCondicionantesConsultoria,
  })

  const atualizarStatusMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AtualizarStatusCondicionanteDTO }) =>
      licencaService.atualizarStatusCondicionante(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condicionantes-consultoria'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
    },
  })

  const criarMutation = useMutation({
    mutationFn: ({ licencaId, dto }: { licencaId: string; dto: CriarCondicionanteDTO }) =>
      licencaService.criarCondicionante(licencaId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['condicionantes-consultoria'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
    },
  })

  return {
    condicionantes: condicionantes ?? [],
    isLoading,
    error,
    criarCondicionante: criarMutation.mutateAsync,
    atualizarStatusCondicionante: atualizarStatusMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    isAtualizandoStatus: atualizarStatusMutation.isPending,
    condicionanteAtualizandoId: atualizarStatusMutation.variables?.id,
  }
}
