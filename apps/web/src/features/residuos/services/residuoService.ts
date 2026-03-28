import api from '@/lib/api'
import { MTRResponseDTO, EmitirMTRDTO, AvancarStatusMTRDTO, FonteGeradoraResponseDTO, CriarFonteGeradoraDTO } from '@greenly/shared'

export const residuoService = {
  async listarMTRs(clienteId: string): Promise<MTRResponseDTO[]> {
    const { data } = await api.get<MTRResponseDTO[]>(`/residuos/mtr/cliente/${clienteId}`)
    return data
  },

  async emitirMTR(dto: EmitirMTRDTO): Promise<MTRResponseDTO> {
    const { data } = await api.post<MTRResponseDTO>('/residuos/mtr', dto)
    return data
  },

  async avancarStatus(mtrId: string, novoStatus: string): Promise<void> {
    await api.patch(`/residuos/mtr/${mtrId}/status`, { novoStatus })
  },

  async criarFonteGeradora(dto: CriarFonteGeradoraDTO): Promise<FonteGeradoraResponseDTO> {
    const { data } = await api.post<FonteGeradoraResponseDTO>('/residuos/fonte-geradora', dto)
    return data
  }
}
