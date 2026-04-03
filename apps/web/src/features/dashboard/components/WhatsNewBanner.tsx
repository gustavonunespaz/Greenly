import { X, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface WhatsNewItem {
  id: string
  text: string
}

interface Props {
  timeSinceLabel: string | null
  items: WhatsNewItem[]
}

export function WhatsNewBanner({ timeSinceLabel, items }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || !timeSinceLabel || items.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="glass-card border-primary/15 px-5 py-3.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[12px] font-medium text-foreground">
                Desde sua última visita ({timeSinceLabel}):
              </p>
              <ul className="mt-1.5 space-y-1">
                {items.map(item => (
                  <li key={item.id} className="text-[12px] text-muted-foreground/70 flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-primary/50 shrink-0" />
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-white/[0.06] transition-all shrink-0"
            title="Entendi"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
