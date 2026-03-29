import { AppLayout } from "@/components/layout/AppLayout";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  CheckCircle2,
  Circle,
  Truck,
  PackageCheck,
  FileCheck2,
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useResiduos } from "@/features/residuos/hooks/useResiduos";
import { residuoService } from "@/features/residuos/services/residuoService";
import { useClientes } from "@/features/clientes/hooks/useClientes";
import { toast } from "@/components/ui/sonner";
import type { MTRResponseDTO } from "@greenly/shared";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "@/lib/http-error";
import { EmptyState } from "@/components/ui/empty-state";
import { FormErrorCallout } from "@/components/ui/form-error-callout";
import {
  ActionableFormError,
  buildActionableFormError,
  buildValidationFormError,
} from "@/lib/form-actionable-error";
import { useTrackViewLoaded } from "@/hooks/use-track-view-loaded";
import { trackFirstValidAction, trackFlowCompleted, trackFormError } from "@/lib/telemetry";

const steps = [
  { key: "EMITIDO", label: "Emitido", icon: Circle },
  { key: "EM_TRANSITO", label: "Em Trânsito", icon: Truck },
  { key: "RECEBIDO", label: "Recebido", icon: PackageCheck },
  { key: "CDF_EMITIDO", label: "CDF", icon: FileCheck2 },
];

const stepIndex: Record<string, number> = {
  EMITIDO: 0,
  EM_TRANSITO: 1,
  RECEBIDO: 2,
  CDF_EMITIDO: 3,
  CANCELADO: -1,
  COM_DIVERGENCIA: -2,
};

const statusOptions = ["EMITIDO", "EM_TRANSITO", "RECEBIDO", "CDF_EMITIDO", "CANCELADO", "COM_DIVERGENCIA"];
const unidadeOptions = ["KG", "TON", "LITRO", "M3", "UNIDADE"];
const tipoDestinacaoOptions = [
  "ATERRO_SANITARIO",
  "ATERRO_INDUSTRIAL",
  "INCINERACAO",
  "COPROCESSAMENTO",
  "RECICLAGEM",
  "COMPOSTAGEM",
  "TRATAMENTO_BIOLOGICO",
  "TRATAMENTO_QUIMICO",
  "TRATAMENTO_FISICO",
  "REUTILIZACAO",
  "LOGISTICA_REVERSA",
  "OUTRO",
];

type FormState = {
  clienteId: string;
  fonteGeradoraId: string;
  transportadoraId: string;
  destinadorId: string;
  tipoDestinacao: string;
  volume: string;
  unidadeMedida: string;
  numeroMTR: string;
  placaVeiculo: string;
  nomeMotorista: string;
  cpfMotorista: string;
  observacoes: string;
  status: string;
};

const defaultForm: FormState = {
  clienteId: "",
  fonteGeradoraId: "",
  transportadoraId: "",
  destinadorId: "",
  tipoDestinacao: "INCINERACAO",
  volume: "",
  unidadeMedida: "KG",
  numeroMTR: "",
  placaVeiculo: "",
  nomeMotorista: "",
  cpfMotorista: "",
  observacoes: "",
  status: "EMITIDO",
};

function MTRTimeline({ status }: { status: string }) {
  const current = stepIndex[status] ?? -1;
  const isError = current < 0;

  return (
    <div className="flex items-center gap-1.5 hidden sm:flex">
      {steps.map((step, i) => {
        const completed = !isError && i <= current;
        const active = !isError && i === current;
        const Icon = completed ? CheckCircle2 : step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center group relative">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 ring-2 ring-background ${
                  completed
                    ? active
                      ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsla(161,94%,30%,0.5)] z-10 scale-110"
                      : "bg-primary/20 text-primary"
                    : "bg-white/[0.05] text-muted-foreground/50"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
              <span className={`absolute -bottom-5 text-[9px] whitespace-nowrap hidden lg:block transition-colors duration-300 ${completed ? "text-primary/80 font-medium" : "text-muted-foreground/50"}`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-[2px] w-8 mx-[-2px] rounded-full z-0 transition-colors duration-500 ${
                  !isError && i < current ? "bg-primary/50" : "bg-white/[0.08]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SkeletonMTR() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="glass-card p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-3 w-1/2">
              <div className="flex items-center gap-3">
                <div className="skeleton h-5 w-32" />
                <div className="skeleton h-5 w-20 rounded-full" />
              </div>
              <div className="skeleton h-4 w-48" />
              <div className="skeleton h-3 w-32" />
            </div>
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center">
                  <div className="skeleton h-7 w-7 rounded-full" />
                  {j < 3 && <div className="skeleton h-[2px] w-8 mx-[-2px]" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MTRsPage() {
  const navigate = useNavigate();
  const { id: mtrIdParam } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const ultimoMtrDeepLinkProcessado = useRef<string | null>(null);
  const { clientes = [] } = useClientes();
  const {
    mtrs,
    isLoading,
    emitirMTR,
    atualizarMTR,
    avancarStatusMTR,
    removerMTR,
    transportadoras,
    destinadores,
    isEmitindo,
    isAtualizando,
    isRemovendo,
    isAvancandoStatus,
  } = useResiduos();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MTRResponseDTO | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [formError, setFormError] = useState<ActionableFormError | null>(null);

  const { data: fontesGeradoras = [], isLoading: isLoadingFontes } = useQuery({
    queryKey: ["fontes-geradoras", form.clienteId],
    queryFn: () => residuoService.listarFontesGeradoras(form.clienteId),
    enabled: !!form.clienteId,
  });

  const clientMap = useMemo(() => new Map(clientes.map((c) => [c.id, c.nome])), [clientes]);
  const partnerMap = useMemo(() => {
    const map = new Map<string, string>();
    [...transportadoras, ...destinadores].forEach((p) => map.set(p.id, p.nome));
    return map;
  }, [transportadoras, destinadores]);

  const volumeNumber = Number(form.volume);
  const isFormReady =
    !!form.clienteId &&
    !!form.fonteGeradoraId &&
    !!form.transportadoraId &&
    !!form.destinadorId &&
    Number.isFinite(volumeNumber) &&
    volumeNumber > 0;
  const isSaving = isEmitindo || isAtualizando || isAvancandoStatus;
  useTrackViewLoaded("mtrs");

  function applyTrackedFormError(
    nextError: ActionableFormError,
    source: "validation" | "api",
  ) {
    setFormError(nextError);
    trackFormError("mtrs", "mtr_form", nextError, {
      mode: editing ? "edit" : "create",
      source,
    });
  }

  function openCreate() {
    setEditing(null);
    setForm(defaultForm);
    setFormError(null);
    setOpen(true);
  }

  useEffect(() => {
    const quickAction = searchParams.get("quickAction");
    if (quickAction !== "novo-mtr") return;

    openCreate();
    const params = new URLSearchParams(searchParams);
    params.delete("quickAction");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!mtrIdParam || isLoading) return;
    if (ultimoMtrDeepLinkProcessado.current === mtrIdParam) return;

    ultimoMtrDeepLinkProcessado.current = mtrIdParam;
    const mtr = (mtrs || []).find((item) => item.id === mtrIdParam);

    if (!mtr) {
      toast.error("O MTR deste alerta não está mais disponível.");
      navigate("/mtrs", { replace: true });
      return;
    }

    openEdit(mtr);
    navigate("/mtrs", { replace: true });
  }, [mtrIdParam, isLoading, mtrs, navigate]);

  function openEdit(mtr: MTRResponseDTO) {
    setEditing(mtr);
    setForm({
      clienteId: mtr.clienteId,
      fonteGeradoraId: mtr.fonteGeradoraId,
      transportadoraId: mtr.transportadoraId,
      destinadorId: mtr.destinadorId,
      tipoDestinacao: mtr.tipoDestinacao,
      volume: String(mtr.volume),
      unidadeMedida: mtr.unidadeMedida,
      numeroMTR: mtr.numeroMTR || "",
      placaVeiculo: mtr.placaVeiculo || "",
      nomeMotorista: mtr.nomeMotorista || "",
      cpfMotorista: mtr.cpfMotorista || "",
      observacoes: mtr.observacoes || "",
      status: mtr.status,
    });
    setFormError(null);
    setOpen(true);
  }

  async function handleSave() {
    try {
      setFormError(null);
      if (!form.clienteId || !form.fonteGeradoraId || !form.transportadoraId || !form.destinadorId) {
        applyTrackedFormError(
          buildValidationFormError("Preencha cliente, fonte geradora, transportadora e destinador."),
          "validation",
        );
        return;
      }

      const volume = Number(form.volume);
      if (!Number.isFinite(volume) || volume <= 0) {
        applyTrackedFormError(
          buildValidationFormError("Informe um volume válido maior que zero."),
          "validation",
        );
        return;
      }

      if (editing) {
        await atualizarMTR({
          id: editing.id,
          dto: {
            clienteId: form.clienteId,
            fonteGeradoraId: form.fonteGeradoraId,
            transportadoraId: form.transportadoraId,
            destinadorId: form.destinadorId,
            tipoDestinacao: form.tipoDestinacao,
            volume,
            unidadeMedida: form.unidadeMedida,
            numeroMTR: form.numeroMTR || undefined,
            placaVeiculo: form.placaVeiculo || undefined,
            nomeMotorista: form.nomeMotorista || undefined,
            cpfMotorista: form.cpfMotorista || undefined,
            observacoes: form.observacoes || undefined,
          },
        });

        if (form.status !== editing.status) {
          await avancarStatusMTR({ id: editing.id, novoStatus: form.status });
        }

        toast.success("MTR atualizado com sucesso.");
        trackFirstValidAction("mtrs", "editar_mtr");
        trackFlowCompleted("mtrs", "mtr_atualizado", {
          status: form.status,
          tipoDestinacao: form.tipoDestinacao,
        });
      } else {
        await emitirMTR({
          clienteId: form.clienteId,
          fonteGeradoraId: form.fonteGeradoraId,
          transportadoraId: form.transportadoraId,
          destinadorId: form.destinadorId,
          tipoDestinacao: form.tipoDestinacao,
          volume,
          unidadeMedida: form.unidadeMedida,
          numeroMTR: form.numeroMTR || undefined,
          placaVeiculo: form.placaVeiculo || undefined,
          nomeMotorista: form.nomeMotorista || undefined,
          cpfMotorista: form.cpfMotorista || undefined,
          observacoes: form.observacoes || undefined,
        });
        toast.success("MTR emitido com sucesso.");
        trackFirstValidAction("mtrs", "emitir_mtr");
        trackFlowCompleted("mtrs", "mtr_emitido", {
          status: form.status,
          tipoDestinacao: form.tipoDestinacao,
        });
      }

      setFormError(null);
      setOpen(false);
    } catch (error: unknown) {
      applyTrackedFormError(
        buildActionableFormError(error, "Não foi possível salvar o MTR."),
        "api",
      );
    }
  }

  async function handleDelete(mtr: MTRResponseDTO) {
    const confirmed = window.confirm(`Excluir o MTR ${mtr.numeroMTR || mtr.id.substring(0, 8)}?`);
    if (!confirmed) return;

    try {
      await removerMTR(mtr.id);
      toast.success("MTR excluído com sucesso.");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Não foi possível excluir o MTR.");
      toast.error(message);
    }
  }

  return (
    <AppLayout title="Manifestos de Transporte (MTR)">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-muted-foreground/70">Acompanhamento em tempo real das movimentações.</p>
          <Button onClick={openCreate} className="gap-2 h-9 rounded-xl">
            <Plus className="h-4 w-4" />
            Novo MTR
          </Button>
        </div>

        {isLoading ? (
          <SkeletonMTR />
        ) : !mtrs || mtrs.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="Nenhum MTR emitido"
            description="Emita o primeiro manifesto para iniciar o controle."
            actionLabel="Novo MTR"
            onAction={openCreate}
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {mtrs.map((mtr, i) => (
              <motion.div
                key={mtr.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35, ease: "easeOut" }}
                className="glass-card-interactive p-5 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-mono font-semibold text-foreground group-hover:text-primary transition-colors">
                        {mtr.numeroMTR || "MTR-PENDENTE"}
                      </span>
                      <StatusBadge status={mtr.status} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                      <p className="text-xs text-muted-foreground/85 truncate">
                        <span className="text-muted-foreground/55 mr-1">Cliente:</span>
                        {clientMap.get(mtr.clienteId) || mtr.clienteId}
                      </p>
                      <p className="text-xs text-muted-foreground/85 truncate">
                        <span className="text-muted-foreground/55 mr-1">Resíduo:</span>
                        {mtr.volume} {mtr.unidadeMedida}
                      </p>
                      <p className="text-[11px] text-muted-foreground/75 truncate col-span-1 md:col-span-2">
                        <span className="text-muted-foreground/55 mr-1">T/D:</span>
                        {partnerMap.get(mtr.transportadoraId) || mtr.transportadoraId} → {partnerMap.get(mtr.destinadorId) || mtr.destinadorId}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <MTRTimeline status={mtr.status} />

                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(mtr)}>
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(mtr)} disabled={isRemovendo}>
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <button className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all duration-200">
                      <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setFormError(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar MTR" : "Novo MTR"}</DialogTitle>
            <DialogDescription>
              {editing ? "Atualize os dados do manifesto selecionado." : "Emita um novo manifesto de transporte de resíduos."}
            </DialogDescription>
          </DialogHeader>

          <FormErrorCallout
            error={formError}
            onAction={() => {
              if (!formError) return;
              if (formError.actionKind === "retry") {
                void handleSave();
                return;
              }
              setFormError(null);
            }}
          />
          <p className="text-[11px] text-muted-foreground/70">
            Campos marcados com * são obrigatórios para salvar.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Select value={form.clienteId} onValueChange={(v) => setForm((s) => ({ ...s, clienteId: v, fonteGeradoraId: "" }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fonte Geradora *</Label>
              <Select value={form.fonteGeradoraId} onValueChange={(v) => setForm((s) => ({ ...s, fonteGeradoraId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingFontes ? "Carregando fontes..." : "Selecione a fonte"} />
                </SelectTrigger>
                <SelectContent>
                  {fontesGeradoras.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.descricao || `Fonte ${f.id.substring(0, 6)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Transportadora *</Label>
              <Select value={form.transportadoraId} onValueChange={(v) => setForm((s) => ({ ...s, transportadoraId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a transportadora" />
                </SelectTrigger>
                <SelectContent>
                  {transportadoras.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Destinador *</Label>
              <Select value={form.destinadorId} onValueChange={(v) => setForm((s) => ({ ...s, destinadorId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o destinador" />
                </SelectTrigger>
                <SelectContent>
                  {destinadores.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Destinação</Label>
              <Select value={form.tipoDestinacao} onValueChange={(v) => setForm((s) => ({ ...s, tipoDestinacao: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipoDestinacaoOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item.replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((s) => ({ ...s, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Volume *</Label>
              <Input value={form.volume} onChange={(e) => setForm((s) => ({ ...s, volume: e.target.value }))} placeholder="0.000" />
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={form.unidadeMedida} onValueChange={(v) => setForm((s) => ({ ...s, unidadeMedida: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unidadeOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número do MTR</Label>
              <Input value={form.numeroMTR} onChange={(e) => setForm((s) => ({ ...s, numeroMTR: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Placa do Veículo</Label>
              <Input value={form.placaVeiculo} onChange={(e) => setForm((s) => ({ ...s, placaVeiculo: e.target.value.toUpperCase() }))} />
            </div>

            <div className="space-y-2">
              <Label>Motorista</Label>
              <Input value={form.nomeMotorista} onChange={(e) => setForm((s) => ({ ...s, nomeMotorista: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>CPF do Motorista</Label>
              <Input value={form.cpfMotorista} onChange={(e) => setForm((s) => ({ ...s, cpfMotorista: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !isFormReady} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
