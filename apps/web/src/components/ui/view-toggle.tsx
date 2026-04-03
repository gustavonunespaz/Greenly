import { LayoutGrid, TableProperties } from 'lucide-react'
import { useEffect, useState } from 'react'

type ViewMode = 'cards' | 'table'

interface Props {
  storageKey: string
  defaultMode?: ViewMode
  onChange?: (mode: ViewMode) => void
}

export function useViewMode(storageKey: string, defaultMode: ViewMode = 'cards') {
  const [mode, setMode] = useState<ViewMode>(() => {
    try {
      const stored = localStorage.getItem(`greenly_view_${storageKey}`)
      if (stored === 'cards' || stored === 'table') return stored
    } catch { /* noop */ }
    return defaultMode
  })

  useEffect(() => {
    localStorage.setItem(`greenly_view_${storageKey}`, mode)
  }, [mode, storageKey])

  return [mode, setMode] as const
}

export function ViewToggle({ storageKey, defaultMode = 'cards', onChange }: Props) {
  const [mode, setMode] = useViewMode(storageKey, defaultMode)

  function toggle(nextMode: ViewMode) {
    setMode(nextMode)
    onChange?.(nextMode)
  }

  return (
    <div className="inline-flex items-center rounded-xl bg-white/[0.04] border border-white/[0.08] p-0.5">
      <button
        onClick={() => toggle('cards')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
          mode === 'cards'
            ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
            : 'text-muted-foreground/50 hover:text-foreground'
        }`}
        title="Visualização em cards"
      >
        <LayoutGrid className="h-3.5 w-3.5" strokeWidth={1.5} />
        Cards
      </button>
      <button
        onClick={() => toggle('table')}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
          mode === 'table'
            ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
            : 'text-muted-foreground/50 hover:text-foreground'
        }`}
        title="Visualização em tabela"
      >
        <TableProperties className="h-3.5 w-3.5" strokeWidth={1.5} />
        Tabela
      </button>
    </div>
  )
}
