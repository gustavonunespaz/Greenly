import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Bell, Shield, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function ConfiguracoesPage() {
  return (
    <AppLayout title="Configurações">
      <div className="space-y-6 max-w-3xl">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <CardTitle className="text-base">Perfil</CardTitle>
                  <CardDescription className="text-xs">Informações pessoais da conta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Nome</Label>
                  <Input defaultValue="Seres Ambiental" className="bg-background/50 border-white/[0.08]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">E-mail</Label>
                  <Input defaultValue="admin@seres.com.br" className="bg-background/50 border-white/[0.08]" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Cargo</Label>
                <Input defaultValue="Administrador" className="bg-background/50 border-white/[0.08]" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Company */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <CardTitle className="text-base">Consultoria</CardTitle>
                  <CardDescription className="text-xs">Dados da empresa</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Razão Social</Label>
                  <Input defaultValue="Seres Ambiental Consultoria Ltda" className="bg-background/50 border-white/[0.08]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">CNPJ</Label>
                  <Input defaultValue="12.345.678/0001-90" className="bg-background/50 border-white/[0.08]" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Plano atual</p>
                  <p className="text-xs text-muted-foreground">Funcionalidades do plano MVP</p>
                </div>
                <Badge className="bg-primary/15 text-primary border-primary/20">MVP</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications settings */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 border border-warning/20 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-warning" strokeWidth={1.5} />
                </div>
                <div>
                  <CardTitle className="text-base">Notificações</CardTitle>
                  <CardDescription className="text-xs">Preferências de alerta</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Licenças vencendo", desc: "Alertar 120, 60 e 30 dias antes", default: true },
                { label: "Condicionantes atrasadas", desc: "Notificar imediatamente ao atrasar", default: true },
                { label: "MTR com divergência", desc: "Alertar inconsistências de dados", default: true },
                { label: "Notificações por e-mail", desc: "Além das notificações in-app", default: false },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.default} />
                  </div>
                  {i < 3 && <Separator className="mt-4 bg-white/[0.06]" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-destructive" strokeWidth={1.5} />
                </div>
                <div>
                  <CardTitle className="text-base">Segurança</CardTitle>
                  <CardDescription className="text-xs">Senha e acesso</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Nova Senha</Label>
                  <Input type="password" placeholder="••••••••" className="bg-background/50 border-white/[0.08]" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Confirmar Senha</Label>
                  <Input type="password" placeholder="••••••••" className="bg-background/50 border-white/[0.08]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-end">
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
