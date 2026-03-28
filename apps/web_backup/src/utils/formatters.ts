import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const formatDate = (date: string | Date) =>
  format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR })

export const formatRelative = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { locale: ptBR, addSuffix: true })

export const formatCNPJ = (cnpj: string) =>
  cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')

export const formatVolume = (volume: number, unidade: string) =>
  `${volume.toLocaleString('pt-BR')} ${unidade}`
