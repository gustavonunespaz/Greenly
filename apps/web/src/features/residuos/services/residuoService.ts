import api from '@/lib/api'
import {
  MTRResponseDTO,
  EmitirMTRDTO,
  FonteGeradoraResponseDTO,
  CriarFonteGeradoraDTO,
  AtualizarMTRDTO,
  FonteGeradoraOptionDTO,
  ParceiroResponseDTO,
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
    const { data } = await api.get<FonteGeradoraOptionDTO[]>(`/residuos/fontes-geradoras/cliente/${clienteId}`)
    return data
  },

  async listarParceiros(tipo?: 'TRANSPORTADORA' | 'DESTINADOR_FINAL'): Promise<ParceiroResponseDTO[]> {
    const { data } = await api.get<ParceiroResponseDTO[]>('/residuos/parceiros', { params: { tipo } })
    return data
  }
}
