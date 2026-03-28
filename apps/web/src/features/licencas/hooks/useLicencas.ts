import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { licencaService } from '../services/licencaService'
import { CriarLicencaDTO } from '@greenly/shared'

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

  return {
    licencas,
    isLoading,
    error,
    criarLicenca: criarMutation.mutate,
    isCriando: criarMutation.isPending
  }
}
