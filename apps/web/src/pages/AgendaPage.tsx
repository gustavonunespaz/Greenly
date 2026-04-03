import { AppLayout } from '@/components/layout/AppLayout'
import { useTrackViewLoaded } from '@/hooks/use-track-view-loaded'
import { motion } from 'framer-motion'
import { Calendar as CalendarIcon, Info, Search, Building } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState, useMemo } from 'react'

// Calendário
import { Calendar, dateFnsLocalizer, EventProps } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import 'react-big-calendar/lib/css/react-big-calendar.css'

// Hooks e APIs
import { useLicencas } from '@/features/licencas/hooks/useLicencas'
import { useCondicionantes } from '@/features/licencas/hooks/useCondicionantes'

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
    tipo: 'LICENCA' | 'CONDICIONANTE' | 'FEDERAL'
    descricao?: string
    esfera?: string
    orgao?: string
    alertaCor: string
  }
}

function EventBadge({ event }: EventProps<EventoAgenda>) {
  return (
    <div className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 w-full overflow-hidden ${event.resource.alertaCor}`}>
      <span className="font-semibold truncate">{event.title}</span>
    </div>
  )
}

export default function AgendaPage() {
  useTrackViewLoaded('agenda')
  const [searchTerm, setSearchTerm] = useState('')

  const { licencas = [] } = useLicencas()
  const { condicionantes = [] } = useCondicionantes()

  const currentYear = new Date().getFullYear()

  // Montagem dinâmica de Eventos
  const events = useMemo(() => {
    let lista: EventoAgenda[] = []

    // 1. Obrigações Federais Fixas
    const obrigacoes: EventoAgenda[] = [
      {
        id: 'rapp',
        title: 'RAPP',
        start: new Date(currentYear, 2, 31), // Mês é 0-indexed (Março = 2)
        end: new Date(currentYear, 2, 31),
        allDay: true,
        resource: {
          tipo: 'FEDERAL',
          esfera: 'FEDERAL',
          orgao: 'IBAMA',
          descricao: 'Relatório Anual de Atividades Potencialmente Poluidoras.',
          alertaCor: 'bg-blue-500/20 text-blue-100 border border-blue-500/30 font-medium',
        }
      },
      {
        id: 'inv',
        title: 'Inventário Nac. de Resíduos',
        start: new Date(currentYear, 2, 31),
        end: new Date(currentYear, 2, 31),
        allDay: true,
        resource: {
          tipo: 'FEDERAL',
          esfera: 'FEDERAL',
          orgao: 'SINIR/MMA',
          descricao: 'Declaração anual no SINIR.',
          alertaCor: 'bg-blue-500/20 text-blue-100 border border-blue-500/30 font-medium',
        }
      },
      {
        id: 'tcfa1',
        title: 'TCFA 1º Tri',
        start: new Date(currentYear, 3, 5),
        end: new Date(currentYear, 3, 5),
        allDay: true,
        resource: {
          tipo: 'FEDERAL',
          esfera: 'FEDERAL',
          orgao: 'IBAMA',
          descricao: 'Pagamento da Taxa de Controle e Fiscalização.',
          alertaCor: 'bg-blue-500/20 text-blue-100 border border-blue-500/30 font-medium',
        }
      },
      {
        id: 'tcfa2',
        title: 'TCFA 2º Tri',
        start: new Date(currentYear, 6, 5),
        end: new Date(currentYear, 6, 5),
        allDay: true,
        resource: {
          tipo: 'FEDERAL',
          esfera: 'FEDERAL',
          orgao: 'IBAMA',
          descricao: 'Pagamento da Taxa de Controle e Fiscalização.',
          alertaCor: 'bg-blue-500/20 text-blue-100 border border-blue-500/30 font-medium',
        }
      }
    ]

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
          descricao: `Licença: ${l.numeroLicenca || 'S/N'} (${l.status})`,
          // Se estiver nos próximos 30 dias, marca amarelo, se passou, vemelho.
          alertaCor: (l.diasAteVencimento ?? 99) < 0 
            ? 'bg-destructive/20 text-destructive-foreground border border-destructive/30' 
            : 'bg-green-500/20 text-green-100 border border-green-500/30',
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
          ? 'bg-destructive/30 text-destructive-foreground border border-destructive/50' 
          : 'bg-amber-500/20 text-amber-100 border border-amber-500/30',
        }
      }))

    lista = [...obrigacoes, ...licencasEvents, ...condEvents]

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
              Sincronizar Google Agenda
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
              border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            }
            .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
              border: 1px solid rgba(255, 255, 255, 0.08);
              border-radius: 0.5rem;
              background: rgba(0, 0, 0, 0.2);
            }
            .rbc-month-row, .rbc-day-bg + .rbc-day-bg, .rbc-header + .rbc-header {
              border-color: rgba(255, 255, 255, 0.05);
            }
            .rbc-off-range-bg {
              background: rgba(255, 255, 255, 0.02);
            }
            .rbc-today {
              background: rgba(var(--primary), 0.05);
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
              border-color: rgba(255, 255, 255, 0.1) !important;
              background-color: rgba(255, 255, 255, 0.03);
              transition: all 0.2s;
            }
            .rbc-btn-group button:hover {
              background-color: rgba(255, 255, 255, 0.08);
            }
            .rbc-btn-group button.rbc-active {
              background-color: hsl(var(--primary)/0.2);
              color: hsl(var(--primary));
              border-color: hsl(var(--primary)/0.3) !important;
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
            popup
            components={{
              event: EventBadge
            }}
            tooltipAccessor={(e) => `${e.title}\n${e.resource.orgao}\n${e.resource.descricao}`}
          />

        </motion.div>
        
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
