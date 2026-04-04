/**
 * Constantes globais da aplicação Greenly
 */

export const STORAGE_KEYS = {
  DISMISSED_FEDERAL_OBLIGATIONS: 'greenly_dismissed_federal',
}

export interface OfficialObligation {
  id: string
  titulo: string
  subtitulo: string
  descricao: string
  orgao: string
  esfera: 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL'
  mes: number // 0-indexed (0 = Jan, 1 = Fev...)
  dia: number
  notificacaoPadraoDias: number
}

export const OFFICIAL_OBLIGATIONS: OfficialObligation[] = [
  {
    id: 'rapp',
    titulo: 'RAPP (IBAMA)',
    subtitulo: 'Relatório Anual',
    descricao: 'Relatório Anual de Atividades Potencialmente Poluidoras.',
    orgao: 'IBAMA',
    esfera: 'FEDERAL',
    mes: 2, // Março
    dia: 31,
  },
  {
    id: 'inv',
    titulo: 'Inventário Nacional',
    subtitulo: 'SINIR/MMA',
    descricao: 'Declaração anual no SINIR (Inventário Nacional de Resíduos Sólidos).',
    orgao: 'SINIR/MMA',
    esfera: 'FEDERAL',
    mes: 2, // Março
    dia: 31,
  },
  {
    id: 'tcfa1',
    titulo: 'TCFA - 1º Trimestre',
    subtitulo: 'Taxa Federal (IBAMA)',
    descricao: 'Pagamento da Taxa de Controle e Fiscalização Ambiental - 1º Tri.',
    orgao: 'IBAMA',
    esfera: 'FEDERAL',
    mes: 3, // Abril
    dia: 5,
    notificacaoPadraoDias: 15,
  },
  {
    id: 'tcfa2',
    titulo: 'TCFA - 2º Trimestre',
    subtitulo: 'Taxa Federal (IBAMA)',
    descricao: 'Pagamento da Taxa de Controle e Fiscalização Ambiental - 2º Tri.',
    orgao: 'IBAMA',
    esfera: 'FEDERAL',
    mes: 6, // Julho
    dia: 5,
    notificacaoPadraoDias: 15,
  },
  {
    id: 'tcfa3',
    titulo: 'TCFA - 3º Trimestre',
    subtitulo: 'Taxa Federal (IBAMA)',
    descricao: 'Pagamento da Taxa de Controle e Fiscalização Ambiental - 3º Tri.',
    orgao: 'IBAMA',
    esfera: 'FEDERAL',
    mes: 9, // Outubro
    dia: 5,
    notificacaoPadraoDias: 15,
  },
  {
    id: 'tcfa4',
    titulo: 'TCFA - 4º Trimestre',
    subtitulo: 'Taxa Federal (IBAMA)',
    descricao: 'Pagamento da Taxa de Controle e Fiscalização Ambiental - 4º Tri.',
    orgao: 'IBAMA',
    esfera: 'FEDERAL',
    mes: 0, // Janeiro (próximo ano)
    dia: 5,
    notificacaoPadraoDias: 15,
  },
]
