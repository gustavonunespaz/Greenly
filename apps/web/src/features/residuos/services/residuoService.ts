import api from '@/lib/api'
import {
  CDFResponseDTO,
  ClienteParceiroVinculoResponseDTO,
  CriarParceiroDTO,
  MTRResponseDTO,
  EmitirMTRDTO,
  FonteGeradoraResponseDTO,
  CriarFonteGeradoraDTO,
  AtualizarMTRDTO,
  FonteGeradoraOptionDTO,
  ParceiroResponseDTO,
  VincularParceiroClienteDTO,
} from '@greenly/shared'

export const residuoService = {
  async listarMTRs(clienteId: string): Promise<MTRResponseDTO[]> {
    const { data } = await api.get<MTRResponseDTO[]>(`/residuos/mtr/cliente/${clienteId}`)
    return data
  },

  async listarMTRsConsultoria(): Promise<MTRResponseDTO[]> {
    const { data } = await api.get<MTRResponseDTO[]>('/residuos/mtr/consultoria')
    return data
  },

  async listarCDFs(clienteId: string): Promise<CDFResponseDTO[]> {
    const { data } = await api.get<CDFResponseDTO[]>(`/residuos/cdf/cliente/${clienteId}`)
    return data
  },

  async listarCDFsConsultoria(): Promise<CDFResponseDTO[]> {
    const { data } = await api.get<CDFResponseDTO[]>('/residuos/cdf/consultoria')
    return data
  },

  async emitirMTR(dto: EmitirMTRDTO): Promise<MTRResponseDTO> {
    const { data } = await api.post<MTRResponseDTO>('/residuos/mtr', dto)
    return data
  },

  async atualizarMTR(id: string, dto: AtualizarMTRDTO): Promise<MTRResponseDTO> {
    const { data } = await api.patch<MTRResponseDTO>(`/residuos/mtr/${id}`, dto)
    return data
  },

  async avancarStatus(mtrId: string, novoStatus: string): Promise<void> {
    await api.patch(`/residuos/mtr/${mtrId}/status`, { novoStatus })
  },

  async removerMTR(id: string): Promise<void> {
    await api.delete(`/residuos/mtr/${id}`)
  },

  async criarFonteGeradora(dto: CriarFonteGeradoraDTO): Promise<FonteGeradoraResponseDTO> {
    const { data } = await api.post<FonteGeradoraResponseDTO>('/residuos/fonte-geradora', dto)
    return data
  },

  async listarFontesGeradoras(clienteId: string): Promise<FonteGeradoraOptionDTO[]> {
    const { data } = await api.get<FonteGeradoraOptionDTO[]>(
      `/residuos/fontes-geradoras/cliente/${clienteId}`,
    )
    return data
  },

  async listarParceiros(
    tipo?: 'TRANSPORTADORA' | 'DESTINADOR_FINAL',
  ): Promise<ParceiroResponseDTO[]> {
    const { data } = await api.get<ParceiroResponseDTO[]>('/residuos/parceiros', {
      params: { tipo },
    })
    return data
  },

  async criarParceiro(dto: CriarParceiroDTO): Promise<ParceiroResponseDTO> {
    const { data } = await api.post<ParceiroResponseDTO>('/residuos/parceiros', dto)
    return data
  },

  async listarParceirosCliente(
    clienteId: string,
    papel?: 'TRANSPORTADORA' | 'DESTINADOR_FINAL' | 'PRESTADOR_SERVICO' | 'OUTRO',
  ): Promise<ClienteParceiroVinculoResponseDTO[]> {
    const { data } = await api.get<ClienteParceiroVinculoResponseDTO[]>(
      `/residuos/clientes/${clienteId}/parceiros`,
      { params: { papel } },
    )
    return data
  },

  async vincularParceiroCliente(
    dto: Omit<VincularParceiroClienteDTO, 'clienteId'> & { clienteId: string },
  ): Promise<ClienteParceiroVinculoResponseDTO> {
    const { data } = await api.post<ClienteParceiroVinculoResponseDTO>(
      `/residuos/clientes/${dto.clienteId}/parceiros`,
      {
        parceiroId: dto.parceiroId,
        papel: dto.papel,
        sistemaIntegracao: dto.sistemaIntegracao,
        codigoCadastroExterno: dto.codigoCadastroExterno,
        observacoes: dto.observacoes,
      },
    )
    return data
  },
}
