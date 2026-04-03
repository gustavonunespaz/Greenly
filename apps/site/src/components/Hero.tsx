import { trackCTA } from '@/lib/tracking'
import { ArrowRight, Shield, Zap, BarChart3 } from 'lucide-react'

const badges = [
  { icon: Shield, label: 'Compliance garantido' },
  { icon: Zap, label: 'Automação inteligente' },
  { icon: BarChart3, label: 'Dashboard em tempo real' },
]

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        >
          {/* Default open source nature video placeholder */}
          <source src="https://cdn.coverr.co/videos/coverr-trees-in-a-forest-2736/1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc]/80 via-white/50 to-[#f8fafc]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20">
        <div className="text-center max-w-5xl mx-auto">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-greenly-200 text-greenly-700 text-sm font-medium mb-8 animate-fade-in-down opacity-0 shadow-sm backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-greenly-500 animate-pulse" />
            Plataforma SaaS B2B de gestão ambiental
          </div>

          {/* Main heading */}
          <h1 className="section-title leading-[1.1] mb-8 animate-fade-in-up opacity-0">
            Compliance ambiental{' '}
            <span className="gradient-text">sem planilhas,</span>
            <br />
            sem improviso, sem risco.
          </h1>

          {/* Subtitle */}
          <p className="section-subtitle mx-auto mb-10 animate-fade-in-up opacity-0 stagger-2">
            Centralize licenças, condicionantes, resíduos, MTRs e documentos em uma única plataforma. 
            Monitore prazos, automatize alertas e tenha rastreabilidade ponta a ponta — 
            tudo que sua consultoria precisa para operar com segurança regulatória.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up opacity-0 stagger-3">
            <a
              href="#contato"
              onClick={() => trackCTA('hero_demo', 'hero')}
              className="btn-primary text-lg"
            >
              Agendar demonstração gratuita
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#solucoes"
              onClick={() => trackCTA('hero_learn', 'hero')}
              className="btn-secondary text-lg"
            >
              Conhecer a plataforma
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 animate-fade-in-up opacity-0 stagger-4">
            {badges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-gray-600 font-medium text-sm">
                <Icon className="w-4 h-4 text-greenly-500" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Hero visual — App mockup */}
        <div className="mt-20 animate-fade-in-up opacity-0 stagger-5">
          <div className="relative mx-auto max-w-5xl">
            {/* Glow behind mockup */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-greenly-200/50 to-transparent blur-3xl -z-10 scale-105" />
            
            {/* Browser frame */}
            <div className="glass-card overflow-hidden !bg-white">
              {/* Browser bar */}
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
              
              {/* Dashboard preview */}
              <div className="p-6 md:p-8 bg-gray-50/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Licenças ativas', value: '47', color: 'from-greenly-600 to-emerald-500', bg: 'bg-greenly-50 border-greenly-100' },
                    { label: 'Condicionantes pendentes', value: '12', color: 'from-amber-600 to-orange-500', bg: 'bg-amber-50 border-amber-100' },
                    { label: 'MTRs emitidos', value: '238', color: 'from-cyan-600 to-blue-500', bg: 'bg-cyan-50 border-cyan-100' },
                    { label: 'Taxa de conformidade', value: '94%', color: 'from-greenly-600 to-teal-500', bg: 'bg-teal-50 border-teal-100' },
                  ].map((card) => (
                    <div key={card.label} className={`p-4 rounded-xl border ${card.bg}`}>
                      <p className="text-xs text-gray-500 font-medium mb-1">{card.label}</p>
                      <p className={`text-2xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
                         {card.value}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Chart placeholder */}
                <div className="h-48 md:h-56 rounded-xl bg-white border border-gray-100 flex items-end px-6 pb-6 gap-3 shadow-sm">
                  {[40, 55, 35, 65, 50, 70, 45, 80, 60, 75, 85, 90].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-greenly-500 to-greenly-300 opacity-80 transition-all duration-700 hover:opacity-100" style={{ height: `${h}%`, animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#f8fafc] to-transparent pointer-events-none" />
    </section>
  )
}
