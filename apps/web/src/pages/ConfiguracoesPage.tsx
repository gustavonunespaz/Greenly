import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Bell, Shield, Save, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  return (
    <AppLayout title="Configurações">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-4xl mx-auto">
        
        {/* Profile */}
        <motion.div variants={item}>
          <div className="glass-card mb-6 overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Perfil da Conta</h3>
                  <p className="text-xs text-muted-foreground/60">Gerencie suas informações pessoais</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 relative">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Nome Completo</Label>
                  <Input defaultValue={user?.nome || ""} className="bg-white/[0.02] border-white/[0.06] focus-visible:ring-primary/40 focus-visible:border-primary/30 h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Endereço de E-mail</Label>
                  <Input readOnly defaultValue={user?.email || ""} className="bg-white/[0.01] border-white/[0.03] text-muted-foreground h-11 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cargo / Papel</Label>
                <div className="flex items-center gap-2 h-11 px-3 bg-white/[0.01] border border-white/[0.04] rounded-lg">
                  <Badge variant="outline" className="bg-white/[0.04] text-muted-foreground font-mono text-[10px] tracking-wider border-white/[0.06] uppercase">
                    {user?.role || "ADMIN"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Company */}
        <motion.div variants={item}>
          <div className="glass-card mb-6 overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Sua Consultoria</h3>
                  <p className="text-xs text-muted-foreground/60">Dados organizacionais e faturamento</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Razão Social</Label>
                  <Input defaultValue="Greenly Consultoria Ambiental" className="bg-white/[0.02] border-white/[0.06] h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">CNPJ</Label>
                  <Input defaultValue="12.345.678/0001-90" className="bg-white/[0.02] border-white/[0.06] h-11 font-mono text-sm" />
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between mt-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary text-xs font-bold">PRO</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">Plano MVP Enterprise</p>
                    <p className="text-[11px] text-muted-foreground">Ciclo de cobrança anual</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-xs">
                  Gerenciar Plano
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notifications config */}
          <motion.div variants={item}>
            <div className="glass-card h-full overflow-hidden">
              <div className="p-5 border-b border-white/[0.06] bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-warning" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Preferências de Alerta</h3>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-6">
                {[
                  { label: "Alertas de Vencimento", desc: "Receber notificações quando licenças estiverem a vencer", req: true },
                  { label: "Notificações por Email", desc: "Receber resumos semanais da operação por email", req: false },
                  { label: "MTRs Divergentes", desc: "Alerta imediato ao detectar descasamento volumétrico", req: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4">
                    <div className="space-y-1 pr-4">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground/60 leading-relaxed">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.req} className="data-[state=checked]:bg-primary shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div variants={item}>
            <div className="glass-card h-full overflow-hidden">
              <div className="p-5 border-b border-white/[0.06] bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-destructive" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Segurança</h3>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Nova Senha</Label>
                  <Input type="password" placeholder="Mínimo 8 caracteres" className="bg-white/[0.02] border-white/[0.06] h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Confirmar Nova Senha</Label>
                  <Input type="password" placeholder="Confirmar nova senha" className="bg-white/[0.02] border-white/[0.06] h-10" />
                </div>
                <Button variant="secondary" className="w-full bg-white/[0.04] text-foreground hover:bg-white/[0.08] mt-2 border border-white/[0.06]">
                  Atualizar Senha
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action bar */}
        <motion.div variants={item} className="flex justify-end pt-6 border-t border-white/[0.06] pb-10">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`gap-2 h-11 px-6 rounded-xl transition-all duration-300 ${
              saved ? "bg-primary text-primary-foreground hover:bg-primary/90" : 
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-[0_4px_24px_-8px_hsla(161,94%,30%,0.5)]"
            }`}
          >
            {isSaving ? (
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                Salvo com sucesso
              </>
            ) : (
              <>
                <Save className="h-4 w-4" strokeWidth={2} />
                Salvar Configurações
              </>
            )}
          </Button>
        </motion.div>

      </motion.div>
    </AppLayout>
  );
}
