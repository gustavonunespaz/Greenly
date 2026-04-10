import api from "@/lib/api";
import type {
  AplicarDocumentoCrudDTO,
  AplicarDocumentoCrudResponseDTO,
  DocumentoCrudSugestaoResponseDTO,
  DocumentoQualidadeMetricsResponseDTO,
  DocumentoRevisaoDetalheResponseDTO,
  DocumentoRevisaoPendenteItemDTO,
  IngerirDocumentoMetadataDTO,
  IngerirDocumentoResponseDTO,
  RevisarDocumentoDTO,
  RevisarDocumentoResponseDTO,
  StatusRevisaoDocumento,
} from "@greenly/shared";

export const documentoService = {
  async ingerirDocumento(
    arquivo: File,
    metadata: IngerirDocumentoMetadataDTO,
  ): Promise<IngerirDocumentoResponseDTO> {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("origem", metadata.origem);
    if (metadata.clienteId) formData.append("clienteId", metadata.clienteId);
    if (metadata.licencaId) formData.append("licencaId", metadata.licencaId);
    if (metadata.tipoDeclarado) formData.append("tipoDeclarado", metadata.tipoDeclarado);
    if (metadata.categoriaDeclarada) formData.append("categoriaDeclarada", metadata.categoriaDeclarada);

    const { data } = await api.post<IngerirDocumentoResponseDTO>("/documentos/ingestao", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

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

  async obterSugestaoCrud(
    processamentoDocumentoId: string,
  ): Promise<DocumentoCrudSugestaoResponseDTO> {
    const { data } = await api.get<DocumentoCrudSugestaoResponseDTO>(
      `/documentos/${processamentoDocumentoId}/sugestao-crud`,
    );
    return data;
  },

  async aplicarCrud(
    processamentoDocumentoId: string,
    payload: AplicarDocumentoCrudDTO,
  ): Promise<AplicarDocumentoCrudResponseDTO> {
    const { data } = await api.post<AplicarDocumentoCrudResponseDTO>(
      `/documentos/${processamentoDocumentoId}/aplicar-crud`,
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

  async vincularCliente(
    processamentoDocumentoId: string,
    clienteId: string,
  ): Promise<void> {
    await api.post(`/documentos/${processamentoDocumentoId}/vincular-cliente`, {
      clienteId,
    });
  },

  async resolverParceiro(
    processamentoDocumentoId: string,
    payload: { cnpj: string; tipo: "TRANSPORTADOR" | "DESTINADOR"; nome?: string; estado?: string },
  ): Promise<any> {
    const { data } = await api.post(`/documentos/${processamentoDocumentoId}/resolver-parceiro`, payload);
    return data;
  },
};
