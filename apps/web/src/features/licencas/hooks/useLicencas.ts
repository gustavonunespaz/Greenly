import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { licencaService } from '../services/licencaService'
import { AtualizarLicencaDTO, CriarLicencaDTO } from '@greenly/shared'

export function useLicencas() {
  const queryClient = useQueryClient()

  const { data: licencas, isLoading, error } = useQuery({
    queryKey: ['licencas-consultoria'],
    queryFn: licencaService.listarPorConsultoria,
  })

  const criarMutation = useMutation({
    mutationFn: (dto: CriarLicencaDTO) => licencaService.criar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licencas-consultoria'] })
    }
  })

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AtualizarLicencaDTO }) => licencaService.atualizar(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licencas-consultoria'] })
    }
  })

  const removerMutation = useMutation({
    mutationFn: (id: string) => licencaService.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['licencas-consultoria'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
    }
  })

  const { data: orgaosAmbientais, isLoading: isLoadingOrgaos } = useQuery({
    queryKey: ['orgaos-ambientais'],
    queryFn: licencaService.listarOrgaosAmbientais,
  })

  return {
    licencas,
    isLoading,
    error,
    orgaosAmbientais,
    isLoadingOrgaos,
    criarLicenca: criarMutation.mutateAsync,
    atualizarLicenca: atualizarMutation.mutateAsync,
    removerLicenca: removerMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    isAtualizando: atualizarMutation.isPending,
    isRemovendo: removerMutation.isPending,
  }
}
