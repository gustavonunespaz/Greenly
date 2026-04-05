import { useQuery } from "@tanstack/react-query";
import { documentoService } from "../services/documentoService";

interface UseDocumentoRevisaoDetalheOptions {
  enabled?: boolean;
  polling?: boolean;
}

export function useDocumentoRevisaoDetalhe(
  processamentoDocumentoId: string | null,
  options?: UseDocumentoRevisaoDetalheOptions,
) {
  return useQuery({
    queryKey: ["documentos-revisao-detalhe", processamentoDocumentoId],
    queryFn: () => documentoService.obterDetalheRevisao(processamentoDocumentoId as string),
    enabled: (options?.enabled ?? true) && !!processamentoDocumentoId,
    refetchInterval: options?.polling
      ? (query) => {
          const status = query.state.data?.statusProcessamento;
          if (!status) return 2500;
          if (status === "CONCLUIDO" || status === "FALHA") return false;
          return 2500;
        }
      : false,
  });
}
