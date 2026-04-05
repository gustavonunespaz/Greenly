import { Leaf, Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = {
  Plataforma: [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Como funciona', href: '#como-funciona' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Contato', href: '#contato' },
  ],
  'Módulos': [
    { label: 'Licenciamento', href: '#funcionalidades' },
    { label: 'Resíduos e MTR/CDF', href: '#funcionalidades' },
    { label: 'Agenda e Tarefas', href: '#funcionalidades' },
    { label: 'IBAMA e Saneamento', href: '#funcionalidades' },
    { label: 'Pipeline Documental', href: '#funcionalidades' },
  ],
  Jurídico: [
    { label: 'Política de Privacidade', href: '#' },
    { label: 'Termos de Uso', href: '#' },
    { label: 'LGPD', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-200 bg-white">
      <div className="absolute inset-0 bg-white" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-greenly-500 to-greenly-600 flex items-center justify-center">
                <Leaf className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                Green<span className="text-greenly-600">ly</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-xs">
              Plataforma SaaS B2B de gestão e compliance ambiental. 
              Centralize operação, monitore riscos e rastreie tudo em um só lugar.
            </p>
            <div className="space-y-3">
              <a href="mailto:contato@greenly.com.br" className="flex items-center gap-2 text-gray-600 hover:text-greenly-600 text-sm transition-colors">
                <Mail className="w-4 h-4" />
                contato@greenly.com.br
              </a>
              <a href="tel:+5511999999999" className="flex items-center gap-2 text-gray-600 hover:text-greenly-600 text-sm transition-colors">
                <Phone className="w-4 h-4" />
                (11) 99999-9999
              </a>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="w-4 h-4" />
                São Paulo, SP — Brasil
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-gray-900 font-semibold mb-4 text-sm">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-greenly-600 text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Greenly. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-xs">
            Plataforma de gestão e compliance ambiental
          </p>
        </div>
      </div>
    </footer>
  )
}
