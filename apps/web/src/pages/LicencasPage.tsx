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
  Search,
  Plus,
  FileCheck,
  Filter,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLicencas } from "@/features/licencas/hooks/useLicencas";
import { useClientes } from "@/features/clientes/hooks/useClientes";
import { toast } from "@/components/ui/sonner";
import type { LicencaResponseDTO } from "@greenly/shared";
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

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const filterLabels: Record<string, string> = {
  TODAS: "Todas",
  ATIVA: "Ativas",
  VENCIDA: "Vencidas",
  EM_RENOVACAO: "Em Renovação",
  AGUARDANDO_EMISSAO: "Aguardando",
};

const statusOptions = [
  "ATIVA",
  "VENCIDA",
  "EM_RENOVACAO",
  "AGUARDANDO_EMISSAO",
  "SUSPENSA",
  "CASSADA",
  "DISPENSADA",
  "ARQUIVADA",
];

const tipoOptions = [
  "LP",
  "LI",
  "LO",
  "LO_CORRETIVA",
  "LA",
  "LAS",
  "LAU",
  "DISPENSA",
  "AUTORIZACAO",
  "OUTRO",
];

type FormState = {
  clienteId: string;
  orgaoAmbientalId: string;
  tipo: string;
  status: string;
  numeroProcesso: string;
  numeroLicenca: string;
  nomeEmpreendimento: string;
  atividadeLicenciada: string;
  dataEmissao: string;
  dataValidade: string;
  observacoes: string;
};

const defaultForm: FormState = {
  clienteId: "",
  orgaoAmbientalId: "",
  tipo: "LO",
  status: "AGUARDANDO_EMISSAO",
  numeroProcesso: "",
  numeroLicenca: "",
  nomeEmpreendimento: "",
  atividadeLicenciada: "",
  dataEmissao: "",
  dataValidade: "",
  observacoes: "",
};

function toDateInput(value?: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function SkeletonTable() {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-14" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LicencasPage() {
  const navigate = useNavigate();
  const { id: licencaIdParam } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const ultimaLicencaDeepLinkProcessada = useRef<string | null>(null);
  const {
    licencas,
    isLoading,
    orgaosAmbientais,
    criarLicenca,
    atualizarLicenca,
    removerLicenca,
    isCriando,
    isAtualizando,
    isRemovendo,
  } = useLicencas();
  const { clientes = [] } = useClientes();

  const [filter, setFilter] = useState<string>("TODAS");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LicencaResponseDTO | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [formError, setFormError] = useState<ActionableFormError | null>(null);

  const clientMap = useMemo(() => {
    return new Map(clientes.map((c) => [c.id, c.nome]));
  }, [clientes]);

  const filtered = useMemo(() => {
    return (licencas || []).filter((l) => {
      const matchesFilter = filter === "TODAS" || l.status === filter;
      const matchesSearch =
        !search ||
        l.numeroLicenca?.toLowerCase().includes(search.toLowerCase()) ||
        l.tipo?.toLowerCase().includes(search.toLowerCase()) ||
        (clientMap.get(l.clienteId) || "").toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [licencas, filter, search, clientMap]);

  const filters = ["TODAS", "ATIVA", "VENCIDA", "EM_RENOVACAO", "AGUARDANDO_EMISSAO"];
  const isSaving = isCriando || isAtualizando;
  const hasLicencas = (licencas || []).length > 0;
  const hasActiveFilter = filter !== "TODAS" || !!search.trim();
  const isFormReady = !!form.clienteId && !!form.tipo && (!!editing || !!form.orgaoAmbientalId);
  useTrackViewLoaded("licencas");

  function applyTrackedFormError(
    nextError: ActionableFormError,
    source: "validation" | "api",
  ) {
    setFormError(nextError);
    trackFormError("licencas", "licenca_form", nextError, {
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
    if (quickAction !== "nova-licenca") return;

    openCreate();
    const params = new URLSearchParams(searchParams);
    params.delete("quickAction");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!licencaIdParam || isLoading) return;
    if (ultimaLicencaDeepLinkProcessada.current === licencaIdParam) return;

    ultimaLicencaDeepLinkProcessada.current = licencaIdParam;
    const licenca = (licencas || []).find((item) => item.id === licencaIdParam);

    if (!licenca) {
      toast.error("A licença deste alerta não está mais disponível.");
      navigate("/licencas", { replace: true });
      return;
    }

    openEdit(licenca);
    navigate("/licencas", { replace: true });
  }, [licencaIdParam, isLoading, licencas, navigate]);

  function openEdit(lic: LicencaResponseDTO) {
    setEditing(lic);
    setForm({
      clienteId: lic.clienteId,
      orgaoAmbientalId: "",
      tipo: lic.tipo,
      status: lic.status,
      numeroProcesso: "",
      numeroLicenca: lic.numeroLicenca || "",
      nomeEmpreendimento: "",
      atividadeLicenciada: "",
      dataEmissao: "",
      dataValidade: toDateInput(lic.dataValidade),
      observacoes: "",
    });
    setFormError(null);
    setOpen(true);
  }

  async function handleSave() {
    try {
      setFormError(null);

      if (!form.clienteId) {
        applyTrackedFormError(
          buildValidationFormError("Selecione o cliente da licença."),
          "validation",
        );
        return;
      }

      if (!form.tipo) {
        applyTrackedFormError(
          buildValidationFormError("Selecione o tipo da licença."),
          "validation",
        );
        return;
      }

      if (!editing && !form.orgaoAmbientalId) {
        applyTrackedFormError(
          buildValidationFormError("Selecione o órgão ambiental."),
          "validation",
        );
        return;
      }

      if (editing) {
        await atualizarLicenca({
          id: editing.id,
          dto: {
            clienteId: form.clienteId,
            tipo: form.tipo,
            status: form.status,
            numeroProcesso: form.numeroProcesso || undefined,
            numeroLicenca: form.numeroLicenca || undefined,
            nomeEmpreendimento: form.nomeEmpreendimento || undefined,
            atividadeLicenciada: form.atividadeLicenciada || undefined,
            dataEmissao: form.dataEmissao ? new Date(`${form.dataEmissao}T12:00:00`) : undefined,
            dataValidade: form.dataValidade ? new Date(`${form.dataValidade}T12:00:00`) : undefined,
            observacoes: form.observacoes || undefined,
          },
        });
        toast.success("Licença atualizada com sucesso.");
        trackFirstValidAction("licencas", "editar_licenca");
        trackFlowCompleted("licencas", "licenca_atualizada", {
          tipo: form.tipo,
          status: form.status,
        });
      } else {
        await criarLicenca({
          clienteId: form.clienteId,
          orgaoAmbientalId: form.orgaoAmbientalId,
          tipo: form.tipo,
          numeroProcesso: form.numeroProcesso || undefined,
          numeroLicenca: form.numeroLicenca || undefined,
          nomeEmpreendimento: form.nomeEmpreendimento || undefined,
          atividadeLicenciada: form.atividadeLicenciada || undefined,
          dataEmissao: form.dataEmissao ? new Date(`${form.dataEmissao}T12:00:00`) : undefined,
          dataValidade: form.dataValidade ? new Date(`${form.dataValidade}T12:00:00`) : undefined,
          observacoes: form.observacoes || undefined,
        });
        toast.success("Licença criada com sucesso.");
        trackFirstValidAction("licencas", "criar_licenca");
        trackFlowCompleted("licencas", "licenca_criada", {
          tipo: form.tipo,
          status: form.status,
        });
      }

      setFormError(null);
      setOpen(false);
    } catch (error: unknown) {
      applyTrackedFormError(
        buildActionableFormError(error, "Não foi possível salvar a licença."),
        "api",
      );
    }
  }

  async function handleDelete(lic: LicencaResponseDTO) {
    const confirmed = window.confirm(`Excluir a licença ${lic.numeroLicenca || lic.id.substring(0, 8)}?`);
    if (!confirmed) return;

    try {
      await removerLicenca(lic.id);
      toast.success("Licença excluída com sucesso.");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Não foi possível excluir a licença.");
      toast.error(message);
    }
  }

  return (
    <AppLayout title="Licenças Ambientais">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/40 mr-1" strokeWidth={1.5} />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  filter === f
                    ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                    : "text-muted-foreground/70 hover:text-foreground hover:bg-white/[0.04]"
                }`}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Buscar licença..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 w-56"
              />
            </div>
            <button onClick={openCreate} className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all duration-200">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Nova Licença
            </button>
          </div>
        </div>

        {isLoading ? (
          <SkeletonTable />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileCheck}
            title={
              hasLicencas && hasActiveFilter
                ? "Nenhuma licença para o filtro atual"
                : "Nenhuma licença encontrada"
            }
            description={
              hasLicencas && hasActiveFilter
                ? "Limpe filtros e busca para visualizar os registros já cadastrados."
                : "Cadastre a primeira licença ambiental para monitorar prazos e condicionantes."
            }
            actionLabel={hasLicencas && hasActiveFilter ? "Limpar filtros" : "Nova licença"}
            onAction={
              hasLicencas && hasActiveFilter
                ? () => {
                    setFilter("TODAS");
                    setSearch("");
                  }
                : openCreate
            }
          />
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Cliente</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Tipo</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Nº Licença</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Validade</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Prazo</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-right text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lic, i) => (
                    <motion.tr
                      key={lic.id}
                      variants={item}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-foreground">{clientMap.get(lic.clienteId) || "Cliente"}</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">{lic.id.substring(0, 8)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-mono text-muted-foreground/80 bg-white/[0.06] px-2 py-1 rounded-lg ring-1 ring-white/[0.08]">
                          {lic.tipo}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-muted-foreground">{lic.numeroLicenca ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-muted-foreground/80">
                        {lic.dataValidade ? new Date(lic.dataValidade).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-sm tabular-nums font-medium ${
                            (lic.diasAteVencimento ?? 999) < 0
                              ? "text-destructive"
                              : (lic.diasAteVencimento ?? 999) <= 30
                              ? "text-destructive"
                              : (lic.diasAteVencimento ?? 999) <= 120
                              ? "text-warning"
                              : "text-primary"
                          }`}
                        >
                          {lic.diasAteVencimento === null || lic.diasAteVencimento === undefined
                            ? "—"
                            : lic.diasAteVencimento < 0
                            ? `${Math.abs(lic.diasAteVencimento)}d atrás`
                            : `${lic.diasAteVencimento}d`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={lic.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(lic)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(lic)}
                            disabled={isRemovendo}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

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
            <DialogTitle>{editing ? "Editar Licença" : "Nova Licença"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Atualize os dados da licença selecionada."
                : "Cadastre uma nova licença e vincule ao cliente correto."}
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
              <Select value={form.clienteId} onValueChange={(v) => setForm((s) => ({ ...s, clienteId: v }))}>
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
              <Label>{editing ? "Órgão Ambiental" : "Órgão Ambiental *"}</Label>
              <Select value={form.orgaoAmbientalId} onValueChange={(v) => setForm((s) => ({ ...s, orgaoAmbientalId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o órgão" />
                </SelectTrigger>
                <SelectContent>
                  {(orgaosAmbientais || []).map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.sigla} - {o.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm((s) => ({ ...s, tipo: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipoOptions.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
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
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número da Licença</Label>
              <Input value={form.numeroLicenca} onChange={(e) => setForm((s) => ({ ...s, numeroLicenca: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Número do Processo</Label>
              <Input value={form.numeroProcesso} onChange={(e) => setForm((s) => ({ ...s, numeroProcesso: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Data de Emissão</Label>
              <Input type="date" value={form.dataEmissao} onChange={(e) => setForm((s) => ({ ...s, dataEmissao: e.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label>Data de Validade</Label>
              <Input type="date" value={form.dataValidade} onChange={(e) => setForm((s) => ({ ...s, dataValidade: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Empreendimento</Label>
              <Input value={form.nomeEmpreendimento} onChange={(e) => setForm((s) => ({ ...s, nomeEmpreendimento: e.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Atividade Licenciada</Label>
              <Input value={form.atividadeLicenciada} onChange={(e) => setForm((s) => ({ ...s, atividadeLicenciada: e.target.value }))} />
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
