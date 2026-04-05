import api from '@/lib/api'
import type {
  AtualizarObrigacaoAmbientalDTO,
  CriarObrigacaoAmbientalDTO,
  ObrigacaoAmbientalPadraoOficialDTO,
  ObrigacaoAmbientalResumoModuloDTO,
  ObrigacaoAmbientalResponseDTO,
} from '@greenly/shared'

export type ObrigacaoAmbientalModulo = 'IBAMA' | 'RESIDUOS' | 'EMISSOES_ATMOSFERICAS' | 'IAT'
export type ObrigacaoAmbientalStatus =
  | 'PENDENTE'
  | 'EM_PREENCHIMENTO'
  | 'ENTREGUE'
  | 'ATRASADA'
  | 'DISPENSADA'

type ListParams = {
  clienteId?: string
  modulo?: ObrigacaoAmbientalModulo
  status?: ObrigacaoAmbientalStatus
  ano?: number
  somenteAtrasadas?: boolean
  busca?: string
}

type PadraoParams = {
  modulo?: ObrigacaoAmbientalModulo
  ano?: number
}

export const obrigacaoAmbientalService = {
  async listar(params: ListParams = {}): Promise<ObrigacaoAmbientalResponseDTO[]> {
    const { data } = await api.get<ObrigacaoAmbientalResponseDTO[]>('/obrigacoes-ambientais', {
      params,
    })
    return data
  },

  async resumoModulos(params: Omit<ListParams, 'modulo' | 'status' | 'somenteAtrasadas'> = {}) {
    const { data } = await api.get<ObrigacaoAmbientalResumoModuloDTO[]>(
      '/obrigacoes-ambientais/resumo-modulos',
      { params },
    )
    return data
  },

  async listarPadroesOficiais(params: PadraoParams = {}) {
    const { data } = await api.get<ObrigacaoAmbientalPadraoOficialDTO[]>(
      '/obrigacoes-ambientais/padroes-oficiais',
      { params },
    )
    return data
  },

  async criar(dto: CriarObrigacaoAmbientalDTO): Promise<ObrigacaoAmbientalResponseDTO> {
    const { data } = await api.post<ObrigacaoAmbientalResponseDTO>('/obrigacoes-ambientais', dto)
    return data
  },

  async atualizar(
    id: string,
    dto: AtualizarObrigacaoAmbientalDTO,
  ): Promise<ObrigacaoAmbientalResponseDTO> {
    const { data } = await api.patch<ObrigacaoAmbientalResponseDTO>(`/obrigacoes-ambientais/${id}`, dto)
    return data
  },

  async inicializarPadrao(clienteId: string, ano: number): Promise<ObrigacaoAmbientalResponseDTO[]> {
    const { data } = await api.post<ObrigacaoAmbientalResponseDTO[]>(
      `/obrigacoes-ambientais/clientes/${clienteId}/inicializar-padrao`,
      { ano },
    )
    return data
  },
}
