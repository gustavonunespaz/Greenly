import { useState } from "react"
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "../hooks/useAuth"
import { useNavigate, useLocation } from "react-router-dom"

type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)

  const from = (location.state as LoginLocationState | null)?.from?.pathname || "/"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ email, senha })
      navigate(from, { replace: true })
    } catch {
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      animate={shake ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="space-y-2">
        <Label htmlFor="login-email" className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
          E-mail
        </Label>
        <div className="relative group">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200" strokeWidth={1.5} />
          <Input
            id="login-email"
            type="email"
            placeholder="admin@greenly.app"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-11 bg-background/50 border-white/[0.08] focus:border-primary/40 h-12 text-sm transition-all duration-200 focus:bg-background/80"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password" className="text-muted-foreground text-xs uppercase tracking-wider font-medium">
            Senha
          </Label>
          <button type="button" className="text-xs text-primary/70 hover:text-primary transition-colors duration-200">
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative group">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-200" strokeWidth={1.5} />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="pl-11 pr-11 bg-background/50 border-white/[0.08] focus:border-primary/40 h-12 text-sm transition-all duration-200 focus:bg-background/80"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {loginError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
              <p className="text-xs text-destructive">{loginError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="submit"
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 group relative overflow-hidden transition-all duration-300"
        disabled={isLoggingIn}
      >
        <span className="relative z-10 flex items-center gap-2">
          {isLoggingIn ? (
            <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </span>
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-emerald-400 to-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
      </Button>
    </motion.form>
  )
}
