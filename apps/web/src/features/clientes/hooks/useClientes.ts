import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clienteService } from '../services/clienteService'
import { AtualizarClienteDTO, CriarClienteDTO } from '@greenly/shared'

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

  const atualizarMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: AtualizarClienteDTO }) => clienteService.atualizar(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    }
  })

  const removerMutation = useMutation({
    mutationFn: (id: string) => clienteService.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['licencas-consultoria'] })
      queryClient.invalidateQueries({ queryKey: ['mtrs-consultoria'] })
    }
  })

  return {
    clientes,
    isLoading,
    error,
    criarCliente: criarMutation.mutateAsync,
    atualizarCliente: atualizarMutation.mutateAsync,
    removerCliente: removerMutation.mutateAsync,
    isCriando: criarMutation.isPending,
    isAtualizando: atualizarMutation.isPending,
    isRemovendo: removerMutation.isPending,
  }
}
