import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { residuoService } from '../services/residuoService'
import { EmitirMTRDTO } from '@greenly/shared'

export function useResiduos(clienteId?: string) {
  const queryClient = useQueryClient()

  const { data: mtrs, isLoading, error } = useQuery({
    queryKey: ['mtrs', clienteId],
    queryFn: () => residuoService.listarMTRs(clienteId!),
    enabled: !!clienteId
  })

  const emitirMutation = useMutation({
    mutationFn: (dto: EmitirMTRDTO) => residuoService.emitirMTR(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mtrs', clienteId] })
    }
  })

  return {
    mtrs,
    isLoading,
    error,
    emitirMTR: emitirMutation.mutate,
    isEmitindo: emitirMutation.isPending
  }
}
