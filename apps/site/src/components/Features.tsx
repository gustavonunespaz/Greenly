import { useInView } from '@/hooks/useInView'
import {
  BarChart3,
  Bell,
  Building2,
  CalendarClock,
  Eye,
  FileCheck,
  FileText,
  Globe,
  Landmark,
  Recycle,
  ShieldCheck,
  Waves,
} from 'lucide-react'

const features = [
  {
    icon: FileCheck,
    title: 'Licenciamento ambiental completo',
    description: 'RLO, RLI, RLP, DLAE e dispensas com renovação automatizada e histórico por cliente.',
    color: 'greenly',
  },
  {
    icon: ShieldCheck,
    title: 'Condicionantes com monitoramento',
    description: 'Gestão de obrigações pontuais e periódicas com status, prazos e trilha de cumprimento.',
    color: 'greenly',
  },
  {
    icon: Recycle,
    title: 'Resíduos com MTR e CDF',
    description: 'Emissão em fluxo guiado de 6 passos, múltiplos itens e vínculo operacional com parceiros.',
    color: 'cyan',
  },
  {
    icon: Globe,
    title: 'Integrações SINIR e SIGOR',
    description: 'Envio, reconciliação, webhook deduplicado, retries e DLQ para resiliência operacional.',
    color: 'cyan',
  },
  {
    icon: CalendarClock,
    title: 'Agenda e tarefas ambientais',
    description: 'Compromissos e afazeres vinculados a clientes, licenças e MTRs com antecedência configurável.',
    color: 'violet',
  },
  {
    icon: Bell,
    title: 'Notificações acionáveis',
    description: 'Alertas in-app com deep links para execução imediata e gestão centralizada por prioridade.',
    color: 'violet',
  },
  {
    icon: Landmark,
    title: 'IBAMA (CTF e TCFA)',
    description: 'Controle de conformidade federal com acompanhamento de certificados e taxas periódicas.',
    color: 'amber',
  },
  {
    icon: Waves,
    title: 'Saneamento e anuências',
    description: 'Módulo dedicado para controle de anuências municipais e estaduais de lançamento e uso.',
    color: 'amber',
  },
  {
    icon: FileText,
    title: 'Pipeline documental',
    description: 'Ingestão idempotente, classificação, extração com revisão humana e métricas de qualidade.',
    color: 'greenly',
  },
  {
    icon: BarChart3,
    title: 'Dashboard ambiental inteligente',
    description: 'KPIs, tendência de risco, vencimentos e drill-down para evidência operacional de origem.',
    color: 'cyan',
  },
  {
    icon: Eye,
    title: 'Visão micro por cliente',
    description: 'Cockpit com licenças, condicionantes, resíduos, documentos e indicadores em uma única tela.',
    color: 'violet',
  },
  {
    icon: Building2,
    title: 'Cadastro inteligente de clientes',
    description: 'Busca de CNPJ com autopreenchimento de dados cadastrais, endereço e localização oficial.',
    color: 'amber',
  },
]

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  greenly: { bg: 'bg-greenly-50', border: 'border-greenly-100', icon: 'text-greenly-600' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-100', icon: 'text-cyan-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'text-violet-600' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-600' },
}

export default function Features() {
  const { ref, isInView } = useInView({ threshold: 0.05 })

  return (
    <section id="funcionalidades" className="relative py-32 overflow-hidden bg-white">
      <img
        src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2074"
        alt="Nature"
        className="absolute inset-0 w-full h-full object-cover opacity-5"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-greenly-50/50 to-white" />
      <div className="gradient-orb w-[500px] h-[500px] bg-greenly-500/10 -right-60 top-40 blur-3xl" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span
            className={`inline-block px-4 py-1.5 rounded-full bg-greenly-50 border border-greenly-200 text-greenly-700 text-sm font-medium mb-6 transition-all duration-700 shadow-sm ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Plataforma consolidada
          </span>
          <h2
            className={`section-title mb-6 transition-all duration-700 delay-100 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Tudo que já está ativo na
            <span className="gradient-text"> Greenly</span>
          </h2>
          <p
            className={`section-subtitle mx-auto transition-all duration-700 delay-200 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Módulos conectados entre si para operação real, governança e escala em consultorias
            ambientais e equipes internas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ icon: Icon, title, description, color }, i) => {
            const colors = colorMap[color] ?? colorMap['greenly']!
            return (
              <div
                key={title}
                className={`glass-card-hover p-6 group transition-all duration-700 ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${300 + i * 70}ms` }}
              >
                <div
                  className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}
                >
                  <Icon className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
