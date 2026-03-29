import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Clock, CheckCircle2, ClipboardList, Filter, PlayCircle, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCondicionantes } from "@/features/licencas/hooks/useCondicionantes";
import { useLicencas } from "@/features/licencas/hooks/useLicencas";
import { useClientes } from "@/features/clientes/hooks/useClientes";
import { toast } from "@/components/ui/sonner";
import type { StatusCondicionante } from "@greenly/shared";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { EmptyState } from "@/components/ui/empty-state";
import { getApiErrorMessage } from "@/lib/http-error";
import { FormErrorCallout } from "@/components/ui/form-error-callout";
import {
  ActionableFormError,
  buildActionableFormError,
  buildValidationFormError,
} from "@/lib/form-actionable-error";
import { useTrackViewLoaded } from "@/hooks/use-track-view-loaded";
import { trackFirstValidAction, trackFlowCompleted, trackFormError } from "@/lib/telemetry";

const filterLabels: Record<string, string> = {
  TODAS: "Todas",
  A_CUMPRIR: "A Cumprir",
  EM_ANDAMENTO: "Em Andamento",
  ATRASADA: "Atrasadas",
  CUMPRIDA: "Cumpridas",
};

type NovoCondicionanteForm = {
  licencaId: string;
  descricao: string;
  tipo: "PONTUAL" | "PERIODICA";
  codigo: string;
  prazo: string;
  responsavelCliente: string;
};

const defaultNovoCondicionanteForm: NovoCondicionanteForm = {
  licencaId: "",
  descricao: "",
  tipo: "PONTUAL",
  codigo: "",
  prazo: "",
  responsavelCliente: "",
};

export default function CondicionantesPage() {
  const navigate = useNavigate();
  const { id: condicionanteIdParam } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const ultimoDeepLinkProcessado = useRef<string | null>(null);
  const {
    condicionantes,
    isLoading,
    criarCondicionante,
    atualizarStatusCondicionante,
    isCriando,
    isAtualizandoStatus,
    condicionanteAtualizandoId,
  } = useCondicionantes();
  const { licencas = [] } = useLicencas();
  const { clientes = [] } = useClientes();
  const [filter, setFilter] = useState("TODAS");
  const [openCreate, setOpenCreate] = useState(false);
  const [condicionanteDestacadaId, setCondicionanteDestacadaId] = useState<string | null>(null);
  const [novoForm, setNovoForm] = useState<NovoCondicionanteForm>(defaultNovoCondicionanteForm);
  const [formError, setFormError] = useState<ActionableFormError | null>(null);
  const sorted = [...condicionantes]
    .filter((c) => filter === "TODAS" || c.status === filter)
    .sort((a, b) => {
      const aDias = a.diasRestantes ?? Number.POSITIVE_INFINITY;
      const bDias = b.diasRestantes ?? Number.POSITIVE_INFINITY;
      return aDias - bDias;
    });

  const filters = ["TODAS", "A_CUMPRIR", "EM_ANDAMENTO", "ATRASADA", "CUMPRIDA"];
  const hasCondicionantes = condicionantes.length > 0;
  const hasFilterApplied = filter !== "TODAS";
  const isCreateFormReady = !!novoForm.licencaId && !!novoForm.descricao.trim();
  useTrackViewLoaded("condicionantes");
  const clienteMap = useMemo(() => new Map(clientes.map((c) => [c.id, c.nome])), [clientes]);
  const licencasParaSelecao = useMemo(() => {
    return [...licencas].sort((a, b) => {
      const nomeA = (clienteMap.get(a.clienteId) || "").toLowerCase();
      const nomeB = (clienteMap.get(b.clienteId) || "").toLowerCase();
      return nomeA.localeCompare(nomeB);
    });
  }, [licencas, clienteMap]);

  function applyTrackedFormError(
    nextError: ActionableFormError,
    source: "validation" | "api",
  ) {
    setFormError(nextError);
    trackFormError("condicionantes", "condicionante_form", nextError, {
      source,
      tipo: novoForm.tipo,
    });
  }

  function openCreateDialog() {
    setNovoForm(defaultNovoCondicionanteForm);
    setFormError(null);
    setOpenCreate(true);
  }

  useEffect(() => {
    const quickAction = searchParams.get("quickAction");
    if (quickAction !== "nova-condicionante") return;

    openCreateDialog();
    const params = new URLSearchParams(searchParams);
    params.delete("quickAction");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!condicionanteIdParam || isLoading) return;
    if (ultimoDeepLinkProcessado.current === condicionanteIdParam) return;

    ultimoDeepLinkProcessado.current = condicionanteIdParam;
    const condicionante = condicionantes.find((item) => item.id === condicionanteIdParam);

    if (!condicionante) {
      toast.error("A condicionante deste alerta não está mais disponível.");
      navigate("/condicionantes", { replace: true });
      return;
    }

    setFilter("TODAS");
    setCondicionanteDestacadaId(condicionante.id);

    window.setTimeout(() => {
      const elemento = document.getElementById(`condicionante-${condicionante.id}`);
      elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);

    navigate("/condicionantes", { replace: true });
  }, [condicionanteIdParam, condicionantes, isLoading, navigate]);

  useEffect(() => {
    if (!condicionanteDestacadaId) return;

    const timer = window.setTimeout(() => {
      setCondicionanteDestacadaId(null);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [condicionanteDestacadaId]);

  async function handleCriarCondicionante() {
    try {
      setFormError(null);
      if (!novoForm.licencaId) {
        applyTrackedFormError(
          buildValidationFormError("Selecione uma licença para vincular a condicionante."),
          "validation",
        );
        return;
      }

      if (!novoForm.descricao.trim()) {
        applyTrackedFormError(
          buildValidationFormError("Descreva a condicionante antes de salvar."),
          "validation",
        );
        return;
      }

      await criarCondicionante({
        licencaId: novoForm.licencaId,
        dto: {
          licencaId: novoForm.licencaId,
          descricao: novoForm.descricao.trim(),
          tipo: novoForm.tipo,
          codigo: novoForm.codigo || undefined,
          prazo: novoForm.prazo ? new Date(`${novoForm.prazo}T12:00:00`) : undefined,
          responsavelCliente: novoForm.responsavelCliente || undefined,
        },
      });

      toast.success("Condicionante cadastrada com sucesso.");
      trackFirstValidAction("condicionantes", "criar_condicionante");
      trackFlowCompleted("condicionantes", "condicionante_criada", {
        tipo: novoForm.tipo,
      });
      setFormError(null);
      setOpenCreate(false);
    } catch (error: unknown) {
      applyTrackedFormError(
        buildActionableFormError(error, "Não foi possível cadastrar a condicionante."),
        "api",
      );
    }
  }

  async function handleAtualizarStatus(id: string, status: StatusCondicionante) {
    try {
      await atualizarStatusCondicionante({
        id,
        dto: {
          status,
          dataCumprimento: status === "CUMPRIDA" ? new Date() : undefined,
        },
      });
      toast.success("Status da condicionante atualizado.");
      trackFirstValidAction("condicionantes", "atualizar_status_condicionante");
      trackFlowCompleted("condicionantes", "condicionante_status_atualizado", {
        status,
      });
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Não foi possível atualizar o status.");
      toast.error(message);
    }
  }

  return (
    <AppLayout title="Condicionantes">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/40 mr-1" strokeWidth={1.5} />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  filter === f
                    ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                {filterLabels[f]}
                {f === "ATRASADA" && (
                  <span className="ml-1.5 text-[9px] bg-destructive/20 text-destructive px-1.5 py-0.5 rounded-full">
                    {condicionantes.filter((c) => c.status === "ATRASADA").length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <Button onClick={openCreateDialog} className="h-9 rounded-xl gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nova Condicionante
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-5">
                <div className="space-y-2">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-4 w-full max-w-[540px]" />
                  <div className="skeleton h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={
              hasCondicionantes && hasFilterApplied
                ? "Nenhuma condicionante para o filtro atual"
                : "Nenhuma condicionante encontrada"
            }
            description={
              hasCondicionantes && hasFilterApplied
                ? "Volte para 'Todas' para revisar o backlog completo."
                : "Cadastre a primeira condicionante para iniciar o acompanhamento."
            }
            actionLabel={hasCondicionantes && hasFilterApplied ? "Ver todas" : "Nova condicionante"}
            onAction={
              hasCondicionantes && hasFilterApplied
                ? () => setFilter("TODAS")
                : openCreateDialog
            }
          />
        ) : (
          <div className="space-y-3">
            {sorted.map((c, i) => (
              <motion.div
                key={c.id}
                id={`condicionante-${c.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className={`glass-card-interactive p-5 ${
                  condicionanteDestacadaId === c.id ? "ring-2 ring-primary/35" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground/70 bg-white/[0.04] px-2 py-1 rounded-lg ring-1 ring-white/[0.04]">
                        {c.codigo || `ID-${c.id.substring(0, 8)}`}
                      </span>
                      <StatusBadge status={c.status} />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground/40 bg-white/[0.02] px-2 py-0.5 rounded-lg">
                        {c.tipo === "PERIODICA" ? "Periódica" : "Pontual"}
                      </span>
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed">{c.descricao}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground/50">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        Prazo: {c.prazo ? new Date(c.prazo).toLocaleDateString("pt-BR") : "Não definido"}
                      </span>
                      <span>Responsável: {c.responsavelCliente || "Não definido"}</span>
                      <span>Cliente: {c.clienteNome}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`text-2xl tabular-nums font-semibold ${
                      (c.diasRestantes ?? 999999) < 0 ? "text-destructive" :
                      (c.diasRestantes ?? 999999) <= 30 ? "text-warning" :
                      "text-primary"
                    }`}>
                      {c.diasRestantes === null || c.diasRestantes === undefined
                        ? "—"
                        : `${Math.abs(c.diasRestantes)}d`}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">
                      {c.diasRestantes === null || c.diasRestantes === undefined
                        ? "sem prazo"
                        : c.diasRestantes < 0
                        ? "atrasada"
                        : "restantes"}
                    </span>
                    {c.status === "A_CUMPRIR" && (
                      <button
                        onClick={() => handleAtualizarStatus(c.id, "EM_ANDAMENTO")}
                        disabled={isAtualizandoStatus && condicionanteAtualizandoId === c.id}
                        className="mt-1 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-muted-foreground/70 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <PlayCircle className="h-3 w-3" strokeWidth={1.5} />
                        Iniciar
                      </button>
                    )}
                    {c.status !== "CUMPRIDA" && c.status !== "DISPENSADA" && (
                      <button
                        onClick={() => handleAtualizarStatus(c.id, "CUMPRIDA")}
                        disabled={isAtualizandoStatus && condicionanteAtualizandoId === c.id}
                        className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary hover:bg-primary/15 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
                        Marcar cumprida
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Dialog
        open={openCreate}
        onOpenChange={(nextOpen) => {
          setOpenCreate(nextOpen);
          if (!nextOpen) {
            setFormError(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Condicionante</DialogTitle>
            <DialogDescription>
              Cadastre uma condicionante e direcione a responsabilidade para execução imediata.
            </DialogDescription>
          </DialogHeader>

          <FormErrorCallout
            error={formError}
            onAction={() => {
              if (!formError) return;
              if (formError.actionKind === "retry") {
                void handleCriarCondicionante();
                return;
              }
              setFormError(null);
            }}
          />
          <p className="text-[11px] text-muted-foreground/70">
            Campos marcados com * são obrigatórios para salvar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Licença vinculada *</Label>
              <Select
                value={novoForm.licencaId}
                onValueChange={(value) => setNovoForm((s) => ({ ...s, licencaId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma licença" />
                </SelectTrigger>
                <SelectContent>
                  {licencasParaSelecao.map((licenca) => (
                    <SelectItem key={licenca.id} value={licenca.id}>
                      {clienteMap.get(licenca.clienteId) || "Cliente"} - {licenca.numeroLicenca || licenca.tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Descrição *</Label>
              <Input
                value={novoForm.descricao}
                onChange={(e) => setNovoForm((s) => ({ ...s, descricao: e.target.value }))}
                placeholder="Descreva o requisito da condicionante"
              />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={novoForm.tipo}
                onValueChange={(value: "PONTUAL" | "PERIODICA") => setNovoForm((s) => ({ ...s, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PONTUAL">Pontual</SelectItem>
                  <SelectItem value="PERIODICA">Periódica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={novoForm.codigo}
                onChange={(e) => setNovoForm((s) => ({ ...s, codigo: e.target.value }))}
                placeholder="Ex: COND-01"
              />
            </div>

            <div className="space-y-2">
              <Label>Prazo</Label>
              <Input
                type="date"
                value={novoForm.prazo}
                onChange={(e) => setNovoForm((s) => ({ ...s, prazo: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Responsável (cliente)</Label>
              <Input
                value={novoForm.responsavelCliente}
                onChange={(e) => setNovoForm((s) => ({ ...s, responsavelCliente: e.target.value }))}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCriarCondicionante} disabled={isCriando || !isCreateFormReady}>
              {isCriando ? "Salvando..." : "Salvar condicionante"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
