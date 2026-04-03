import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface ClienteContexto {
  clienteId: string | null
  clienteNome: string | null
  setClienteContexto: (id: string, nome: string) => void
  limparContexto: () => void
}

const ClienteCtx = createContext<ClienteContexto>({
  clienteId: null,
  clienteNome: null,
  setClienteContexto: () => {},
  limparContexto: () => {},
})

const STORAGE_KEY = 'greenly_cliente_contexto'

function readStorage(): { id: string; nome: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.id && parsed?.nome) return parsed
    return null
  } catch {
    return null
  }
}

export function ClienteContextProvider({ children }: { children: ReactNode }) {
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [clienteNome, setClienteNome] = useState<string | null>(null)

  useEffect(() => {
    const stored = readStorage()
    if (stored) {
      setClienteId(stored.id)
      setClienteNome(stored.nome)
    }
  }, [])

  const setClienteContexto = useCallback((id: string, nome: string) => {
    setClienteId(id)
    setClienteNome(nome)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, nome }))
  }, [])

  const limparContexto = useCallback(() => {
    setClienteId(null)
    setClienteNome(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <ClienteCtx.Provider value={{ clienteId, clienteNome, setClienteContexto, limparContexto }}>
      {children}
    </ClienteCtx.Provider>
  )
}

export function useClienteContexto() {
  return useContext(ClienteCtx)
}
