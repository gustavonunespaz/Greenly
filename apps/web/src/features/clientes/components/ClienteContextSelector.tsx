import { useClienteContexto } from '@/features/clientes/components/ClienteContextProvider'
import { useClientes } from '@/features/clientes/hooks/useClientes'
import { Building2, ChevronDown, X, Search } from 'lucide-react'
import { useState, useRef, useEffect, useMemo } from 'react'

interface Props {
  collapsed?: boolean
}

export function ClienteContextSelector({ collapsed }: Props) {
  const { clienteId, clienteNome, setClienteContexto, limparContexto } = useClienteContexto()
  const { clientes = [] } = useClientes()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return clientes
      .filter(c => c.ativo !== false)
      .filter(c =>
        !term ||
        c.nome.toLowerCase().includes(term) ||
        (c.cnpj || '').includes(term)
      )
      .slice(0, 8)
  }, [clientes, search])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (collapsed) {
    return (
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-center py-2"
        title={clienteNome || 'Selecionar contexto de cliente'}
      >
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
            clienteId
              ? 'bg-primary/15 text-primary ring-1 ring-primary/25'
              : 'bg-white/[0.04] text-muted-foreground/50 hover:text-foreground hover:bg-white/[0.08]'
          }`}
        >
          <Building2 className="h-4 w-4" strokeWidth={1.5} />
        </div>
      </button>
    )
  }

  return (
    <div className="relative px-3" ref={dropdownRef}>
      <p className="text-muted-foreground/50 text-[10px] uppercase tracking-[0.12em] font-medium px-0 mb-1.5">
        Contexto
      </p>

      {clienteId ? (
        <div className="flex items-center gap-2 rounded-xl bg-primary/[0.06] border border-primary/15 px-3 py-2.5 group">
          <div className="h-7 w-7 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
            <Building2 className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-foreground truncate" title={clienteNome || ''}>
              {clienteNome}
            </p>
            <p className="text-[10px] text-muted-foreground/50">Contexto ativo</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              limparContexto()
            }}
            className="p-1 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
            title="Limpar contexto"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center gap-2 rounded-xl border border-dashed border-white/[0.1] px-3 py-2.5 text-muted-foreground/50 hover:text-foreground hover:border-primary/25 hover:bg-primary/[0.03] transition-all duration-200"
        >
          <Building2 className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span className="text-[12px] flex-1 text-left">Selecionar cliente...</span>
          <ChevronDown className="h-3 w-3 shrink-0" />
        </button>
      )}

      {open && (
        <div className="absolute left-3 right-3 top-full mt-1.5 z-50 glass-card p-2 animate-scale-in">
          <div className="relative mb-1.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-8 pl-7 pr-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[12px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/50 px-2 py-3 text-center">
                Nenhum cliente encontrado
              </p>
            ) : (
              filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setClienteContexto(c.id, c.nome)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all duration-150 ${
                    c.id === clienteId
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  <span className="text-[12px] truncate">{c.nome}</span>
                </button>
              ))
            )}
          </div>

          {clienteId && (
            <>
              <div className="h-px bg-white/[0.06] my-1" />
              <button
                onClick={() => {
                  limparContexto()
                  setOpen(false)
                  setSearch('')
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04] transition-all"
              >
                <X className="h-3 w-3" />
                Ver todos os clientes
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
