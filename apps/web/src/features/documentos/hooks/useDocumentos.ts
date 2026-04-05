import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AplicarDocumentoCrudDTO,
  IngerirDocumentoMetadataDTO,
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

  const ingestaoMutation = useMutation({
    mutationFn: ({
      arquivo,
      metadata,
    }: {
      arquivo: File;
      metadata: IngerirDocumentoMetadataDTO;
    }) => documentoService.ingerirDocumento(arquivo, metadata),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentos-revisao-pendentes"] });
      queryClient.invalidateQueries({ queryKey: ["documentos-qualidade"] });
    },
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

  const aplicarCrudMutation = useMutation({
    mutationFn: ({
      processamentoDocumentoId,
      payload,
    }: {
      processamentoDocumentoId: string;
      payload: AplicarDocumentoCrudDTO;
    }) => documentoService.aplicarCrud(processamentoDocumentoId, payload),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documentos-revisao-pendentes"] });
      queryClient.invalidateQueries({
        queryKey: ["documentos-revisao-detalhe", variables.processamentoDocumentoId],
      });
      queryClient.invalidateQueries({
        queryKey: ["documentos-sugestao-crud", variables.processamentoDocumentoId],
      });
      queryClient.invalidateQueries({ queryKey: ["documentos-qualidade"] });
      queryClient.invalidateQueries({ queryKey: ["licencas-consultoria"] });
      queryClient.invalidateQueries({ queryKey: ["mtrs"] });
      queryClient.invalidateQueries({ queryKey: ["cdfs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    },
  });

  return {
    pendentes: pendentesQuery.data ?? [],
    isLoadingPendentes: pendentesQuery.isLoading,
    qualidade: qualidadeQuery.data,
    isLoadingQualidade: qualidadeQuery.isLoading,
    ingerirDocumento: ingestaoMutation.mutateAsync,
    isIngerindo: ingestaoMutation.isPending,
    revisarDocumento: revisarMutation.mutateAsync,
    isRevisando: revisarMutation.isPending,
    aplicarCrud: aplicarCrudMutation.mutateAsync,
    isAplicandoCrud: aplicarCrudMutation.isPending,
  };
}
