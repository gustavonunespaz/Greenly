import { useQuery } from "@tanstack/react-query";
import { documentoService } from "../services/documentoService";

export function useDocumentoRevisaoDetalhe(processamentoDocumentoId: string | null) {
  return useQuery({
    queryKey: ["documentos-revisao-detalhe", processamentoDocumentoId],
    queryFn: () => documentoService.obterDetalheRevisao(processamentoDocumentoId as string),
    enabled: !!processamentoDocumentoId,
  });
}
