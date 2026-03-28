export type TipoCondicionante = 'PERIODICA' | 'PONTUAL'
export type StatusCondicionante = 'A_CUMPRIR' | 'EM_ANDAMENTO' | 'CUMPRIDA' | 'ATRASADA' | 'DISPENSADA'
export type PeriodicidadeCondicionante = 'SEMANAL' | 'MENSAL' | 'BIMESTRAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL'

export interface CondicionanteDTO {
  id: string
  licencaId: string
  codigo?: string | null
  descricao: string
  tipo: TipoCondicionante
  status: StatusCondicionante
  prazo?: string | Date | null
  dataCumprimento?: string | Date | null
  periodicidade?: PeriodicidadeCondicionante | null
  proximoPrazo?: string | Date | null
  responsavelCliente?: string | null
  evidenciaUrl?: string | null
}

export interface CreateCondicionanteDTO {
  licencaId: string
  codigo?: string
  descricao: string
  tipo: TipoCondicionante
  status: StatusCondicionante
  prazo?: string
  periodicidade?: PeriodicidadeCondicionante
  diaVencimento?: number
  inicioPeriodicidade?: string
  responsavelCliente?: string
  observacoes?: string
}
