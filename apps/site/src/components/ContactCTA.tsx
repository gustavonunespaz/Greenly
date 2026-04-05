import { useState } from 'react'
import { useInView } from '@/hooks/useInView'
import { trackCTA, trackLeadSubmission } from '@/lib/tracking'
import { Send, CheckCircle2, ArrowRight } from 'lucide-react'

export default function ContactCTA() {
  const { ref, isInView } = useInView({ threshold: 0.1 })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    role: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Track lead
    trackLeadSubmission('contact_form', {
      company: form.company,
      role: form.role,
    })
    trackCTA('contact_submit', 'contact')

    // Simulate API call — replace with actual endpoint
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setLoading(false)
    setSubmitted(true)
  }

  return (
    <section id="contato" className="relative py-32 overflow-hidden">
      {/* Background with green gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc] to-white" />
      <div className="gradient-orb w-[600px] h-[600px] bg-greenly-500/10 -left-40 top-20" />
      <div className="gradient-orb w-[400px] h-[400px] bg-cyan-500/5 right-0 bottom-0" style={{ animationDelay: '4s' }} />

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — CTA content */}
          <div>
            <span className={`inline-block px-4 py-1.5 rounded-full bg-greenly-50 border border-greenly-200 text-greenly-700 text-sm font-medium mb-6 transition-all duration-700 shadow-sm ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Entrada assistida
            </span>
            <h2 className={`section-title mb-6 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Vamos colocar sua operação
              <span className="gradient-text"> em produção com segurança?</span>
            </h2>
            <p className={`section-subtitle mb-10 transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              Mostramos os módulos que já estão ativos para o seu cenário e desenhamos um
              plano de adoção com migração progressiva.
            </p>

            {/* Value props */}
            <div className={`space-y-4 transition-all duration-700 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {[
                'Demonstração orientada à sua operação atual',
                'Plano de onboarding com dados e responsabilidades',
                'Acompanhamento de implantação por etapas',
                'Suporte técnico para evolução contínua',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-greenly-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div className={`transition-all duration-700 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {submitted ? (
              <div className="glass-card p-12 text-center !bg-white shadow-sm border border-gray-100">
                <div className="w-16 h-16 rounded-full bg-greenly-50 border border-greenly-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8 text-greenly-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Mensagem enviada!</h3>
                <p className="text-gray-400 mb-8">
                  Nosso time entrará em contato em até 24h para agendar sua demonstração personalizada.
                </p>
                <a href="#hero" className="btn-primary">
                  Voltar ao topo
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 space-y-5 !bg-white shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Agende uma demonstração</h3>
                <p className="text-gray-600 text-sm mb-6">Preencha o formulário e entraremos em contato.</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm text-gray-700 font-medium mb-1.5">Nome completo *</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-greenly-400 focus:bg-white focus:ring-4 focus:ring-greenly-500/10 transition-all shadow-sm"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm text-gray-700 font-medium mb-1.5">E-mail corporativo *</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-greenly-400 focus:bg-white focus:ring-4 focus:ring-greenly-500/10 transition-all shadow-sm"
                      placeholder="email@empresa.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-company" className="block text-sm text-gray-700 font-medium mb-1.5">Empresa *</label>
                    <input
                      id="contact-company"
                      type="text"
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-greenly-400 focus:bg-white focus:ring-4 focus:ring-greenly-500/10 transition-all shadow-sm"
                      placeholder="Nome da empresa"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="block text-sm text-gray-700 font-medium mb-1.5">Telefone</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-greenly-400 focus:bg-white focus:ring-4 focus:ring-greenly-500/10 transition-all shadow-sm"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-role" className="block text-sm text-gray-700 font-medium mb-1.5">Seu cargo</label>
                  <select
                    id="contact-role"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:border-greenly-400 focus:bg-white focus:ring-4 focus:ring-greenly-500/10 transition-all appearance-none shadow-sm"
                  >
                    <option value="" className="bg-white">Selecione...</option>
                    <option value="diretor" className="bg-white">Diretor / Sócio</option>
                    <option value="gestor" className="bg-white">Gestor Ambiental</option>
                    <option value="analista" className="bg-white">Analista Ambiental</option>
                    <option value="coordenador" className="bg-white">Coordenador de Compliance</option>
                    <option value="outro" className="bg-white">Outro</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm text-gray-700 font-medium mb-1.5">Mensagem (opcional)</label>
                  <textarea
                    id="contact-message"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-greenly-400 focus:bg-white focus:ring-4 focus:ring-greenly-500/10 transition-all resize-none shadow-sm"
                    placeholder="Conte um pouco sobre sua operação..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Solicitar demonstração
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Ao enviar, você concorda com nossa política de privacidade. Sem spam, prometido.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
