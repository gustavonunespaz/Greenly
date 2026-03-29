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
