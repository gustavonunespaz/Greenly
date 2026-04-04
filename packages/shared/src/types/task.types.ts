export interface TaskResponseDTO {
  id: string;
  usuarioId: string;
  clienteId?: string;
  titulo: string;
  descricao?: string;
  status: string;
  dataPrazo?: Date;
  horaInicio?: string;
  horaFim?: string;
  notificacaoDias?: number;
  mtrId?: string;
  licencaId?: string;
  posicao: number;
  cor?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface CreateTaskDTO {
  titulo: string;
  descricao?: string;
  status?: string;
  dataPrazo?: Date | string;
  horaInicio?: string;
  horaFim?: string;
  notificacaoDias?: number;
  mtrId?: string;
  licencaId?: string;
  clienteId?: string;
  cor?: string;
  posicao?: number;
}

export interface UpdateTaskDTO {
  titulo?: string;
  descricao?: string;
  status?: string;
  dataPrazo?: Date | string;
  horaInicio?: string;
  horaFim?: string;
  notificacaoDias?: number;
  mtrId?: string;
  licencaId?: string;
  clienteId?: string;
  cor?: string;
  posicao?: number;
}
