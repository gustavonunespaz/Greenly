import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  RevisarDocumentoDTO,
  StatusRevisaoDocumento,
} from "@greenly/shared";
import { documentoService } from "../services/documentoService";

export function useDocumentos(statusRevisao: StatusRevisaoDocumento, periodoDias: number) {
  const queryClient = useQueryClient();

  const pendentesQuery = useQuery({
    queryKey: ["documentos-revisao-pendentes", statusRevisao],
    queryFn: () =>
      documentoService.listarPendentesRevisao({
        statusRevisao,
        limit: 200,
      }),
  });

  const qualidadeQuery = useQuery({
    queryKey: ["documentos-qualidade", periodoDias],
    queryFn: () => documentoService.getQualidadeDocumental(periodoDias),
  });

  const revisarMutation = useMutation({
    mutationFn: ({
      processamentoDocumentoId,
      payload,
    }: {
      processamentoDocumentoId: string;
      payload: RevisarDocumentoDTO;
    }) => documentoService.revisarDocumento(processamentoDocumentoId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documentos-revisao-pendentes"] });
      queryClient.invalidateQueries({ queryKey: ["documentos-qualidade"] });
      queryClient.invalidateQueries({
        queryKey: ["documentos-revisao-detalhe", variables.processamentoDocumentoId],
      });
    },
  });

  return {
    pendentes: pendentesQuery.data ?? [],
    isLoadingPendentes: pendentesQuery.isLoading,
    qualidade: qualidadeQuery.data,
    isLoadingQualidade: qualidadeQuery.isLoading,
    revisarDocumento: revisarMutation.mutateAsync,
    isRevisando: revisarMutation.isPending,
  };
}
