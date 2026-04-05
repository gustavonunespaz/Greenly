import { trackCTA } from '@/lib/tracking'
import { ArrowRight, BarChart3, Globe2, ShieldCheck } from 'lucide-react'

const badges = [
  { icon: ShieldCheck, label: 'Conformidade operacional ativa' },
  { icon: Globe2, label: 'SINIR + SIGOR integrados' },
  { icon: BarChart3, label: 'Visão micro por cliente' },
]

const highlights = [
  '4k+ órgãos ambientais disponíveis para seleção',
  '2.5k+ tipos de resíduos (NBR 10.004) em catálogo',
  'Wizard de MTR em 6 etapas com rastreabilidade completa',
]

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        >
          <source src="https://cdn.coverr.co/videos/coverr-trees-in-a-forest-2736/1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc]/80 via-white/50 to-[#f8fafc]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-greenly-200 text-greenly-700 text-sm font-medium mb-8 animate-fade-in-down opacity-0 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-greenly-500 animate-pulse" />
            Status do produto atualizado em 04/04/2026
          </div>

          <h1 className="section-title leading-[1.1] mb-8 animate-fade-in-up opacity-0">
            Greenly: operação ambiental
            <span className="gradient-text"> de ponta a ponta</span>
            <br />
            para consultorias e times internos.
          </h1>

          <p className="section-subtitle mx-auto mb-10 animate-fade-in-up opacity-0 stagger-2">
            Licenças, condicionantes, resíduos, MTR/CDF, anuências, IBAMA, tarefas,
            documentos e integração governamental em uma plataforma única, com trilha
            de auditoria e alertas acionáveis.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-in-up opacity-0 stagger-3">
            <a
              href="#contato"
              onClick={() => trackCTA('hero_demo', 'hero')}
              className="btn-primary text-lg"
            >
              Agendar demonstração
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#funcionalidades"
              onClick={() => trackCTA('hero_learn', 'hero')}
              className="btn-secondary text-lg"
            >
              Ver módulos ativos
            </a>
          </div>

          <div className="grid gap-2 max-w-3xl mx-auto mb-14 animate-fade-in-up opacity-0 stagger-4">
            {highlights.map((item) => (
              <div key={item} className="px-4 py-2 rounded-xl bg-white/70 border border-white text-sm text-gray-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 animate-fade-in-up opacity-0 stagger-4">
            {badges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                <Icon className="w-4 h-4 text-greenly-500" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 animate-fade-in-up opacity-0 stagger-5">
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-greenly-200/50 to-transparent blur-3xl -z-10 scale-105" />

            <div className="glass-card overflow-hidden !bg-white">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-md mx-auto h-7 rounded-md bg-white border border-gray-200 flex items-center px-3 shadow-sm">
                    <span className="text-xs text-gray-400 font-medium tracking-wide">app.greenly.com.br</span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-gray-50/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Licenças monitoradas', value: 'RLO/RLI/RLP/DLAE', color: 'from-greenly-600 to-emerald-500', bg: 'bg-greenly-50 border-greenly-100' },
                    { label: 'Resíduos', value: 'MTR + CDF', color: 'from-cyan-600 to-blue-500', bg: 'bg-cyan-50 border-cyan-100' },
                    { label: 'Conformidade federal', value: 'IBAMA + TCFA', color: 'from-violet-600 to-indigo-500', bg: 'bg-violet-50 border-violet-100' },
                    { label: 'Integrações gov', value: 'SINIR + SIGOR', color: 'from-amber-600 to-orange-500', bg: 'bg-amber-50 border-amber-100' },
                  ].map((card) => (
                    <div key={card.label} className={`p-4 rounded-xl border ${card.bg}`}>
                      <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
                      <p className={`text-sm md:text-lg font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                        {card.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="h-48 md:h-56 rounded-xl bg-white border border-gray-100 px-6 py-5 shadow-sm">
                  <div className="grid md:grid-cols-3 gap-4 h-full">
                    {[
                      ['Agenda e tarefas', 'Alertas de antecedência customizável por item'],
                      ['Documentos', 'Ingestão, classificação e revisão humana assistida'],
                      ['Auditoria', 'Timeline completa de eventos críticos e integrações'],
                    ].map(([title, text]) => (
                      <div key={title} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 flex flex-col justify-between">
                        <p className="text-sm font-semibold text-gray-900">{title}</p>
                        <p className="text-xs text-gray-600 leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f8fafc] to-transparent pointer-events-none" />
    </section>
  )
}
