export type TipoLicenca = 'LP' | 'LI' | 'LO' | 'LO_CORRETIVA' | 'LA' | 'LAS' | 'LAU' | 'RLO' | 'RLI' | 'RLP' | 'DLAE' | 'DISPENSA' | 'AUTORIZACAO' | 'OUTRO'
export type StatusLicenca = 'ATIVA' | 'VENCIDA' | 'EM_RENOVACAO' | 'SUSPENSA' | 'CASSADA' | 'AGUARDANDO_EMISSAO' | 'DISPENSADA' | 'ARQUIVADA'

export interface LicencaDTO {
  id: string
  clienteId: string
  instalacaoId?: string | null
  tipo: TipoLicenca
  status: StatusLicenca
  numeroProcesso?: string | null
  numeroLicenca?: string | null
  nomeEmpreendimento?: string | null
  atividadeLicenciada?: string | null
  dataEmissao?: string | Date | null
  dataLimiteRenovacao?: string | Date | null
  municipioEmissor?: string | null
  documentoUrl?: string | null
  cliente?: {
    nome: string
  }
}

export interface CreateLicencaDTO {
  clienteId: string
  instalacaoId?: string
  orgaoAmbientalId: string
  tipo: TipoLicenca
  status: StatusLicenca
  numeroProcesso?: string
  numeroLicenca?: string
  nomeEmpreendimento?: string
  atividadeLicenciada?: string
  dataEmissao?: string
  dataValidade?: string
  dataLimiteRenovacao?: string
  municipioEmissor?: string
  observacoes?: string
}
