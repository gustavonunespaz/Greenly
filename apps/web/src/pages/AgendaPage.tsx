import { AppLayout } from '@/components/layout/AppLayout'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { motion } from 'framer-motion'
import React, { useState, useMemo, useEffect, CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Calendar as CalendarIcon, Search, Building, Plus, Trash2, CheckCircle2, XCircle, LayoutGrid, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { formatEnum } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "@/components/ui/sonner"

// Calendário
import { Calendar, dateFnsLocalizer, EventProps } from 'react-big-calendar'
import * as withDragAndDropModule from 'react-big-calendar/lib/addons/dragAndDrop'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

// Hooks e APIs
import { useLicencas } from '@/features/licencas/hooks/useLicencas'
import { useCondicionantes } from '@/features/licencas/hooks/useCondicionantes'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { TaskKanbanBoard } from '@/features/tasks/components/TaskKanbanBoard'
import { useResiduos } from '@/features/residuos/hooks/useResiduos'
import { obrigacaoAmbientalService } from '@/features/obrigacoes-ambientais/services/obrigacaoAmbientalService'
import { STORAGE_KEYS } from '@/lib/constants'

const locales = {
  'pt-BR': ptBR,
}
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

function resolveWithDragAndDropEnhancer(moduleRef: unknown): ((calendar: typeof Calendar) => typeof Calendar) | null {
  const mod: any = moduleRef as any
  const candidate = mod?.default?.default ?? mod?.default ?? mod
  return typeof candidate === 'function' ? candidate : null
}

const messages = {
  allDay: 'Dia todo',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Lista',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há eventos neste período.',
  showMore: (total: number) => `+${total} mais`,
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } }
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } }
}

type EventoAgenda = {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource: {
    tipo: 'LICENCA' | 'CONDICIONANTE' | 'OBRIGACAO' | 'TAREFA'
    descricao?: string
    esfera?: string
    orgao?: string
    alertaCor: string
    customStyle?: CSSProperties
    taskId?: string
    taskStatus?: string
  }
}

function EventBadge({ event }: EventProps<EventoAgenda>) {
  return (
    <div 
      className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 w-full overflow-hidden ${event.resource.alertaCor}`}
      style={event.resource.customStyle}
    >
      <span className="font-semibold truncate">{event.title}</span>
    </div>
  )
}

function combineDateAndTime(baseDate: Date, time?: string) {
  if (!time) return baseDate
  const [hour, minute] = time.split(':').map(Number)
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return baseDate

  const next = new Date(baseDate)
  next.setHours(hour, minute, 0, 0)
  return next
}

function normalizeEnd(start: Date, end: Date, fallbackMinutes = 60) {
  if (end > start) return end
  return new Date(start.getTime() + fallbackMinutes * 60 * 1000)
}

function buildOfficialObligationId(item: {
  modulo?: string | null
  tipo: string
  competenciaAno?: number | null
  competenciaMes?: number | null
  competenciaTrimestre?: number | null
}) {
  return [
    item.modulo ?? 'SEM_MODULO',
    item.tipo,
    item.competenciaAno ?? 'SEM_ANO',
    item.competenciaMes ?? 'SEM_MES',
    item.competenciaTrimestre ?? 'SEM_TRI',
  ].join('::')
}

function roundDateDownToStep(date: Date, stepMinutes: number) {
  const next = new Date(date)
  const totalMinutes = next.getHours() * 60 + next.getMinutes()
  const rounded = Math.floor(totalMinutes / stepMinutes) * stepMinutes
  next.setHours(Math.floor(rounded / 60), rounded % 60, 0, 0)
  return next
}

function roundDateUpToStep(date: Date, stepMinutes: number) {
  const next = new Date(date)
  const totalMinutes = next.getHours() * 60 + next.getMinutes()
  const rounded = Math.ceil(totalMinutes / stepMinutes) * stepMinutes
  next.setHours(Math.floor(rounded / 60), rounded % 60, 0, 0)
  return next
}

class AgendaCalendarErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Agenda calendar crashed:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

export default function AgendaPage() {
  useTrackViewLoaded('agenda')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTaskExtrasOpen, setIsTaskExtrasOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventoAgenda | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const DragAndDropCalendar = useMemo(() => {
    const enhancer = resolveWithDragAndDropEnhancer(withDragAndDropModule)
    if (!enhancer) return null

    try {
      return enhancer(Calendar as any)
    } catch (error) {
      console.error('Failed to initialize drag-and-drop calendar:', error)
      return null
    }
  }, [])
  const [agendaView, setAgendaView] = useState<'CALENDARIO' | 'KANBAN'>(() => {
    if (typeof window === 'undefined') return 'CALENDARIO'
    const saved = window.localStorage.getItem(STORAGE_KEYS.AGENDA_VIEW_MODE)
    return saved === 'KANBAN' ? 'KANBAN' : 'CALENDARIO'
  })
  const [snapMinutes, setSnapMinutes] = useState<15 | 30>(() => {
    if (typeof window === 'undefined') return 15
    const saved = window.localStorage.getItem(STORAGE_KEYS.AGENDA_TASK_SNAP_MINUTES)
    return saved === '30' ? 30 : 15
  })
  const [showKanbanCards, setShowKanbanCards] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const saved = window.localStorage.getItem(STORAGE_KEYS.AGENDA_SHOW_KANBAN_CARDS)
    return saved !== 'false'
  })
  
  // Gerenciamento de obrigações oficiais ocultas/resolvidas
  const [dismissedObrigacaoIds, setDismissedObrigacaoIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = window.localStorage.getItem(STORAGE_KEYS.DISMISSED_OFFICIAL_OBLIGATIONS)
    if (!saved) return []

    try {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
    } catch {
      window.localStorage.removeItem(STORAGE_KEYS.DISMISSED_OFFICIAL_OBLIGATIONS)
      return []
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(
      STORAGE_KEYS.DISMISSED_OFFICIAL_OBLIGATIONS,
      JSON.stringify(dismissedObrigacaoIds),
    )
  }, [dismissedObrigacaoIds])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEYS.AGENDA_TASK_SNAP_MINUTES, String(snapMinutes))
  }, [snapMinutes])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEYS.AGENDA_VIEW_MODE, agendaView)
  }, [agendaView])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEYS.AGENDA_SHOW_KANBAN_CARDS, String(showKanbanCards))
  }, [showKanbanCards])

  const handleDismissObrigacao = (id: string) => {
    setDismissedObrigacaoIds(prev => [...prev, id])
    setIsDetailsOpen(false)
    toast.success("Obrigação ocultada da agenda.")
  }

  const { licencas = [] } = useLicencas()
  const { condicionantes = [], criarCondicionante } = useCondicionantes()
  const { clientes = [] } = useClientes()
  const { tasks = [], criarTask, atualizarTask, excluirTask } = useTasks()
  const { mtrs = [] } = useResiduos()
  const anoAtual = new Date().getFullYear()
  const { data: padroesOficiais = [] } = useQuery({
    queryKey: ['agenda-obrigacoes-padroes', anoAtual],
    queryFn: () => obrigacaoAmbientalService.listarPadroesOficiais({ ano: anoAtual }),
  })

  const [newCond, setNewCond] = useState({
    titulo: '',
    clienteId: '',
    licencaId: '',
    descricao: '',
    prazo: '',
    tipo: 'PONTUAL' as 'PONTUAL' | 'PERIODICA',
    mode: 'TAREFA' as 'TAREFA' | 'CONDICIONANTE',
    notificacaoDias: 5,
    horaInicio: '09:00',
    horaFim: '10:00',
    mtrId: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const selectedTaskId = selectedEvent?.resource.tipo === 'TAREFA' ? selectedEvent.resource.taskId : undefined
  const selectedTaskStatus = selectedEvent?.resource.tipo === 'TAREFA' ? selectedEvent.resource.taskStatus : undefined
  const isSelectedTaskDone = selectedTaskStatus === 'CONCLUIDO'

  const handleToggleTaskStatus = async () => {
    if (!selectedTaskId) return

    try {
      const nextStatus = isSelectedTaskDone ? 'A_FAZER' : 'CONCLUIDO'
      await atualizarTask({ id: selectedTaskId, dto: { status: nextStatus } })
      toast.success(isSelectedTaskDone ? 'Tarefa reaberta.' : 'Tarefa marcada como concluída.')
      setIsDetailsOpen(false)
    } catch {
      toast.error('Não foi possível atualizar a tarefa.')
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTaskId) return
    if (!confirm('Excluir esta tarefa?')) return

    try {
      await excluirTask(selectedTaskId)
      toast.success('Tarefa excluída.')
      setIsDetailsOpen(false)
    } catch {
      toast.error('Não foi possível excluir a tarefa.')
    }
  }

  const handleTaskEventWindowChange = async (payload: { event: EventoAgenda; start: Date; end: Date; isAllDay?: boolean }) => {
    const { event, start, end, isAllDay } = payload
    if (event.resource.tipo !== 'TAREFA' || !event.resource.taskId) return

    try {
      const snappedStart = roundDateDownToStep(new Date(start), snapMinutes)
      const snappedEnd = roundDateUpToStep(new Date(end), snapMinutes)

      if (isAllDay) {
        await atualizarTask({
          id: event.resource.taskId,
          dto: {
            dataPrazo: new Date(new Date(snappedStart).setHours(12, 0, 0, 0)),
            horaInicio: undefined,
            horaFim: undefined,
          },
        })
      } else {
        const adjustedEnd = normalizeEnd(snappedStart, snappedEnd, snapMinutes)
        await atualizarTask({
          id: event.resource.taskId,
          dto: {
            dataPrazo: new Date(snappedStart),
            horaInicio: format(snappedStart, 'HH:mm'),
            horaFim: format(adjustedEnd, 'HH:mm'),
          },
        })
      }
      toast.success('Período da tarefa atualizado.')
    } catch {
      toast.error('Não foi possível atualizar o período da tarefa.')
    }
  }

  // Montagem dinâmica de Eventos
  const events = useMemo(() => {
    let lista: EventoAgenda[] = []

    // 1. Obrigações oficiais dinâmicas (fonte API)
    const obrigacoes: EventoAgenda[] = padroesOficiais
      .map((ob) => {
        const start = ob.dataLimite ? new Date(ob.dataLimite) : null
        if (!start || Number.isNaN(start.getTime())) return null

        const id = buildOfficialObligationId(ob)
        return {
          id,
          title: ob.titulo,
          start,
          end: start,
          allDay: true,
          resource: {
            tipo: 'OBRIGACAO' as const,
            esfera: ob.modulo,
            orgao: ob.orgao || ob.modulo,
            descricao: [ob.descricao, ob.regraPrazo].filter(Boolean).join(' '),
            alertaCor:
              'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-semibold',
          },
        }
      })
      .filter((event): event is EventoAgenda => !!event)
      .filter((event) => !dismissedObrigacaoIds.includes(event.id))

    // 2. Licenças Ativas (que têm dataValidade)
    const licencasEvents: EventoAgenda[] = licencas
      .filter(l => l.dataValidade)
      .map(l => ({
        id: `lic-${l.id}`,
        title: `Venc. Licença ${l.tipo}`,
        start: new Date(l.dataValidade!),
        end: new Date(l.dataValidade!),
        allDay: true,
        resource: {
          tipo: 'LICENCA',
          esfera: l.orgaoEsfera || 'LOCAL',
          orgao: l.orgaoSigla || l.orgaoNome || 'Órgão AMB',
          descricao: `Licença: ${l.numeroLicenca || 'S/N'} (${formatEnum(l.status)})`,
          // Se estiver nos próximos 30 dias, marca amarelo, se passou, vemelho.
          alertaCor: (l.diasAteVencimento ?? 99) < 0 
            ? 'bg-destructive/15 text-destructive border border-destructive/20 font-semibold' 
            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold',
        }
      }))

    // 3. Condicionantes (Apenas as que TÊM PRAZO, ignorar Monitoramento Contínuo)
    const condEvents: EventoAgenda[] = condicionantes
      .filter(c => c.prazo != null)
      .map(c => ({
        id: `cond-${c.id}`,
        title: `Cond: ${c.codigo || 'Sem Cód'}`,
        start: new Date(c.prazo!),
        end: new Date(c.prazo!),
        allDay: true,
        resource: {
          tipo: 'CONDICIONANTE',
          esfera: '-',
          orgao: 'Condicionante Legal',
          descricao: c.descricao,
          alertaCor: (c.diasRestantes ?? 99) < 0 
          ? 'bg-destructive/15 text-destructive border border-destructive/20 font-semibold' 
          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-semibold',
        }
      }))

    // 4. Tasks Pessoais
    const tasksEvents: EventoAgenda[] = showKanbanCards
      ? tasks.map(t => {
      const baseDate = new Date(t.dataPrazo || t.criadoEm)
      const hasTimeWindow = Boolean(t.horaInicio && t.horaFim)
      const start = hasTimeWindow ? combineDateAndTime(baseDate, t.horaInicio) : baseDate
      const end = hasTimeWindow
        ? normalizeEnd(start, combineDateAndTime(baseDate, t.horaFim))
        : baseDate

      return {
        id: `task-${t.id}`,
        title: t.titulo,
        start,
        end,
        allDay: !hasTimeWindow,
        resource: {
          tipo: 'TAREFA',
          descricao: t.descricao,
          orgao: t.status === 'CONCLUIDO' ? 'Concluída' : 'Pendente',
          alertaCor: t.status === 'CONCLUIDO'
            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold'
            : 'text-foreground border-border font-semibold',
          customStyle: t.status !== 'CONCLUIDO' ? {
            backgroundColor: `${t.cor || '#3b82f6'}26`, // 26 is ~15% opacity
            borderLeft: `3px solid ${t.cor || '#3b82f6'}`
          } : undefined,
          taskId: t.id,
          taskStatus: t.status,
        }
      }
    })
      : []

    lista = [...obrigacoes, ...licencasEvents, ...condEvents, ...tasksEvents]

    if (searchTerm) {
      lista = lista.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (e.resource.orgao && e.resource.orgao.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return lista
  }, [padroesOficiais, licencas, condicionantes, tasks, dismissedObrigacaoIds, showKanbanCards, searchTerm])

  return (
    <AppLayout title="Agenda Ambiental Interativa">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
        
        {/* Header e Ações Visuais */}
        <motion.div variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">
              {agendaView === 'CALENDARIO' ? 'Agenda Global' : 'Kanban de Tarefas'}
            </h2>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {agendaView === 'CALENDARIO'
                ? 'Visão calendarizada de Obrigações Oficiais, Licenças, Condicionantes e Tarefas.'
                : 'Mesmas tarefas da agenda em visual Trello para organizar execução.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 rounded-md border border-border/60 p-1 w-full sm:w-auto">
              <Button
                type="button"
                size="sm"
                variant={agendaView === 'CALENDARIO' ? 'secondary' : 'ghost'}
                className="h-7 px-2 text-xs gap-1"
                onClick={() => setAgendaView('CALENDARIO')}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendário
              </Button>
              <Button
                type="button"
                size="sm"
                variant={agendaView === 'KANBAN' ? 'secondary' : 'ghost'}
                className="h-7 px-2 text-xs gap-1"
                onClick={() => setAgendaView('KANBAN')}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Kanban
              </Button>
            </div>

            {agendaView === 'CALENDARIO' && (
              <>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    placeholder="Buscar (ex: RAPP, Licença)..."
                    className="pl-9 bg-white/[0.03] border-white/[0.06] w-full"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full sm:w-auto gap-2"
                  onClick={() => {
                    setNewCond(s => ({ ...s, mode: 'TAREFA' }))
                    setIsTaskExtrasOpen(false)
                    setIsCreateDialogOpen(true)
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Nova Tarefa
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto gap-2">
                      <SlidersHorizontal className="w-4 h-4" />
                      Opções
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-3 space-y-3">
                    <DropdownMenuLabel className="px-0 py-0 text-xs text-muted-foreground">Exibição</DropdownMenuLabel>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm">Mostrar tarefas do Kanban</span>
                      <Switch checked={showKanbanCards} onCheckedChange={setShowKanbanCards} />
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="px-0 py-0 text-xs text-muted-foreground">Precisão de horários</DropdownMenuLabel>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={snapMinutes === 15 ? 'secondary' : 'ghost'}
                        className="h-8 px-3 text-xs"
                        onClick={() => setSnapMinutes(15)}
                      >
                        15 min
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={snapMinutes === 30 ? 'secondary' : 'ghost'}
                        className="h-8 px-3 text-xs"
                        onClick={() => setSnapMinutes(30)}
                      >
                        30 min
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </motion.div>

        {agendaView === 'CALENDARIO' ? (
        <>
        {/* Calendar Area */}
        <motion.div variants={item} className="glass-card flex-1 min-h-[500px] flex flex-col overflow-hidden relative">
          
          <style dangerouslySetInnerHTML={{__html: `
            .rbc-calendar {
              font-family: inherit;
              padding: 1rem;
              color: hsl(var(--foreground));
            }
            .rbc-header {
              padding: 0.75rem 0;
              font-weight: 500;
              font-size: 0.85rem;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              border-bottom: 1px solid hsl(var(--border));
            }
            .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
              border: 1px solid hsl(var(--border));
              border-radius: 0.5rem;
              background: hsl(var(--background) / 0.5);
            }
            .rbc-month-row, .rbc-day-bg + .rbc-day-bg, .rbc-header + .rbc-header {
              border-color: hsl(var(--border));
            }
            .rbc-off-range-bg {
              background: hsl(var(--muted) / 0.5);
            }
            .rbc-today {
              background: hsl(var(--primary) / 0.05);
            }
            .rbc-event, .rbc-day-slot .rbc-background-event {
              background-color: transparent !important;
              padding: 0 !important;
            }
            .rbc-event-content {
              font-size: 11px;
            }
            .rbc-btn-group button {
              color: hsl(var(--foreground));
              border-color: hsl(var(--border)) !important;
              background-color: transparent;
              transition: all 0.2s;
            }
            .rbc-btn-group button:hover {
              background-color: hsl(var(--accent) / 0.5);
            }
            .rbc-btn-group button.rbc-active {
              background-color: hsl(var(--primary) / 0.1);
              color: hsl(var(--primary));
              border-color: hsl(var(--primary) / 0.3) !important;
              box-shadow: none !important;
            }
            .rbc-toolbar-label {
              font-weight: 600;
              font-size: 1.1rem;
            }
          `}} />

          <AgendaCalendarErrorBoundary
            fallback={
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  O calendário encontrou um erro inesperado, mas suas tarefas continuam seguras.
                </p>
                <Button onClick={() => setAgendaView('KANBAN')} className="gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Ir para o Kanban
                </Button>
              </div>
            }
          >
            {DragAndDropCalendar ? (
              <DragAndDropCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                culture="pt-BR"
                className="flex-1"
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                step={snapMinutes}
                timeslots={1}
                selectable
                resizable
                draggableAccessor={(event: EventoAgenda) => event.resource.tipo === 'TAREFA'}
                resizableAccessor={(event: EventoAgenda) => event.resource.tipo === 'TAREFA'}
                onSelectSlot={(slotInfo) => {
                  const isTimedSelection =
                    slotInfo.start.getHours() !== 0 ||
                    slotInfo.start.getMinutes() !== 0 ||
                    slotInfo.end.getHours() !== 0 ||
                    slotInfo.end.getMinutes() !== 0

                  const snappedStart = roundDateDownToStep(new Date(slotInfo.start), snapMinutes)
                  const snappedEnd = roundDateUpToStep(new Date(slotInfo.end), snapMinutes)
                  const adjustedEnd = normalizeEnd(snappedStart, snappedEnd, snapMinutes)
                  setNewCond(prev => ({ 
                    ...prev, 
                    prazo: snappedStart.toISOString().split('T')[0],
                    horaInicio: isTimedSelection ? format(snappedStart, 'HH:mm') : prev.horaInicio,
                    horaFim: isTimedSelection ? format(adjustedEnd, 'HH:mm') : prev.horaFim,
                    mode: 'TAREFA'
                  }))
                  setIsTaskExtrasOpen(false)
                  setIsCreateDialogOpen(true)
                }}
                onSelectEvent={(event) => {
                  setSelectedEvent(event)
                  setIsDetailsOpen(true)
                }}
                onEventDrop={(payload: any) => handleTaskEventWindowChange(payload)}
                onEventResize={(payload: any) => handleTaskEventWindowChange(payload)}
                popup
                components={{
                  event: EventBadge
                }}
                tooltipAccessor={(e) => `${e.title}\n${e.resource.orgao}\n${e.resource.descricao}`}
              />
            ) : (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                messages={messages}
                culture="pt-BR"
                className="flex-1"
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                step={snapMinutes}
                timeslots={1}
                selectable
                onSelectSlot={(slotInfo) => {
                  const isTimedSelection =
                    slotInfo.start.getHours() !== 0 ||
                    slotInfo.start.getMinutes() !== 0 ||
                    slotInfo.end.getHours() !== 0 ||
                    slotInfo.end.getMinutes() !== 0

                  const snappedStart = roundDateDownToStep(new Date(slotInfo.start), snapMinutes)
                  const snappedEnd = roundDateUpToStep(new Date(slotInfo.end), snapMinutes)
                  const adjustedEnd = normalizeEnd(snappedStart, snappedEnd, snapMinutes)
                  setNewCond(prev => ({
                    ...prev,
                    prazo: snappedStart.toISOString().split('T')[0],
                    horaInicio: isTimedSelection ? format(snappedStart, 'HH:mm') : prev.horaInicio,
                    horaFim: isTimedSelection ? format(adjustedEnd, 'HH:mm') : prev.horaFim,
                    mode: 'TAREFA'
                  }))
                  setIsTaskExtrasOpen(false)
                  setIsCreateDialogOpen(true)
                }}
                onSelectEvent={(event) => {
                  setSelectedEvent(event as EventoAgenda)
                  setIsDetailsOpen(true)
                }}
                popup
                components={{
                  event: EventBadge
                }}
                tooltipAccessor={(e) => `${e.title}\n${(e as EventoAgenda).resource.orgao}\n${(e as EventoAgenda).resource.descricao}`}
              />
            )}
          </AgendaCalendarErrorBoundary>

        </motion.div>

        {/* Modal de Detalhes do Evento */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`uppercase font-mono text-[10px] ${selectedEvent?.resource?.alertaCor || ''}`}>
                  {selectedEvent?.resource?.tipo}
                </Badge>
                {selectedEvent?.resource?.esfera && (
                  <Badge variant="secondary" className="text-[10px] text-muted-foreground">
                    {selectedEvent.resource.esfera}
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                {selectedEvent?.title}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {selectedEvent?.resource.orgao}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider">O que deve ser feito?</Label>
                <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-sm leading-relaxed text-foreground/90">
                  {selectedEvent?.resource.descricao || "Sem descrição disponível."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Data do Evento</p>
                  <p className="text-sm font-medium">
                    {selectedEvent?.start.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {selectedEvent?.resource.tipo === 'OBRIGACAO' && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-right">Status</p>
                    <p className="text-sm font-medium text-amber-500 text-right">Obrigatório</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedEvent?.resource.tipo === 'OBRIGACAO' ? (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => handleDismissObrigacao(selectedEvent.id)}
                  >
                    <XCircle className="w-4 h-4" />
                    Não se aplica a mim
                  </Button>
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => handleDismissObrigacao(selectedEvent.id)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como Resolvido
                  </Button>
                </>
              ) : selectedEvent?.resource.tipo === 'TAREFA' ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full sm:flex-1 gap-2"
                    onClick={() => {
                      setIsDetailsOpen(false)
                      setAgendaView('KANBAN')
                    }}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Abrir Kanban
                  </Button>
                  <Button className="w-full sm:flex-1 gap-2" onClick={handleToggleTaskStatus}>
                    <CheckCircle2 className="w-4 h-4" />
                    {isSelectedTaskDone ? 'Reabrir tarefa' : 'Marcar como concluída'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full sm:flex-1 gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleDeleteTask}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir tarefa
                  </Button>
                </>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Fechar Detalhes
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                {newCond.mode === 'TAREFA' ? 'Nova Tarefa Pessoal' : 'Nova Condicionante Legal'}
              </DialogTitle>
              <DialogDescription>
                {newCond.mode === 'TAREFA' 
                  ? 'Organize sua rotina e planeje seu dia.' 
                  : 'Crie um novo lembrete legal para monitoramento.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex gap-2 p-1 bg-muted rounded-lg self-start mb-2">
                <Button 
                  variant={newCond.mode === 'TAREFA' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    setNewCond(s => ({ ...s, mode: 'TAREFA' }))
                    setIsTaskExtrasOpen(false)
                  }}
                >
                  Tarefa Pessoal
                </Button>
                <Button 
                  variant={newCond.mode === 'CONDICIONANTE' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => {
                    setNewCond(s => ({ ...s, mode: 'CONDICIONANTE' }))
                    setIsTaskExtrasOpen(false)
                  }}
                >
                  Condicionante
                </Button>
              </div>

              {newCond.mode === 'CONDICIONANTE' && (
                <>
                  <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <Select value={newCond.clienteId} onValueChange={(v) => setNewCond(s => ({ ...s, clienteId: v }))}>
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Licença Associada (Opcional)</Label>
                    <Select value={newCond.licencaId} onValueChange={(v) => setNewCond(s => ({ ...s, licencaId: v }))}>
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue placeholder="Selecione a licença" />
                      </SelectTrigger>
                      <SelectContent>
                        {licencas.filter(l => !newCond.clienteId || l.clienteId === newCond.clienteId).map(l => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.tipo} - {l.numeroLicenca || l.id.substring(0, 8)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              {newCond.mode === 'TAREFA' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label>Início</Label>
                      <Input 
                        type="time" 
                        className="bg-muted/30" 
                        value={newCond.horaInicio} 
                        onChange={e => setNewCond(s => ({ ...s, horaInicio: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fim</Label>
                      <Input 
                        type="time" 
                        className="bg-muted/30" 
                        value={newCond.horaFim} 
                        onChange={e => setNewCond(s => ({ ...s, horaFim: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Collapsible open={isTaskExtrasOpen} onOpenChange={setIsTaskExtrasOpen}>
                    <div className="rounded-xl border border-border/50 bg-muted/20">
                      <CollapsibleTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-between h-10 rounded-xl px-3"
                        >
                          <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                            <Building className="w-4 h-4 text-primary" />
                            Vínculo Opcional
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isTaskExtrasOpen ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4 space-y-3">
                        <div className="space-y-2">
                          <Label className="text-[11px]">Cliente</Label>
                          <Select value={newCond.clienteId} onValueChange={(v) => setNewCond(s => ({ ...s, clienteId: v, licencaId: '', mtrId: '' }))}>
                            <SelectTrigger className="bg-muted/30 h-8 text-xs">
                              <SelectValue placeholder="Nenhum cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {clientes.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {newCond.clienteId && newCond.clienteId !== 'none' && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-[11px]">Licença</Label>
                              <Select value={newCond.licencaId} onValueChange={(v) => setNewCond(s => ({ ...s, licencaId: v }))}>
                                <SelectTrigger className="bg-muted/30 h-8 text-xs font-mono">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="none">Nenhuma</SelectItem>
                                   {licencas.filter(l => l.clienteId === newCond.clienteId).map(l => (
                                    <SelectItem key={l.id} value={l.id}>{l.tipo} {l.numeroLicenca?.substring(0,10)}</SelectItem>
                                   ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[11px]">MTR</Label>
                              <Select value={newCond.mtrId} onValueChange={(v) => setNewCond(s => ({ ...s, mtrId: v }))}>
                                <SelectTrigger className="bg-muted/30 h-8 text-xs font-mono">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="none">Nenhum</SelectItem>
                                   {mtrs.filter(m => m.clienteId === newCond.clienteId).map(m => (
                                    <SelectItem key={m.id} value={m.id}>{m.numeroMTR || m.id.substring(0,8)}</SelectItem>
                                   ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                      </CollapsibleContent>
                    </div>
                  </Collapsible>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Notificar com antecedência</Label>
                      <span className="text-xs font-semibold text-primary">{newCond.notificacaoDias} dias</span>
                    </div>
                    <Input 
                      type="range" 
                      min="0" 
                      max="30" 
                      step="1"
                      className="accent-primary"
                      value={newCond.notificacaoDias}
                      onChange={e => setNewCond(s => ({ ...s, notificacaoDias: parseInt(e.target.value) }))}
                    />
                  </div>
                </div>
              )}

              {newCond.mode === 'TAREFA' && (
                <div className="space-y-2">
                  <Label>Título da Tarefa *</Label>
                  <Input
                    className="bg-muted/30"
                    placeholder="Ex: Ligar para o cliente X"
                    value={newCond.titulo}
                    onChange={e => setNewCond(s => ({ ...s, titulo: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>{newCond.mode === 'TAREFA' ? 'Descrição (opcional)' : 'Descrição da Condicionante *'}</Label>
                <Textarea 
                  placeholder={newCond.mode === 'TAREFA' ? "Notas da tarefa..." : "Descrição detalhada..."} 
                  className="bg-muted/30 min-h-[100px]"
                  value={newCond.descricao}
                  onChange={e => setNewCond(s => ({ ...s, descricao: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prazo Final *</Label>
                  <Input 
                    type="date" 
                    className="bg-muted/30" 
                    value={newCond.prazo}
                    onChange={e => setNewCond(s => ({ ...s, prazo: e.target.value }))}
                  />
                </div>
                {newCond.mode === 'CONDICIONANTE' && (
                  <div className="space-y-2">
                    <Label>Frequência</Label>
                    <Select value={newCond.tipo} onValueChange={(v: any) => setNewCond(s => ({ ...s, tipo: v }))}>
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PONTUAL">Pontual</SelectItem>
                        <SelectItem value="PERIODICA">Periódica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
              <Button 
                onClick={async () => {
                  if (
                    !newCond.prazo ||
                    (newCond.mode === 'TAREFA' && !newCond.titulo) ||
                    (newCond.mode === 'CONDICIONANTE' && (!newCond.clienteId || !newCond.descricao))
                  ) {
                    toast.error("Preencha os campos obrigatórios")
                    return
                  }
                  setIsSaving(true)
                  try {
                    if (newCond.mode === 'TAREFA') {
                      await criarTask({ 
                        titulo: newCond.titulo, 
                        descricao: newCond.descricao || undefined,
                        dataPrazo: new Date(`${newCond.prazo}T${newCond.horaInicio || '09:00'}:00`),
                        clienteId: newCond.clienteId === 'none' ? undefined : newCond.clienteId,
                        licencaId: newCond.licencaId === 'none' ? undefined : newCond.licencaId,
                        mtrId: newCond.mtrId === 'none' ? undefined : newCond.mtrId,
                        horaInicio: newCond.horaInicio,
                        horaFim: newCond.horaFim,
                        notificacaoDias: newCond.notificacaoDias,
                      })
                      toast.success("Tarefa criada!")
                    } else {
                      if (!newCond.licencaId) {
                        toast.error("Vincule a uma Licença.")
                        setIsSaving(false)
                        return
                      }
                      await criarCondicionante({
                        licencaId: newCond.licencaId,
                        dto: {
                          licencaId: newCond.licencaId,
                          descricao: newCond.descricao,
                          tipo: newCond.tipo,
                          prazo: new Date(`${newCond.prazo}T12:00:00`),
                        }
                      })
                      toast.success("Condicionante criada!")
                    }
                    setIsCreateDialogOpen(false)
                    setIsTaskExtrasOpen(false)
                    setNewCond({ 
                        titulo: '',
                        clienteId: '', 
                        licencaId: '', 
                        descricao: '', 
                        prazo: '', 
                        tipo: 'PONTUAL', 
                        mode: 'TAREFA',
                        notificacaoDias: 5,
                        horaInicio: '09:00',
                        horaFim: '10:00',
                        mtrId: ''
                    })
                  } catch (e) {
                    toast.error("Erro ao salvar.")
                  } finally {
                    setIsSaving(false)
                  }
                }}
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Info Legenda */}
        <motion.div variants={item} className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground/70 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500/50"></span> Obrigações Oficiais
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/50"></span> Licenças Regulares
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></span> Condicionantes
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/50"></span> Atrasos / Urgência
          </div>
        </motion.div>
        </>
        ) : (
          <motion.div variants={item} className="glass-card flex-1 min-h-[500px] overflow-hidden">
            <TaskKanbanBoard showHeader={false} className="h-full p-4 md:p-6" />
          </motion.div>
        )}
      </motion.div>
    </AppLayout>
  )
}
