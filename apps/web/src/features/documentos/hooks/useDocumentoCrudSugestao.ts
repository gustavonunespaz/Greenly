import { useQuery } from "@tanstack/react-query";
import { documentoService } from "../services/documentoService";

export function useDocumentoCrudSugestao(
  processamentoDocumentoId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: ["documentos-sugestao-crud", processamentoDocumentoId],
    queryFn: () => documentoService.obterSugestaoCrud(processamentoDocumentoId as string),
    enabled: enabled && !!processamentoDocumentoId,
    staleTime: 0,
  });
}
