export const categoriaDocumentoAmbientalValues = [
  'LICENCIAMENTO',
  'OPERACAO_RESIDUOS',
  'REGULARIDADE_FEDERAL',
  'FORNECEDORES_DESTINADORES',
  'CARTOGRAFIA',
  'ADMINISTRATIVO_JURIDICO',
  'EVIDENCIAS_CAMPO',
  'UTILIDADES_CONCESSIONARIAS',
  'OUTROS',
] as const

export type CategoriaDocumentoAmbiental = (typeof categoriaDocumentoAmbientalValues)[number]

export const tipoDocumentoAmbientalValues = [
  'LICENCA_AMBIENTAL',
  'REQUERIMENTO_LICENCA',
  'PARECER_TECNICO_AMBIENTAL',
  'OFICIO_AMBIENTAL',
  'PUBLICACAO_OFICIAL',
  'RELATORIO_MONITORAMENTO',
  'RELATORIO_MENSAL',
  'MTR',
  'CDF',
  'INVENTARIO_RESIDUOS',
  'DMR',
  'IBAMA_TCFA',
  'IBAMA_CTF_CERTIFICADO',
  'COMPROVANTE_TAXA',
  'LICENCA_DESTINADOR',
  'MAPA_GEOESPACIAL',
  'EVIDENCIA_FOTOGRAFICA',
  'CADASTRO_PJ_CONTRATUAL',
  'ANUENCIA_CONCESSIONARIA',
  'OUTRO',
] as const

export type TipoDocumentoAmbiental = (typeof tipoDocumentoAmbientalValues)[number]

export const campoDocumentoAmbientalValues = [
  'NUMERO_LICENCA',
  'NUMERO_PROCESSO',
  'ORGAO_EMISSOR',
  'DATA_EMISSAO',
  'DATA_VALIDADE',
  'PROTOCOLO',
  'CNPJ',
  'NUMERO_MTR',
  'NUMERO_CDF',
  'COMPETENCIA',
  'TIPO_RESIDUO',
  'QUANTIDADE_RESIDUO',
  'UNIDADE_MEDIDA',
  'CODIGO_IBAMA',
  'CODIGO_CTF',
  'VALOR_TAXA',
  'MUNICIPIO_UF',
  'COORDENADAS',
  'RESPONSAVEL_TECNICO',
  'ART_REFERENCIA',
  'TIPO_RELATORIO',
  'REFERENCIA_MENSAL',
  'CNPJ_TRANSPORTADOR',
  'CNPJ_DESTINADOR',
  'NOME_EMPREENDIMENTO',
  'ATIVIDADE_LICENCIADA',
  'TIPO_LICENCA',
  'MUNICIPIO_EMISSOR',
  'TIPO_DESTINACAO',
  'MOTORISTA_NOME',
  'MOTORISTA_CPF',
  'MOTORISTA_PLACA',
  'DATA_TRANSPORTE',
  'OBSERVACAO',
] as const

export type CampoDocumentoAmbiental = (typeof campoDocumentoAmbientalValues)[number]

export interface DocumentoCatalogoItemDTO {
  tipo: TipoDocumentoAmbiental
  categoria: CategoriaDocumentoAmbiental
  descricao: string
  extensoesAceitas: string[]
  palavrasChave: string[]
  camposObrigatorios: CampoDocumentoAmbiental[]
  camposOpcionais: CampoDocumentoAmbiental[]
}

export interface DocumentoCatalogoResponseDTO {
  versao: string
  itens: DocumentoCatalogoItemDTO[]
}

export interface DocumentoClassificacaoAlternativaDTO {
  tipo: TipoDocumentoAmbiental
  categoria: CategoriaDocumentoAmbiental
  confianca: number
}

export interface DocumentoClassificacaoResponseDTO {
  tipo: TipoDocumentoAmbiental
  categoria: CategoriaDocumentoAmbiental
  confianca: number
  justificativas: string[]
  camposObrigatorios: CampoDocumentoAmbiental[]
  camposOpcionais: CampoDocumentoAmbiental[]
  alternativas: DocumentoClassificacaoAlternativaDTO[]
}

export const perfilDocumentoClienteValues = [
  'GLOBAL',
  'GERADOR_RESIDUO',
  'PRESTADOR_SERVICO',
  'TRANSPORTADOR',
  'DESTINADOR',
  'MULTI_PAPEL',
  'OUTRO',
] as const

export type PerfilDocumentoCliente = (typeof perfilDocumentoClienteValues)[number]

export interface DocumentoContratoExtracaoItemDTO {
  tipo: TipoDocumentoAmbiental
  categoria: CategoriaDocumentoAmbiental
  descricao: string
  camposObrigatorios: CampoDocumentoAmbiental[]
  camposOpcionais: CampoDocumentoAmbiental[]
  origemContrato: 'GLOBAL' | 'GLOBAL_COM_OVERRIDE_PERFIL'
}

export interface DocumentoContratoExtracaoResponseDTO {
  versao: string
  perfilCliente: PerfilDocumentoCliente
  itens: DocumentoContratoExtracaoItemDTO[]
}

export interface PacoteShapefileValidacaoDTO {
  identificador: string
  arquivosEncontrados: string[]
  faltantesObrigatorios: string[]
  faltantesRecomendados: string[]
  completo: boolean
}

export interface ValidarPacoteGeoespacialResponseDTO {
  totalArquivos: number
  projetosQgis: string[]
  camadasKmlKmz: string[]
  exportacoesMapa: string[]
  pacotesShapefile: PacoteShapefileValidacaoDTO[]
  avisos: string[]
}

export const origemProcessamentoDocumentoValues = [
  'UPLOAD_LICENCA',
  'UPLOAD_MTR',
  'UPLOAD_CDF',
  'UPLOAD_GERAL',
] as const

export type OrigemProcessamentoDocumento = (typeof origemProcessamentoDocumentoValues)[number]

export interface IngerirDocumentoMetadataDTO {
  clienteId?: string
  licencaId?: string
  origem: OrigemProcessamentoDocumento
  tipoDeclarado?: TipoDocumentoAmbiental
  categoriaDeclarada?: CategoriaDocumentoAmbiental
}

export interface IngerirDocumentoResponseDTO {
  processamentoDocumentoId: string
  status: 'RECEBIDO' | 'CLASSIFICANDO' | 'PROCESSANDO' | 'CONCLUIDO' | 'FALHA'
  duplicado: boolean
  documentoHash: string
  documentoNome: string
  tipo: TipoDocumentoAmbiental
  categoria: CategoriaDocumentoAmbiental
  confiancaClassificacao: number
  retencaoDias: number
  expirarEm: Date | null
  fila: {
    nome: string
    jobId: string
  } | null
}

export const statusRevisaoDocumentoValues = [
  'PENDENTE_REVISAO',
  'APROVADO_SEM_AJUSTES',
  'APROVADO_COM_AJUSTES',
  'REJEITADO',
] as const

export type StatusRevisaoDocumento = (typeof statusRevisaoDocumentoValues)[number]

export type OrigemExtracaoCampoDocumento =
  | 'REGEX'
  | 'HEURISTICA'
  | 'INFERENCIA_PERFIL'
  | 'NAO_ENCONTRADO'

export interface DocumentoCampoExtraidoDTO {
  campo: CampoDocumentoAmbiental
  valor: string | null
  confianca: number
  motivo: string
  obrigatorio: boolean
  origem: OrigemExtracaoCampoDocumento
}

export interface DocumentoRevisaoPendenteItemDTO {
  processamentoDocumentoId: string
  documentoNome: string
  tipo: TipoDocumentoAmbiental
  categoria: CategoriaDocumentoAmbiental
  perfilCliente: PerfilDocumentoCliente
  revisaoStatus: StatusRevisaoDocumento
  confiancaMediaExtracao: number
  camposObrigatoriosTotal: number
  camposObrigatoriosPendentes: number
  recebidoEm: Date
  atualizadoEm: Date
}

export interface DocumentoRevisaoDetalheResponseDTO {
  processamentoDocumentoId: string
  documentoNome: string
  tipo: TipoDocumentoAmbiental
  categoria: CategoriaDocumentoAmbiental
  perfilCliente: PerfilDocumentoCliente
  statusProcessamento: IngerirDocumentoResponseDTO['status']
  revisaoStatus: StatusRevisaoDocumento
  confiancaMediaExtracao: number
  recebidoEm: Date
  concluidoEm: Date | null
  textoSnippet: string | null
  camposObrigatorios: CampoDocumentoAmbiental[]
  camposOpcionais: CampoDocumentoAmbiental[]
  campos: DocumentoCampoExtraidoDTO[]
}

export interface RevisarDocumentoCampoDTO {
  campo: CampoDocumentoAmbiental
  valorFinal: string | null
}

export interface RevisarDocumentoResponseDTO {
  processamentoDocumentoId: string
  revisaoStatus: Exclude<StatusRevisaoDocumento, 'PENDENTE_REVISAO'>
  camposAvaliados: number
  camposCorrigidos: number
  acuraciaPct: number
  revisadoEm: Date
}

export interface DocumentoCrudLicencaSugestaoDTO {
  licencaId: string | null
  numeroLicenca: string | null
  payloadAtualizacao: {
    numeroLicenca?: string
    numeroProcesso?: string
    orgaoAmbientalId?: string
    nomeEmpreendimento?: string
    atividadeLicenciada?: string
    municipioEmissor?: string
    dataEmissao?: Date
    dataValidade?: Date
    tipo?: string
    extracaoDadosIa?: any
  }
  condicionantesSugeridas: Array<{
    codigo?: string | null
    descricao: string
    tipo: 'PERIODICA' | 'PONTUAL'
    periodicidade:
      | 'SEMANAL'
      | 'MENSAL'
      | 'BIMESTRAL'
      | 'TRIMESTRAL'
      | 'SEMESTRAL'
      | 'ANUAL'
      | null
    prazo: Date | null
    diaVencimento?: number | null
    inicioPeriodicidade?: Date | null
    confianca: number
    justificativa: string
    trechoOrigem?: string | null
  }>
  camposMapeados: CampoDocumentoAmbiental[]
  pendencias: string[]
}

export interface DocumentoCrudMtrSugestaoDTO {
  mtrId: string | null
  numeroMTR: string | null
  payloadAtualizacao: {
    numeroMTR?: string
    dataEmissao?: Date
    volume?: number
    unidadeMedida?: 'KG' | 'TON' | 'LITRO' | 'M3' | 'UNIDADE'
    transportadoraId?: string
    destinadorId?: string
    tipoDestinacao?:
      | 'ATERRO_SANITARIO'
      | 'ATERRO_INDUSTRIAL'
      | 'INCINERACAO'
      | 'COPROCESSAMENTO'
      | 'RECICLAGEM'
      | 'COMPOSTAGEM'
      | 'TRATAMENTO_BIOLOGICO'
      | 'TRATAMENTO_QUIMICO'
      | 'TRATAMENTO_FISICO'
      | 'REUTILIZACAO'
      | 'LOGISTICA_REVERSA'
      | 'OUTRO'
  }
  itemResiduo?: {
    descricao?: string
    codigoIbama?: string
    quantidade?: number
    unidadeMedida?: 'KG' | 'TON' | 'LITRO' | 'M3' | 'UNIDADE'
  }
  camposMapeados: CampoDocumentoAmbiental[]
  pendencias: string[]
}

export interface DocumentoCrudSugestaoResponseDTO {
  processamentoDocumentoId: string
  tipoDocumento: TipoDocumentoAmbiental
  origemDados: 'REVISAO_HUMANA' | 'EXTRACAO_AUTOMATICA'
  licenca: DocumentoCrudLicencaSugestaoDTO | null
  mtr: DocumentoCrudMtrSugestaoDTO | null
  clienteSugestao: {
    nome: string | null
    cnpj: string | null
    existente: boolean
    clienteId?: string | null
  } | null
  avisos: string[]
}

export interface DocumentoCrudAplicacaoResultadoDTO {
  aplicado: boolean
  entidadeId: string | null
  entidadeTipo: 'LICENCA' | 'MTR' | 'CONDICIONANTE'
  camposAtualizados: string[]
  mensagem: string
}

export interface AplicarDocumentoCrudResponseDTO {
  processamentoDocumentoId: string
  aplicacaoEm: Date
  resultados: DocumentoCrudAplicacaoResultadoDTO[]
  avisos: string[]
}

export interface DocumentoQualidadeTipoItemDTO {
  tipo: TipoDocumentoAmbiental
  revisados: number
  aprovadosComAjustes: number
  acuraciaMediaPct: number
  taxaRetrabalhoPct: number
}

export interface DocumentoQualidadeMetricsResponseDTO {
  periodoDias: number
  revisadosTotal: number
  aprovadosSemAjustes: number
  aprovadosComAjustes: number
  rejeitados: number
  acuraciaMediaPct: number
  taxaRetrabalhoPct: number
  tempoMedioRevisaoSegundos: number
  porTipo: DocumentoQualidadeTipoItemDTO[]
}

export interface DocumentoTemplateRequisitoItemDTO {
  tipo: TipoDocumentoAmbiental
  categoria: CategoriaDocumentoAmbiental
  descricao: string
  perfilCliente: PerfilDocumentoCliente
  camposObrigatorios: CampoDocumentoAmbiental[]
  camposOpcionais: CampoDocumentoAmbiental[]
  origem: 'GLOBAL' | 'CONSULTORIA_OVERRIDE'
  atualizadoEm: Date | null
}

export interface DocumentoTemplateRequisitosResponseDTO {
  versao: string
  perfilCliente: PerfilDocumentoCliente
  itens: DocumentoTemplateRequisitoItemDTO[]
}

export interface DocumentoCondicionanteCandidataDTO {
  id: string
  descricao: string
  tipo: 'PERIODICA' | 'PONTUAL'
  periodicidade:
    | 'SEMANAL'
    | 'MENSAL'
    | 'BIMESTRAL'
    | 'TRIMESTRAL'
    | 'SEMESTRAL'
    | 'ANUAL'
    | null
  prazoSugerido: Date | null
  confianca: number
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA'
  justificativas: string[]
  historicoReferencia: {
    condicionantesSemelhantes: number
    taxaAprovacaoTipoPct: number
  } | null
}

export interface DocumentoCondicionantesCandidatasResponseDTO {
  processamentoDocumentoId: string
  tipoDocumento: TipoDocumentoAmbiental
  perfilCliente: PerfilDocumentoCliente
  total: number
  itens: DocumentoCondicionanteCandidataDTO[]
}

export const statusReprocessamentoDocumentoValues = [
  'SOLICITADO',
  'EM_PROCESSAMENTO',
  'CONCLUIDO',
  'FALHA',
] as const

export type StatusReprocessamentoDocumento = (typeof statusReprocessamentoDocumentoValues)[number]

export interface ReprocessarDocumentoResponseDTO {
  reprocessamentoId: string
  processamentoDocumentoId: string
  status: StatusReprocessamentoDocumento
  solicitadoEm: Date
  slaSegundos: number
  fila: {
    nome: string
    jobId: string
  } | null
}

export interface DocumentoReprocessamentoItemDTO {
  reprocessamentoId: string
  processamentoDocumentoId: string
  status: StatusReprocessamentoDocumento
  motivo: string | null
  slaSegundos: number
  solicitadoEm: Date
  iniciadoEm: Date | null
  concluidoEm: Date | null
  duracaoSegundos: number | null
  dentroSla: boolean | null
  erro: string | null
}

export interface DocumentoReprocessamentoMetricasResponseDTO {
  periodoHoras: number
  slaPadraoSegundos: number
  totalSolicitados: number
  totalConcluidos: number
  totalFalhas: number
  pendentes: number
  emAtraso: number
  dentroSlaPct: number
  tempoMedioConclusaoSegundos: number
  itensRecentes: DocumentoReprocessamentoItemDTO[]
}

export interface DashboardDocumentoPipelineThresholdsDTO {
  backlogMaximo: number
  taxaErroMaximaPct: number
  latenciaMediaMaximaSegundos: number
}

export interface DashboardDocumentoPipelineAlertaItemDTO {
  indicador: 'BACKLOG' | 'TAXA_ERRO' | 'LATENCIA_MEDIA'
  valorAtual: number
  limite: number
  status: 'OK' | 'ATENCAO' | 'CRITICO'
  mensagem: string
}

export interface DashboardDocumentoPipelineAlertasResponseDTO {
  periodoHoras: number
  thresholds: DashboardDocumentoPipelineThresholdsDTO
  resumo: {
    backlog: number
    taxaErroPeriodoPct: number
    tempoMedioProcessamentoSegundos: number
    falhasPeriodo: number
    concluidosPeriodo: number
  }
  alertas: DashboardDocumentoPipelineAlertaItemDTO[]
}
