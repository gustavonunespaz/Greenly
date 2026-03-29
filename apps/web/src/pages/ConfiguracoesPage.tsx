import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building2,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  BarChart3,
  RefreshCcw,
  Eraser,
  Gauge,
  Target,
  AlertTriangle,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useState } from "react";
import { useTrackViewLoaded } from "@/hooks/use-track-view-loaded";
import { useTelemetryBaseline } from "@/hooks/use-telemetry-baseline";
import {
  formatTelemetryBaselineMarkdown,
  type BaselineTargetStatus,
} from "@/lib/telemetry-baseline";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function formatMetric(value: number | null, suffix = "", digits = 1) {
  if (value === null) return "Sem dados";
  return `${value.toFixed(digits)}${suffix}`;
}

function targetLabel(status: BaselineTargetStatus) {
  if (status === "on_track") return "Na meta";
  if (status === "off_track") return "Fora da meta";
  return "Dados insuficientes";
}

function targetClassName(status: BaselineTargetStatus) {
  if (status === "on_track") return "bg-primary/10 text-primary ring-primary/20";
  if (status === "off_track") return "bg-destructive/10 text-destructive ring-destructive/20";
  return "bg-muted/50 text-muted-foreground ring-border";
}

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isRefreshingBaseline, setIsRefreshingBaseline] = useState(false);
  const [isClearingBaseline, setIsClearingBaseline] = useState(false);
  const [copiedBaseline, setCopiedBaseline] = useState(false);
  const { report, refresh, clear } = useTelemetryBaseline(7);
  useTrackViewLoaded("configuracoes");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const handleRefreshBaseline = () => {
    setIsRefreshingBaseline(true);
    refresh();
    setTimeout(() => setIsRefreshingBaseline(false), 300);
  };

  const handleClearBaseline = () => {
    const confirmed = window.confirm(
      "Limpar os eventos locais de telemetria deste navegador?",
    );
    if (!confirmed) return;

    setIsClearingBaseline(true);
    clear();
    setTimeout(() => setIsClearingBaseline(false), 300);
  };

  async function handleCopyBaselineSnapshot() {
    const content = formatTelemetryBaselineMarkdown(report);

    try {
      await navigator.clipboard.writeText(content);
      setCopiedBaseline(true);
      setTimeout(() => setCopiedBaseline(false), 2000);
      return;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedBaseline(true);
      setTimeout(() => setCopiedBaseline(false), 2000);
    }
  }

  const activeScreens = report.screens.filter(
    (screen) =>
      screen.views > 0 ||
      screen.firstValidActions > 0 ||
      screen.flowCompleted > 0 ||
      screen.formErrors > 0,
  );

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

        <motion.div variants={item}>
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.01] flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Painel Interno de Produto</h3>
                  <p className="text-xs text-muted-foreground/60">
                    Baseline Sprint 3 com dados locais dos últimos {report.windowDays} dias.
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white/[0.03] border-white/[0.06] text-[10px] uppercase tracking-wider">
                Atualizado em {new Date(report.generatedAt).toLocaleString("pt-BR")}
              </Badge>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-muted-foreground/70">
                  Métricas calculadas sobre eventos de `view_loaded`, `first_valid_action`, `flow_completed` e `form_error`.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-white/[0.03] border-white/[0.06]"
                    onClick={handleRefreshBaseline}
                    disabled={isRefreshingBaseline}
                  >
                    <RefreshCcw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshingBaseline ? "animate-spin" : ""}`} />
                    Atualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-white/[0.03] border-white/[0.06]"
                    onClick={handleClearBaseline}
                    disabled={isClearingBaseline}
                  >
                    <Eraser className="h-3.5 w-3.5 mr-1.5" />
                    Limpar baseline local
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs bg-white/[0.03] border-white/[0.06]"
                    onClick={() => {
                      void handleCopyBaselineSnapshot();
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copiar baseline
                  </Button>
                </div>
              </div>
              {copiedBaseline && (
                <p className="text-[11px] text-primary/80">
                  Snapshot copiado em Markdown para colar no relatório de usabilidade.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">TTFV Médio</p>
                    <Gauge className="h-3.5 w-3.5 text-primary/70" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground tabular-nums">
                    {formatMetric(report.summary.ttfvAvgSeconds, "s")}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-muted-foreground/60">
                      Meta: ≤ {report.targets.ttfvAvgSeconds}s
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ring-1 ${targetClassName(report.summary.statuses.ttfv)}`}>
                      {targetLabel(report.summary.statuses.ttfv)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">Conclusão de Fluxos</p>
                    <Target className="h-3.5 w-3.5 text-primary/70" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground tabular-nums">
                    {formatMetric(report.summary.completionRatePct, "%")}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-muted-foreground/60">
                      Meta: ≥ {report.targets.completionRatePct}%
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ring-1 ${targetClassName(report.summary.statuses.completion)}`}>
                      {targetLabel(report.summary.statuses.completion)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">Erros por Sessão</p>
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground tabular-nums">
                    {formatMetric(report.summary.errorsPerSession, "", 2)}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-muted-foreground/60">
                      Meta: ≤ {report.targets.errorsPerSession}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ring-1 ${targetClassName(report.summary.statuses.errors)}`}>
                      {targetLabel(report.summary.statuses.errors)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground/60 uppercase tracking-wider">Volume da Base</p>
                    <BarChart3 className="h-3.5 w-3.5 text-primary/70" />
                  </div>
                  <p className="text-2xl font-semibold text-foreground tabular-nums">
                    {report.summary.sessionCount}
                  </p>
                  <div className="text-[11px] text-muted-foreground/60">
                    {report.summary.totalEvents} eventos capturados
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3">Leitura por Tela</p>
                  <div className="space-y-2">
                    {activeScreens.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60">
                        Ainda sem dados suficientes. Navegue nas telas e execute ações para gerar baseline.
                      </p>
                    ) : (
                      activeScreens.map((screen) => (
                        <div key={screen.screen} className="rounded-lg border border-white/[0.05] px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-foreground font-medium">{screen.label}</p>
                            <span className="text-[10px] text-muted-foreground/70 px-2 py-0.5 rounded-full bg-white/[0.03] ring-1 ring-white/[0.06]">
                              {screen.completionRatePct === null
                                ? "Sem taxa"
                                : `${screen.completionRatePct.toFixed(1)}%`}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground/65 mt-1">
                            Views {screen.views} · Ações {screen.firstValidActions} · Conclusões {screen.flowCompleted} · Erros {screen.formErrors}
                          </p>
                          <p className="text-[11px] text-muted-foreground/55 mt-0.5">
                            TTFV médio: {screen.ttfvAvgSeconds === null ? "Sem dados" : `${screen.ttfvAvgSeconds.toFixed(1)}s`}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-3">Fluxos Mais Concluídos</p>
                  <div className="space-y-2">
                    {report.flows.length === 0 ? (
                      <p className="text-xs text-muted-foreground/60">
                        Nenhum fluxo concluído registrado no período selecionado.
                      </p>
                    ) : (
                      report.flows.slice(0, 6).map((flow) => (
                        <div key={flow.flow} className="rounded-lg border border-white/[0.05] px-3 py-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-foreground truncate">{flow.flow}</p>
                            <p className="text-[11px] text-muted-foreground/60">
                              {flow.completed} conclusão(ões)
                            </p>
                          </div>
                          <span className="text-[11px] text-primary font-medium tabular-nums">
                            {flow.sharePct.toFixed(1)}%
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

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
