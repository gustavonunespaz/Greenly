import { AppLayout } from '@/components/layout/AppLayout'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Info, Search, Building, Plus, Trash2, CheckCircle2, XCircle, CheckSquare, ChevronRight } from 'lucide-react'
import { formatEnum } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useMemo, useEffect, CSSProperties } from 'react'
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
import { toast } from "@/components/ui/sonner"

// Calendário
import { Calendar, dateFnsLocalizer, EventProps } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Hooks e APIs
import { useLicencas } from '@/features/licencas/hooks/useLicencas'
import { useCondicionantes } from '@/features/licencas/hooks/useCondicionantes'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { useTasks } from '@/features/tasks/hooks/useTasks'
import { useResiduos } from '@/features/residuos/hooks/useResiduos'
import { OFFICIAL_OBLIGATIONS, STORAGE_KEYS } from '@/lib/constants'

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
    tipo: 'LICENCA' | 'CONDICIONANTE' | 'FEDERAL' | 'TAREFA'
    descricao?: string
    esfera?: string
    orgao?: string
    alertaCor: string
    customStyle?: CSSProperties
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

export default function AgendaPage() {
  useTrackViewLoaded('agenda')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estados para diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<EventoAgenda | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  
  // Gerenciamento de eventos ocultos/resolvidos (FEDERAL)
  const [dismissedFederalIds, setDismissedFederalIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DISMISSED_FEDERAL_OBLIGATIONS)
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DISMISSED_FEDERAL_OBLIGATIONS, JSON.stringify(dismissedFederalIds))
  }, [dismissedFederalIds])

  const handleDismissFederal = (id: string) => {
    setDismissedFederalIds(prev => [...prev, id])
    setIsDetailsOpen(false)
    toast.success("Obrigação ocultada da agenda.")
  }

  const { licencas = [] } = useLicencas()
  const { condicionantes = [], criarCondicionante } = useCondicionantes()
  const { clientes = [] } = useClientes()
  const { tasks = [], criarTask } = useTasks()
  const { mtrs = [] } = useResiduos()

  const [newCond, setNewCond] = useState({
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

  const currentYear = new Date().getFullYear()

  // Montagem dinâmica de Eventos
  const events = useMemo(() => {
    let lista: EventoAgenda[] = []

    // 1. Obrigações Federais Dinâmicas
    const obrigacoes: EventoAgenda[] = OFFICIAL_OBLIGATIONS.map(ob => {
      const start = new Date(currentYear, ob.mes, ob.dia)
      // Ajuste para obrigações que vencem no início do ano seguinte (ex: TCFA 4º Tri)
      if (ob.id === 'tcfa4' && new Date().getMonth() >= 9) {
        start.setFullYear(currentYear + 1)
      }
      
      return {
        id: ob.id,
        title: ob.titulo,
        start,
        end: start,
        allDay: true,
        resource: {
          tipo: 'FEDERAL' as const,
          esfera: ob.esfera,
          orgao: ob.orgao,
          descricao: ob.descricao,
          alertaCor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-semibold',
        }
      }
    }).filter(e => !dismissedFederalIds.includes(e.id))

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
    const tasksEvents: EventoAgenda[] = tasks.map(t => ({
      id: `task-${t.id}`,
      title: t.titulo,
      start: new Date(t.dataPrazo || t.criadoEm),
      end: new Date(t.dataPrazo || t.criadoEm),
      allDay: true,
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
        } : undefined
      }
    }))

    lista = [...obrigacoes, ...licencasEvents, ...condEvents, ...tasksEvents]

    if (searchTerm) {
      lista = lista.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (e.resource.orgao && e.resource.orgao.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return lista
  }, [licencas, condicionantes, currentYear, searchTerm])

  return (
    <AppLayout title="Agenda Ambiental Interativa">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
        
        {/* Header e Ações Visuais */}
        <motion.div variants={item} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Agenda Global</h2>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Visão calendarizada de Licenças, Condicionantes e Obrigações Fiscais/Federais.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
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
              variant="outline" 
              className="w-full sm:w-auto gap-2 border-primary/30 text-primary hover:bg-primary/10 transition-colors"
              onClick={() => alert("Mock: Integração com OAuth do Google em desenvolvimento.")}
            >
              <CalendarIcon className="w-4 h-4" />
              Sincronizar
            </Button>

            <Button 
              className="w-full sm:w-auto gap-2"
              onClick={() => {
                setNewCond(s => ({ ...s, mode: 'TAREFA' }))
                setIsCreateDialogOpen(true)
              }}
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </Button>
          </div>
        </motion.div>

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
            selectable
            onSelectSlot={(slotInfo) => {
              setNewCond(prev => ({ 
                ...prev, 
                prazo: slotInfo.start.toISOString().split('T')[0],
                mode: 'TAREFA'
              }))
              setIsCreateDialogOpen(true)
            }}
            onSelectEvent={(event) => {
              setSelectedEvent(event)
              setIsDetailsOpen(true)
            }}
            popup
            components={{
              event: EventBadge
            }}
            tooltipAccessor={(e) => `${e.title}\n${e.resource.orgao}\n${e.resource.descricao}`}
          />

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
                {selectedEvent?.resource.tipo === 'FEDERAL' && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider text-right">Status</p>
                    <p className="text-sm font-medium text-amber-500 text-right">Obrigatório</p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {selectedEvent?.resource.tipo === 'FEDERAL' ? (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2 hover:bg-destructive/10 hover:text-destructive transition-all"
                    onClick={() => handleDismissFederal(selectedEvent.id)}
                  >
                    <XCircle className="w-4 h-4" />
                    Não se aplica a mim
                  </Button>
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => handleDismissFederal(selectedEvent.id)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como Resolvido
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
                  onClick={() => setNewCond(s => ({ ...s, mode: 'TAREFA' }))}
                >
                  Tarefa Pessoal
                </Button>
                <Button 
                  variant={newCond.mode === 'CONDICIONANTE' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => setNewCond(s => ({ ...s, mode: 'CONDICIONANTE' }))}
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

                  <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider">Vinculação Opcional</span>
                    </div>

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
                  </div>

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

              <div className="space-y-2">
                <Label>{newCond.mode === 'TAREFA' ? 'O que precisa fazer? *' : 'Descrição da Condicionante *'}</Label>
                <Textarea 
                  placeholder={newCond.mode === 'TAREFA' ? "Ex: Ligar para o cliente..." : "Descrição detalhada..."} 
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
                  if (!newCond.descricao || !newCond.prazo || (newCond.mode === 'CONDICIONANTE' && !newCond.clienteId)) {
                    toast.error("Preencha os campos obrigatórios")
                    return
                  }
                  setIsSaving(true)
                  try {
                    if (newCond.mode === 'TAREFA') {
                      await criarTask({ 
                        titulo: newCond.descricao, 
                        dataPrazo: new Date(`${newCond.prazo}T12:00:00`),
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
                    setNewCond({ 
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
      </motion.div>
    </AppLayout>
  )
}
