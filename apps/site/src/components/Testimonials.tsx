import { useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const releases = [
  {
    date: '30/03/2026',
    title: 'Onda 3: integrações governamentais + confiabilidade',
    summary:
      'SINIR e SIGOR com adapters HTTP, worker dedicado, retry exponencial, DLQ, webhook deduplicado e reconciliação automática.',
    highlights: ['Timeline técnica por manifesto', 'Reenvio e reconciliação na tela de MTRs', 'Smoke de Onda 3 publicado'],
  },
  {
    date: '28/03/2026',
    title: 'Dashboard ambiental expandido',
    summary:
      'Nova camada de inteligência de risco com painéis de vencimentos, sustentabilidade, drill-down e visão operacional de rastreabilidade.',
    highlights: ['RiskConsolidationPanel', 'UpcomingDeadlinesTimeline', 'TraceabilityPanel com navegação para origem'],
  },
  {
    date: '28/03/2026',
    title: 'Cadastro com consulta automática de CNPJ',
    summary:
      'Endpoint autenticado e autopreenchimento do formulário de cliente com razão social, contatos, CNAE e endereço completo.',
    highlights: ['Telemetria do fluxo de consulta', 'Tratamento de erros 422/404/502/503', 'Integração com BrasilAPI'],
  },
  {
    date: '28/03/2026',
    title: 'Hardening relacional de resíduos',
    summary:
      'Modelagem consolidada para MTR/CDF com nova estrutura relacional, integridade referencial e auditoria tipada por entidade.',
    highlights: ['Tabelas mtr_itens, cdfs e cdf_mtrs', 'Emissão de CDF com múltiplos MTRs', 'Gate técnico Sprint 3 automatizado'],
  },
]

export default function Testimonials() {
  const [active, setActive] = useState(0)
  const { ref, isInView } = useInView({ threshold: 0.1 })

  const prev = () => setActive((p) => (p === 0 ? releases.length - 1 : p - 1))
  const next = () => setActive((p) => (p === releases.length - 1 ? 0 : p + 1))

  const release = releases[active]!

  return (
    <section id="depoimentos" className="relative py-32 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-white" />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            className={`inline-block px-4 py-1.5 rounded-full bg-greenly-50 border border-greenly-200 text-greenly-700 text-sm font-medium mb-6 transition-all duration-700 shadow-sm ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Evolução contínua
          </span>
          <h2
            className={`section-title mb-6 transition-all duration-700 delay-100 ${
              isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Entregas recentes já em
            <span className="gradient-text"> produção</span>
          </h2>
        </div>

        <div
          className={`max-w-4xl mx-auto transition-all duration-700 delay-200 ${
            isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="glass-card p-10 md:p-14 relative !bg-white shadow-sm border border-gray-100">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-greenly-50 border border-greenly-100 text-sm text-greenly-700 font-medium mb-6">
              <CalendarDays className="w-4 h-4" />
              {release.date}
            </div>

            <h3 className="text-2xl md:text-3xl text-gray-900 font-semibold leading-tight mb-4">{release.title}</h3>
            <p className="text-gray-600 leading-relaxed mb-8">{release.summary}</p>

            <div className="grid gap-3">
              {release.highlights.map((item) => (
                <div key={item} className="rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 text-sm text-gray-700">
                  {item}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-10">
              <p className="text-sm text-gray-500">Baseado no changelog técnico do projeto.</p>

              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-greenly-600 hover:border-greenly-200 hover:bg-greenly-50 transition-all"
                  aria-label="Entrega anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-greenly-600 hover:border-greenly-200 hover:bg-greenly-50 transition-all"
                  aria-label="Próxima entrega"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-8">
              {releases.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === active ? 'w-8 bg-greenly-500' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                  }`}
                  aria-label={`Entrega ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
