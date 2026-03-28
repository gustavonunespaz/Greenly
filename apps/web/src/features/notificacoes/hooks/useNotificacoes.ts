import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificacaoService } from '../services/notificacaoService'

export function useNotificacoes() {
  const queryClient = useQueryClient()

  const { data: notificacoes, isLoading, error } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: notificacaoService.listar,
    refetchInterval: 1000 * 30, // 30 seconds
  })

  const marcarLidaMutation = useMutation({
    mutationFn: (id: string) => notificacaoService.marcarComoLida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    }
  })

  const marcarTodasLidasMutation = useMutation({
    mutationFn: () => notificacaoService.marcarTodasComoLidas(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    },
  })

  return {
    notificacoes,
    isLoading,
    error,
    marcarComoLida: marcarLidaMutation.mutateAsync,
    marcarTodasComoLidas: marcarTodasLidasMutation.mutateAsync,
    isProcessando: marcarLidaMutation.isPending,
    isProcessandoTodas: marcarTodasLidasMutation.isPending,
  }
}
