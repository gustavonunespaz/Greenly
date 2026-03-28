import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { residuoService } from '../services/residuoService'
import { AtualizarMTRDTO, EmitirMTRDTO } from '@greenly/shared'

interface UseResiduosOptions {
  clienteId?: string
}

export function useResiduos(options?: UseResiduosOptions) {
  const clienteId = options?.clienteId
  const queryClient = useQueryClient()

  const { data: mtrs, isLoading, error } = useQuery({
    queryKey: ['mtrs', clienteId ?? 'consultoria'],
    queryFn: () => {
      if (clienteId) {
        return residuoService.listarMTRs(clienteId)
      }
      return residuoService.listarMTRsConsultoria()
    },
  })

  const emitirMutation = useMutation({
    mutationFn: (dto: EmitirMTRDTO) => residuoService.emitirMTR(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mtrs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    }
  })

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AtualizarMTRDTO }) => residuoService.atualizarMTR(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mtrs'] })
    }
  })

  const avancarStatusMutation = useMutation({
    mutationFn: ({ id, novoStatus }: { id: string; novoStatus: string }) => residuoService.avancarStatus(id, novoStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mtrs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    }
  })

  const removerMutation = useMutation({
    mutationFn: (id: string) => residuoService.removerMTR(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mtrs'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    }
  })

  const { data: fontesGeradoras, isLoading: isLoadingFontes } = useQuery({
    queryKey: ['fontes-geradoras', clienteId],
    queryFn: () => residuoService.listarFontesGeradoras(clienteId!),
    enabled: !!clienteId,
  })

  const { data: transportadoras = [], isLoading: isLoadingTransportadoras } = useQuery({
    queryKey: ['parceiros', 'transportadoras'],
    queryFn: () => residuoService.listarParceiros('TRANSPORTADORA'),
  })

  const { data: destinadores = [], isLoading: isLoadingDestinadores } = useQuery({
    queryKey: ['parceiros', 'destinadores'],
    queryFn: () => residuoService.listarParceiros('DESTINADOR_FINAL'),
  })

  const isLoadingParceiros = isLoadingTransportadoras || isLoadingDestinadores

  return {
    mtrs,
    isLoading,
    error,
    fontesGeradoras: fontesGeradoras ?? [],
    transportadoras,
    destinadores,
    isLoadingFontes,
    isLoadingParceiros,
    emitirMTR: emitirMutation.mutateAsync,
    atualizarMTR: atualizarMutation.mutateAsync,
    avancarStatusMTR: avancarStatusMutation.mutateAsync,
    removerMTR: removerMutation.mutateAsync,
    isEmitindo: emitirMutation.isPending,
    isAtualizando: atualizarMutation.isPending,
    isAvancandoStatus: avancarStatusMutation.isPending,
    isRemovendo: removerMutation.isPending,
  }
}
