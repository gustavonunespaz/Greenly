import { useState } from "react"
import { Shield, Mail, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { useAuth } from "../hooks/useAuth"

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-muted-foreground text-xs uppercase tracking-wider">
          E-mail
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            id="email"
            type="email"
            placeholder="admin@seres.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-background/50 border-white/[0.08] focus:border-primary/40 h-11"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-muted-foreground text-xs uppercase tracking-wider">
            Senha
          </Label>
          <button type="button" className="text-xs text-primary hover:text-primary/80 transition-colors">
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 bg-background/50 border-white/[0.08] focus:border-primary/40 h-11"
            required
          />
        </div>
      </div>

      {loginError && (
        <p className="text-xs text-destructive mt-2">
          { (loginError as any).response?.data?.error || "E-mail ou senha inválidos" }
        </p>
      )}

      <Button
        type="submit"
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium gap-2 group"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <>
            Entrar
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </Button>
    </form>
  )
}
