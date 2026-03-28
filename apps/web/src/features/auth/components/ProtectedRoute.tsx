import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from './AuthProvider'
import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center emerald-glow">
            <Leaf className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary/40"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground"
        >
          Carregando...
        </motion.p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
