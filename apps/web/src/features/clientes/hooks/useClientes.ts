import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clienteService } from '../services/clienteService'
import { CriarClienteDTO } from '@greenly/shared'

export function useClientes() {
  const queryClient = useQueryClient()

  const { data: clientes, isLoading, error } = useQuery({
    queryKey: ['clientes'],
    queryFn: clienteService.listar,
  })

  const criarMutation = useMutation({
    mutationFn: (dto: CriarClienteDTO) => clienteService.criar(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    }
  })

  return {
    clientes,
    isLoading,
    error,
    criarCliente: criarMutation.mutate,
    isCriando: criarMutation.isPending
  }
}
