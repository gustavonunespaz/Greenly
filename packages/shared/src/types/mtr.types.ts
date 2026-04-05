export type StatusMTR = 'EMITIDO' | 'EM_TRANSITO' | 'RECEBIDO' | 'CDF_EMITIDO' | 'CANCELADO' | 'COM_DIVERGENCIA'
export type TipoDestinacaoFinal = 'ATERRO_SANITARIO' | 'ATERRO_INDUSTRIAL' | 'INCINERACAO' | 'COPROCESSAMENTO' | 'RECICLAGEM' | 'COMPOSTAGEM' | 'TRATAMENTO_BIOLOGICO' | 'TRATAMENTO_QUIMICO' | 'TRATAMENTO_FISICO' | 'REUTILIZACAO' | 'LOGISTICA_REVERSA' | 'OUTRO'
export type UnidadeMedida = 'KG' | 'TON' | 'LITRO' | 'M3' | 'UNIDADE'

export interface MTRDTO {
  id: string
  clienteId: string
  fonteGeradoraId?: string | null
  transportadoraId: string
  destinadorId: string
  numeroMTR?: string | null
  status: StatusMTR
  tipoDestinacao: TipoDestinacaoFinal
  volume: number
  unidadeMedida: UnidadeMedida
  dataEmissao: string | Date
  dataColeta?: string | Date | null
  dataRecebimento?: string | Date | null
  placaVeiculo?: string | null
  nomeMotorista?: string | null
  cliente?: { nome: string }
  fonteGeradora?: { nome: string }
}

export interface CreateMTRDTO {
  clienteId: string
  fonteGeradoraId?: string
  transportadoraId: string
  destinadorId: string
  numeroMTR?: string
  status: StatusMTR
  tipoDestinacao: TipoDestinacaoFinal
  volume: number
  unidadeMedida: UnidadeMedida
  dataEmissao: string
  placaVeiculo?: string
  nomeMotorista?: string
  cpfMotorista?: string
  observacoes?: string
}
