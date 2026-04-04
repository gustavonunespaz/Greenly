import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ENUM_LABELS: Record<string, string> = {
  // Licenças
  ATIVA: 'Ativa',
  VENCIDA: 'Vencida',
  EM_RENOVACAO: 'Em Renovação',
  AGUARDANDO_EMISSAO: 'Aguardando',
  SUSPENSA: 'Suspensa',
  CASSADA: 'Cassada',
  DISPENSADA: 'Dispensada',
  ARQUIVADA: 'Arquivada',
  
  // Tipos de Licença (Afastando as siglas comuns para não poluir muito)
  LP: 'LP',
  LI: 'LI',
  LO: 'LO',
  LO_CORRETIVA: 'LO Corretiva',
  LA: 'LA',
  LAS: 'LAS',
  LAU: 'LAU',
  RLO: 'RLO',
  RLI: 'RLI',
  RLP: 'RLP',
  DLAE: 'DLAE',
  DISPENSA: 'Dispensa',
  AUTORIZACAO: 'Autorização',
  
  // Condicionantes
  A_CUMPRIR: 'A Cumprir',
  EM_ANDAMENTO: 'Em Andamento',
  CUMPRIDA: 'Cumprida',
  ATRASADA: 'Atrasada',
  PONTUAL: 'Pontual',
  PERIODICA: 'Periódica',
  
  // MTR Status
  EMITIDO: 'Emitido',
  EM_TRANSITO: 'Em Trânsito',
  RECEBIDO: 'Recebido',
  CDF_EMITIDO: 'CDF Emitido',
  CANCELADO: 'Cancelado',
  COM_DIVERGENCIA: 'Divergência',
  
  // MTR Destinação
  ATERRO_SANITARIO: 'Aterro Sanitário',
  ATERRO_INDUSTRIAL: 'Aterro Industrial',
  INCINERACAO: 'Incineração',
  COPROCESSAMENTO: 'Coprocessamento',
  RECICLAGEM: 'Reciclagem',
  COMPOSTAGEM: 'Compostagem',
  TRATAMENTO_BIOLOGICO: 'Tratamento Biológico',
  TRATAMENTO_QUIMICO: 'Tratamento Químico',
  TRATAMENTO_FISICO: 'Tratamento Físico',
  REUTILIZACAO: 'Reutilização',
  LOGISTICA_REVERSA: 'Logística Reversa',
  
  // Estados Físicos
  SOLIDO: 'Sólido',
  LIQUIDO: 'Líquido',
  SEMI_SOLIDO: 'Semi-sólido',
  GASOSO: 'Gasoso',
  PASTOSO: 'Pastoso',
  
  // Acondicionamento
  TAMBOR: 'Tambor',
  BIG_BAG: 'Big Bag',
  CACAMBA: 'Caçamba',
  CONTAINER: 'Container',
  GRANEL: 'Granel',
  BOMBONA: 'Bombona',
  FARDO: 'Fardo',
  SACO: 'Saco',
  CAIXA: 'Caixa',

  // Unidades
  KG: 'kg',
  TON: 'ton',
  LITRO: 'Litro',
  M3: 'm³',
  UNIDADE: 'Unidade',

  // Tasks
  A_FAZER: 'A Fazer',
  FAZENDO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
  OUTRO: 'Outro',
}

export function formatEnum(value: string | undefined | null): string {
  if (!value) return '';
  const upper = value.toUpperCase();
  if (ENUM_LABELS[upper]) return ENUM_LABELS[upper];

  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

