// Mock data for Greenly MVP

export type StatusLicenca = "ATIVA" | "VENCIDA" | "EM_RENOVACAO" | "AGUARDANDO_EMISSAO" | "SUSPENSA";
export type StatusCondicionante = "A_CUMPRIR" | "EM_ANDAMENTO" | "CUMPRIDA" | "ATRASADA" | "DISPENSADA";
export type StatusMTR = "EMITIDO" | "EM_TRANSITO" | "RECEBIDO" | "CDF_EMITIDO" | "CANCELADO" | "COM_DIVERGENCIA";
export type TipoLicenca = "LP" | "LI" | "LO" | "LO_CORRETIVA" | "LA" | "LAS" | "DISPENSA";

export interface Licenca {
  id: string;
  cliente: string;
  tipo: TipoLicenca;
  status: StatusLicenca;
  numeroProcesso: string;
  numeroLicenca: string;
  orgao: string;
  dataEmissao: string;
  dataValidade: string;
  diasRestantes: number;
  empreendimento: string;
}

export interface Condicionante {
  id: string;
  licencaId: string;
  codigo: string;
  descricao: string;
  tipo: "PERIODICA" | "PONTUAL";
  status: StatusCondicionante;
  prazo: string;
  diasRestantes: number;
  responsavel: string;
}

export interface MTR {
  id: string;
  numero: string;
  cliente: string;
  residuo: string;
  classe: string;
  volume: number;
  unidade: string;
  transportadora: string;
  destinador: string;
  status: StatusMTR;
  dataEmissao: string;
  dataColeta?: string;
  dataRecebimento?: string;
  dataCDF?: string;
  tipoDestinacao: string;
}

export const licencas: Licenca[] = [
  { id: "1", cliente: "Mineradora Vale Norte", tipo: "LO", status: "ATIVA", numeroProcesso: "IAT-2024-0891", numeroLicenca: "LO-4521/2023", orgao: "IAT", dataEmissao: "2023-03-15", dataValidade: "2027-03-15", diasRestantes: 365, empreendimento: "Mina de Calcário - Unidade Rio Branco" },
  { id: "2", cliente: "Indústria Química Paraná", tipo: "LO", status: "ATIVA", numeroProcesso: "IAT-2023-1204", numeroLicenca: "LO-3892/2022", orgao: "IAT", dataEmissao: "2022-06-10", dataValidade: "2026-06-10", diasRestantes: 85, empreendimento: "Planta de Tratamento Químico" },
  { id: "3", cliente: "Sanepar - ETE Norte", tipo: "LI", status: "EM_RENOVACAO", numeroProcesso: "IAT-2024-0332", numeroLicenca: "LI-7801/2021", orgao: "IAT", dataEmissao: "2021-01-20", dataValidade: "2026-01-20", diasRestantes: -55, empreendimento: "Estação de Tratamento de Esgoto" },
  { id: "4", cliente: "Cimentos Apucarana", tipo: "LP", status: "AGUARDANDO_EMISSAO", numeroProcesso: "IBAMA-2024-4501", numeroLicenca: "—", orgao: "IBAMA", dataEmissao: "—", dataValidade: "—", diasRestantes: 0, empreendimento: "Nova Planta de Coprocessamento" },
  { id: "5", cliente: "Frigorífico Oeste", tipo: "LO", status: "VENCIDA", numeroProcesso: "IAT-2022-0912", numeroLicenca: "LO-2190/2020", orgao: "IAT", dataEmissao: "2020-08-01", dataValidade: "2024-08-01", diasRestantes: -230, empreendimento: "Unidade de Abate e Processamento" },
  { id: "6", cliente: "Papel & Celulose Sul", tipo: "LO", status: "ATIVA", numeroProcesso: "IAT-2023-0781", numeroLicenca: "LO-5610/2023", orgao: "IAT", dataEmissao: "2023-09-01", dataValidade: "2027-09-01", diasRestantes: 540, empreendimento: "Fábrica de Celulose Branqueada" },
  { id: "7", cliente: "Energia Solar PR", tipo: "LAS", status: "ATIVA", numeroProcesso: "IAT-2024-1102", numeroLicenca: "LAS-0091/2024", orgao: "IAT", dataEmissao: "2024-02-15", dataValidade: "2028-02-15", diasRestantes: 700, empreendimento: "Usina Fotovoltaica 5MW" },
  { id: "8", cliente: "Mineradora Vale Norte", tipo: "LI", status: "ATIVA", numeroProcesso: "IAT-2024-0450", numeroLicenca: "LI-1120/2024", orgao: "IAT", dataEmissao: "2024-01-10", dataValidade: "2026-07-10", diasRestantes: 115, empreendimento: "Expansão da Cava Norte" },
];

export const condicionantes: Condicionante[] = [
  { id: "1", licencaId: "1", codigo: "Cond. 2.1", descricao: "Monitoramento da qualidade da água subterrânea", tipo: "PERIODICA", status: "A_CUMPRIR", prazo: "2026-04-15", diasRestantes: 29, responsavel: "Ana Silva" },
  { id: "2", licencaId: "1", codigo: "Cond. 3.1", descricao: "Relatório de controle de emissões atmosféricas", tipo: "PERIODICA", status: "ATRASADA", prazo: "2026-02-28", diasRestantes: -17, responsavel: "Carlos Mendes" },
  { id: "3", licencaId: "2", codigo: "Cond. 1.1", descricao: "Construção de bacia de contenção do setor de armazenamento", tipo: "PONTUAL", status: "EM_ANDAMENTO", prazo: "2026-06-30", diasRestantes: 105, responsavel: "Roberto Lima" },
  { id: "4", licencaId: "2", codigo: "Cond. 4.2", descricao: "Monitoramento de efluentes líquidos", tipo: "PERIODICA", status: "ATRASADA", prazo: "2026-03-01", diasRestantes: -16, responsavel: "Juliana Costa" },
  { id: "5", licencaId: "3", codigo: "Cond. 1.1", descricao: "Plano de recuperação de área degradada (PRAD)", tipo: "PONTUAL", status: "CUMPRIDA", prazo: "2025-12-01", diasRestantes: 0, responsavel: "Marcos Vieira" },
  { id: "6", licencaId: "5", codigo: "Cond. 2.3", descricao: "Relatório de gestão de resíduos sólidos", tipo: "PERIODICA", status: "ATRASADA", prazo: "2025-11-30", diasRestantes: -107, responsavel: "Fernanda Oliveira" },
  { id: "7", licencaId: "6", codigo: "Cond. 5.1", descricao: "Programa de educação ambiental para comunidade", tipo: "PONTUAL", status: "A_CUMPRIR", prazo: "2026-08-15", diasRestantes: 151, responsavel: "Pedro Santos" },
];

export const mtrs: MTR[] = [
  { id: "1", numero: "MTR-PR-2026-00451", cliente: "Indústria Química Paraná", residuo: "Borra de tinta (F019)", classe: "Classe I", volume: 2.5, unidade: "TON", transportadora: "TransAmbiental Ltda", destinador: "Essencis Soluções", status: "CDF_EMITIDO", dataEmissao: "2026-01-10", dataColeta: "2026-01-12", dataRecebimento: "2026-01-13", dataCDF: "2026-01-20", tipoDestinacao: "Incineração" },
  { id: "2", numero: "MTR-PR-2026-00452", cliente: "Mineradora Vale Norte", residuo: "Óleo lubrificante usado (D001)", classe: "Classe I", volume: 1.8, unidade: "TON", transportadora: "LogAmbiental SA", destinador: "Cetrel Ambiental", status: "RECEBIDO", dataEmissao: "2026-02-05", dataColeta: "2026-02-07", dataRecebimento: "2026-02-09", tipoDestinacao: "Rerrefino" },
  { id: "3", numero: "MTR-PR-2026-00453", cliente: "Frigorífico Oeste", residuo: "Lodo de ETE (A009)", classe: "Classe II-A", volume: 12.4, unidade: "TON", transportadora: "TransAmbiental Ltda", destinador: "Aterro Industrial PR", status: "EM_TRANSITO", dataEmissao: "2026-03-01", dataColeta: "2026-03-03", tipoDestinacao: "Aterro Industrial" },
  { id: "4", numero: "MTR-PR-2026-00454", cliente: "Papel & Celulose Sul", residuo: "Cinzas de caldeira (A017)", classe: "Classe II-B", volume: 8.0, unidade: "TON", transportadora: "EcoTransporte PR", destinador: "Cimentos Apucarana", status: "EMITIDO", dataEmissao: "2026-03-15", tipoDestinacao: "Coprocessamento" },
  { id: "5", numero: "MTR-PR-2026-00455", cliente: "Indústria Química Paraná", residuo: "Solventes contaminados (F001)", classe: "Classe I", volume: 0.8, unidade: "TON", transportadora: "LogAmbiental SA", destinador: "Essencis Soluções", status: "EMITIDO", dataEmissao: "2026-03-16", tipoDestinacao: "Incineração" },
  { id: "6", numero: "MTR-PR-2026-00456", cliente: "Sanepar - ETE Norte", residuo: "Lodo de ETE (A009)", classe: "Classe II-A", volume: 25.0, unidade: "TON", transportadora: "TransAmbiental Ltda", destinador: "Aterro Industrial PR", status: "COM_DIVERGENCIA", dataEmissao: "2026-02-20", dataColeta: "2026-02-22", dataRecebimento: "2026-02-24", tipoDestinacao: "Aterro Industrial" },
];

export const dashboardStats = {
  licencasAtivas: 5,
  licencasVencendo30d: 1,
  licencasVencidas: 1,
  condicionantesAtrasadas: 3,
  condicionantesProximas30d: 1,
  mtrsEmAberto: 3,
  residuosProcessadosMes: 47.2,
  clientesAtivos: 7,
};

export const residuosMensais = [
  { mes: "Out", classeI: 3.2, classeIIA: 18.5, classeIIB: 5.1 },
  { mes: "Nov", classeI: 4.1, classeIIA: 22.3, classeIIB: 6.8 },
  { mes: "Dez", classeI: 2.8, classeIIA: 15.9, classeIIB: 4.2 },
  { mes: "Jan", classeI: 5.3, classeIIA: 20.1, classeIIB: 7.5 },
  { mes: "Fev", classeI: 3.6, classeIIA: 19.8, classeIIB: 5.9 },
  { mes: "Mar", classeI: 4.5, classeIIA: 25.0, classeIIB: 8.0 },
];
