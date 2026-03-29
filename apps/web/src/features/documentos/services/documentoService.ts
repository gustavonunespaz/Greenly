import api from "@/lib/api";
import type {
  DocumentoQualidadeMetricsResponseDTO,
  DocumentoRevisaoDetalheResponseDTO,
  DocumentoRevisaoPendenteItemDTO,
  RevisarDocumentoDTO,
  RevisarDocumentoResponseDTO,
  StatusRevisaoDocumento,
} from "@greenly/shared";

export const documentoService = {
  async listarPendentesRevisao(input?: {
    statusRevisao?: StatusRevisaoDocumento;
    limit?: number;
  }): Promise<DocumentoRevisaoPendenteItemDTO[]> {
    const params = new URLSearchParams();
    if (input?.statusRevisao) params.set("statusRevisao", input.statusRevisao);
    if (typeof input?.limit === "number") params.set("limit", String(input.limit));

    const query = params.toString();
    const { data } = await api.get<DocumentoRevisaoPendenteItemDTO[]>(
      `/documentos/revisao/pendentes${query ? `?${query}` : ""}`,
    );
    return data;
  },

  async obterDetalheRevisao(
    processamentoDocumentoId: string,
  ): Promise<DocumentoRevisaoDetalheResponseDTO> {
    const { data } = await api.get<DocumentoRevisaoDetalheResponseDTO>(
      `/documentos/${processamentoDocumentoId}/revisao`,
    );
    return data;
  },

  async revisarDocumento(
    processamentoDocumentoId: string,
    payload: RevisarDocumentoDTO,
  ): Promise<RevisarDocumentoResponseDTO> {
    const { data } = await api.post<RevisarDocumentoResponseDTO>(
      `/documentos/${processamentoDocumentoId}/revisao`,
      payload,
    );
    return data;
  },

  async getQualidadeDocumental(periodoDias = 30): Promise<DocumentoQualidadeMetricsResponseDTO> {
    const { data } = await api.get<DocumentoQualidadeMetricsResponseDTO>(
      `/dashboard/documentos/qualidade?periodoDias=${periodoDias}`,
    );
    return data;
  },
};
