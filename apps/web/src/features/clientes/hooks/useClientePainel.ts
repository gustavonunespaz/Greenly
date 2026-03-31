import { useQuery } from '@tanstack/react-query'
import { clienteService } from '../services/clienteService'

export function useClientePainel(clienteId?: string | null) {
  return useQuery({
    queryKey: ['cliente-painel', clienteId],
    queryFn: () => clienteService.obterPainel(clienteId as string),
    enabled: !!clienteId,
  })
}
