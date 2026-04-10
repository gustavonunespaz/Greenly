import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AtualizarStatusCondicionanteDTO, CriarCondicionanteDTO, CondicionanteExtracaoResponseDTO } from '@greenly/shared'
import { licencaService } from '../services/licencaService'

export function useCondicionantes(licencaId?: string) {
  const queryClient = useQueryClient()

  const { data: condicionantes, isLoading, error } = useQuery({
    queryKey: ['condicionantes-consultoria'],
    queryFn: licencaService.listarCondicionantesConsultoria,
  })

  const { data: condicionantesExtraidas, isLoading: isCarregandoExtraidas } = useQuery({
    queryKey: ['condicionantes-extraidas', licencaId],
    queryFn: () => licencaService.listarCondicionantesExtraidas(licencaId!),
    enabled: !!licencaId,
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

  const extrairCondicionantesIaMutation = useMutation({
    mutationFn: (licencaId: string) => licencaService.extrairCondicionantes(licencaId),
    onSuccess: (_, lId) => {
      // Em vez de só invalidar as consultas, nós também disparamos revalidação na listagem master,
      // para puxar o status atualizado
      queryClient.invalidateQueries({ queryKey: ['licencas-consultoria'] })
      queryClient.invalidateQueries({ queryKey: ['licencas-cliente'] })
    }
  })

  const validarCondicionantesIaMutation = useMutation({
    mutationFn: ({ licencaId, validacoes }: { licencaId: string; validacoes: Array<{ condicionanteId: string; aceita: boolean }> }) =>
      licencaService.validarCondicionantesExtraidas(licencaId, validacoes),
    onSuccess: (_, { licencaId }) => {
      queryClient.invalidateQueries({ queryKey: ['condicionantes-consultoria'] })
      queryClient.invalidateQueries({ queryKey: ['condicionantes-extraidas', licencaId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    },
  })

  return {
    condicionantes: condicionantes ?? [],
    condicionantesExtraidas: condicionantesExtraidas ?? [],
    isLoading,
    isCarregandoExtraidas,
    error,
    criarCondicionante: criarMutation.mutateAsync,
    atualizarStatusCondicionante: atualizarStatusMutation.mutateAsync,
    extrairCondicionantesIa: extrairCondicionantesIaMutation.mutateAsync,
    validarCondicionantesIa: validarCondicionantesIaMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    isAtualizandoStatus: atualizarStatusMutation.isPending,
    isExtraindoIa: extrairCondicionantesIaMutation.isPending,
    isValidandoIa: validarCondicionantesIaMutation.isPending,
    condicionanteAtualizandoId: atualizarStatusMutation.variables?.id,
  }
}
