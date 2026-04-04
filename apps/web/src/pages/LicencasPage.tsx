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
  ClipboardList,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLicencas } from "@/features/licencas/hooks/useLicencas";
import { useCondicionantes } from "@/features/licencas/hooks/useCondicionantes";
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
import { useClienteContexto } from "@/features/clientes/components/ClienteContextProvider";
import { FormWizard, type WizardStep } from "@/components/ui/form-wizard";
import { ViewToggle, useViewMode } from "@/components/ui/view-toggle";
import { ChevronRight } from "lucide-react";
import { formatEnum } from "@/lib/utils";


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
  "RLO",
  "RLI",
  "RLP",
  "DLAE",
  "DISPENSA",
  "AUTORIZACAO",
  "OUTRO",
];

type NovoCondicionanteLicenca = {
  descricao: string;
  tipo: 'PONTUAL' | 'PERIODICA';
  codigo: string;
  prazo: string;
};

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
  municipioEmissor: string;
  observacoes: string;
  condicionantes: NovoCondicionanteLicenca[];
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
  municipioEmissor: "",
  observacoes: "",
  condicionantes: [],
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
  const { condicionantes, criarCondicionante } = useCondicionantes();

  const licencaCondicionantesMap = useMemo(() => {
    const map = new Map<string, number>();
    (condicionantes || []).forEach(c => {
      map.set(c.licencaId, (map.get(c.licencaId) || 0) + 1);
    });
    return map;
  }, [condicionantes]);

  const [filter, setFilter] = useState<string>("TODAS");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LicencaResponseDTO | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [formError, setFormError] = useState<ActionableFormError | null>(null);
  
  const { clienteId: globalClienteId, clienteNome: globalClienteNome } = useClienteContexto();
  const rawClienteIdFilter = searchParams.get("clienteId");
  
  // Use global client context if active, otherwise fallback to URL parameter 
  const clienteIdFilter = globalClienteId || rawClienteIdFilter;

  // View mode
  const [viewMode] = useViewMode("licencas", "cards");

  const clientMap = useMemo(() => {
    return new Map(clientes.map((c) => [c.id, c.nome]));
  }, [clientes]);
  const clienteFiltroNome = globalClienteId ? globalClienteNome : (clienteIdFilter ? clientMap.get(clienteIdFilter) || "Cliente" : null);

  const filtered = useMemo(() => {
    return (licencas || []).filter((l) => {
      const matchesCliente = !clienteIdFilter || l.clienteId === clienteIdFilter;
      const matchesFilter = filter === "TODAS" || l.status === filter;
      const matchesSearch =
        !search ||
        l.numeroLicenca?.toLowerCase().includes(search.toLowerCase()) ||
        l.tipo?.toLowerCase().includes(search.toLowerCase()) ||
        (clientMap.get(l.clienteId) || "").toLowerCase().includes(search.toLowerCase());
      return matchesCliente && matchesFilter && matchesSearch;
    });
  }, [licencas, clienteIdFilter, filter, search, clientMap]);

  const filters = ["TODAS", "ATIVA", "VENCIDA", "EM_RENOVACAO", "AGUARDANDO_EMISSAO"];
  const isSaving = isCriando || isAtualizando;
  const hasLicencas = (licencas || []).length > 0;
  const hasActiveFilter = filter !== "TODAS" || !!search.trim() || !!clienteIdFilter;
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

  function openCreate(initialClienteId?: string | null) {
    setEditing(null);
    setForm({
      ...defaultForm,
      clienteId: initialClienteId || "",
    });
    setFormError(null);
    setOpen(true);
  }

  useEffect(() => {
    const quickAction = searchParams.get("quickAction");
    if (quickAction !== "nova-licenca") return;

    openCreate(clienteIdFilter);
    const params = new URLSearchParams(searchParams);
    params.delete("quickAction");
    setSearchParams(params, { replace: true });
  }, [clienteIdFilter, searchParams, setSearchParams]);

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
    const query = searchParams.toString();
    navigate(query ? `/licencas?${query}` : "/licencas", { replace: true });
  }, [licencaIdParam, isLoading, licencas, navigate, searchParams]);

  function openEdit(lic: LicencaResponseDTO) {
    setEditing(lic);
    setForm({
      condicionantes: [],
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
      municipioEmissor: lic.municipioEmissor || "",
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

      // L1-FE: Validate municipioEmissor for municipal agencies
      if (!editing) {
        const selectedOrgao = orgaosAmbientais?.find(o => o.id === form.orgaoAmbientalId);
        if (selectedOrgao?.esfera === 'MUNICIPAL' && !form.municipioEmissor?.trim()) {
          applyTrackedFormError(
            buildValidationFormError("Para órgãos municipais, informe o município emissor."),
            "validation",
          );
          return;
        }
      }

      let licencaIdSalva = editing?.id;

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
            municipioEmissor: form.municipioEmissor || undefined,
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
        const criada = await criarLicenca({
          clienteId: form.clienteId,
          orgaoAmbientalId: form.orgaoAmbientalId,
          tipo: form.tipo,
          numeroProcesso: form.numeroProcesso || undefined,
          numeroLicenca: form.numeroLicenca || undefined,
          nomeEmpreendimento: form.nomeEmpreendimento || undefined,
          atividadeLicenciada: form.atividadeLicenciada || undefined,
          dataEmissao: form.dataEmissao ? new Date(`${form.dataEmissao}T12:00:00`) : undefined,
          dataValidade: form.dataValidade ? new Date(`${form.dataValidade}T12:00:00`) : undefined,
          municipioEmissor: form.municipioEmissor || undefined,
          observacoes: form.observacoes || undefined,
        });
        licencaIdSalva = criada.id;
        toast.success("Licença criada com sucesso.");
        trackFirstValidAction("licencas", "criar_licenca");
        trackFlowCompleted("licencas", "licenca_criada", {
          tipo: form.tipo,
          status: form.status,
        });
      }

      if (licencaIdSalva && form.condicionantes.length > 0) {
        await Promise.all(
          form.condicionantes
            .filter((c) => c.descricao.trim())
            .map((c) =>
              criarCondicionante({
                licencaId: licencaIdSalva as string,
                dto: {
                  licencaId: licencaIdSalva as string,
                  descricao: c.descricao.trim(),
                  tipo: c.tipo,
                  codigo: c.codigo || undefined,
                  prazo: c.prazo ? new Date(`${c.prazo}T12:00:00`) : undefined,
                },
              })
            )
        );
        toast.success(`${form.condicionantes.filter(c => c.descricao.trim()).length} condicionante(s) anexada(s) à licença.`);
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
            <ViewToggle storageKey="licencas" defaultMode="cards" />
            <div className="h-4 w-px bg-white/[0.08] mx-1" />
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

          <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Buscar licença..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 pr-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30 w-full sm:w-56"
              />
            </div>
            <button onClick={() => openCreate(clienteIdFilter)} className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 hover:bg-primary/90 transition-all duration-200">
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Nova Licença
            </button>
          </div>
        </div>

        {clienteFiltroNome ? (
          <div className="glass-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-muted-foreground/80">
              Exibindo visão micro de <span className="text-foreground font-medium">{clienteFiltroNome}</span>.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.delete("clienteId");
                setSearchParams(params, { replace: true });
              }}
              className="rounded-xl"
            >
              Ver todos
            </Button>
          </div>
        ) : null}

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
                : () => openCreate(clienteIdFilter)
            }
          />
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((lic, i) => {
              const perc = lic.diasAteVencimento !== null && lic.diasAteVencimento !== undefined && lic.diasAteVencimento > 0
                ? Math.min(100, Math.max(0, (1 - (lic.diasAteVencimento / 1825)) * 100))
                : 100;
                
              const alertColor = (lic.diasAteVencimento ?? 999) < 0 || lic.status === 'VENCIDA'
                ? 'bg-destructive'
                : (lic.diasAteVencimento ?? 999) <= 120
                ? 'bg-warning'
                : 'bg-primary';

              return (
                <motion.div
                  key={lic.id}
                  variants={item}
                  initial="hidden"
                  animate="show"
                  transition={{ delay: i * 0.03 }}
                  className="glass-card hover:bg-white/[0.03] transition-colors p-5 flex flex-col relative overflow-hidden group"
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${alertColor}`} />
                  
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          {lic.tipo}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">
                          {lic.numeroLicenca ?? "S/N"}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground line-clamp-1" title={clientMap.get(lic.clienteId)}>
                        {clientMap.get(lic.clienteId) || "Cliente desconhecido"}
                      </h3>
                      {lic.nomeEmpreendimento && (
                        <p className="text-[11px] text-muted-foreground/70 mt-0.5 line-clamp-1">
                          {lic.nomeEmpreendimento}
                        </p>
                      )}
                      {lic.orgaoSigla && (
                        <p className="text-[10px] text-muted-foreground/50 mt-1 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40" />
                          {lic.orgaoSigla}
                          {lic.orgaoEsfera && <span className="opacity-60">({lic.orgaoEsfera})</span>}
                          {lic.municipioEmissor && <span className="opacity-60">• {lic.municipioEmissor}</span>}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={lic.status} />
                  </div>

                  {lic.dataValidade && (
                    <div className="mb-5 bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                          Vencimento
                        </span>
                        <span className={`text-[11px] font-semibold ${
                          (lic.diasAteVencimento ?? 999) < 0
                            ? "text-destructive"
                            : (lic.diasAteVencimento ?? 999) <= 120
                            ? "text-warning"
                            : "text-foreground"
                        }`}>
                          {lic.diasAteVencimento === null || lic.diasAteVencimento === undefined
                            ? "—"
                            : lic.diasAteVencimento < 0
                            ? `${Math.abs(lic.diasAteVencimento)}d atrás`
                            : `${lic.diasAteVencimento}d restantes`}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${alertColor}`} 
                          style={{ width: `${perc}%` }} 
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground/60 text-right mt-1">
                        {new Date(lic.dataValidade).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <Button 
                      variant="ghost" 
                      className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5 hover:bg-white/[0.08]"
                      onClick={() => navigate(`/condicionantes?licencaId=${lic.id}`)}
                    >
                      <ClipboardList className="h-3 w-3" />
                      Condicionantes: {licencaCondicionantesMap.get(lic.id) || 0}
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-white/[0.08]" onClick={() => openEdit(lic)} title="Editar licença">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(lic)}
                        disabled={isRemovendo}
                        title="Remover"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-[11px] gap-1 hover:bg-white/[0.08]" onClick={() => navigate(`/licencas/${lic.id}`)}>
                        Detalhes <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto max-w-full">
              <table className="w-full min-w-[920px]">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Cliente</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Tipo</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Nº Licença</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Validade</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Prazo</th>
                    <th className="text-left text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider px-5 py-3">Condicionantes</th>
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                          onClick={() => navigate(`/condicionantes?licencaId=${lic.id}`)}
                        >
                          <ClipboardList className="h-3.5 w-3.5" />
                          {licencaCondicionantesMap.get(lic.id) || 0}
                        </Button>
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(`/licencas/${lic.id}`)}>
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
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
        <DialogContent className="max-w-2xl">
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

          <FormWizard
            isSubmitting={isSaving}
            onCancel={() => setOpen(false)}
            onComplete={handleSave}
            steps={[
              {
                id: "step1",
                label: "Identificação",
                isValid: !!form.clienteId && !!form.orgaoAmbientalId,
                content: (
                  <div className="space-y-4 py-4">
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

                    {(orgaosAmbientais?.find(o => o.id === form.orgaoAmbientalId)?.esfera === 'MUNICIPAL' || 
                      orgaosAmbientais?.find(o => o.id === form.orgaoAmbientalId)?.sigla === 'SMMA') && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                        <Label>Qual Município? *</Label>
                        <Input 
                          placeholder="Ex: Curitiba - PR" 
                          value={form.municipioEmissor} 
                          onChange={(e) => setForm(s => ({ ...s, municipioEmissor: e.target.value }))} 
                        />
                      </motion.div>
                    )}
                  </div>
                )
              },
              {
                id: "step2",
                label: "Licença",
                isValid: !!form.tipo,
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Tipo *</Label>
                      <Select value={form.tipo} onValueChange={(v) => setForm((s) => ({ ...s, tipo: v }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tipoOptions.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {formatEnum(tipo)}
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
                              {formatEnum(status)}
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
                  </div>
                )
              },
              {
                id: "step3",
                label: "Prazos",
                content: (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Data de Emissão</Label>
                      <Input type="date" value={form.dataEmissao} onChange={(e) => setForm((s) => ({ ...s, dataEmissao: e.target.value }))} />
                    </div>

                    <div className="space-y-2">
                      <Label>Data de Validade</Label>
                      <Input type="date" value={form.dataValidade} onChange={(e) => setForm((s) => ({ ...s, dataValidade: e.target.value }))} />
                    </div>
                  </div>
                )
              },
              {
                id: "step4",
                label: "Condicionantes",
                content: (
                  <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-xl border border-white/[0.06]">
                      <div>
                        <Label>Condicionantes Anexas (Opcional)</Label>
                        <p className="text-xs text-muted-foreground mt-1">Registre as regras intrínsecas a esta licença. Elas gerarão prazos na agenda.</p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="rounded-xl px-3 h-8 shadow-none"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            condicionantes: [
                              ...prev.condicionantes,
                              { descricao: "", tipo: "PONTUAL", codigo: "", prazo: "" },
                            ],
                          }))
                        }
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Adicionar Regra
                      </Button>
                    </div>

                    <div className="space-y-3 mt-4">
                      {form.condicionantes.length === 0 && (
                        <div className="text-center py-8 glass-card border-dashed">
                          <p className="text-sm text-muted-foreground/70">Nenhuma condicionante adicionada neste momento.</p>
                        </div>
                      )}

                      {form.condicionantes.map((cond, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl space-y-3 relative overflow-hidden group">
                           <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 text-destructive/70 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() =>
                              setForm((prev) => {
                                const arr = [...prev.condicionantes];
                                arr.splice(idx, 1);
                                return { ...prev, condicionantes: arr };
                              })
                            }
                           >
                            <Trash2 className="w-3.5 h-3.5" />
                           </Button>

                          <div className="flex flex-col md:flex-row gap-3">
                             <div className="w-full md:w-1/3 space-y-1">
                               <Label className="text-[10px] uppercase text-muted-foreground/70">Código (Opcional)</Label>
                               <Input
                                  placeholder="Ex: C-01"
                                  className="h-8 text-sm"
                                  value={cond.codigo}
                                  onChange={(e) => setForm((p) => {
                                    const arr = [...p.condicionantes];
                                    arr[idx].codigo = e.target.value;
                                    return { ...p, condicionantes: arr };
                                  })}
                               />
                             </div>
                             <div className="w-full md:w-1/3 space-y-1">
                                <Label className="text-[10px] uppercase text-muted-foreground/70">Tipo</Label>
                                <Select
                                  value={cond.tipo}
                                  onValueChange={(val: 'PONTUAL' | 'PERIODICA') => setForm((p) => {
                                    const arr = [...p.condicionantes];
                                    arr[idx].tipo = val;
                                    return { ...p, condicionantes: arr };
                                  })}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PONTUAL">Pontual</SelectItem>
                                    <SelectItem value="PERIODICA">Periódica</SelectItem>
                                  </SelectContent>
                                </Select>
                             </div>
                             <div className="w-full md:w-1/3 space-y-1">
                               <Label className="text-[10px] uppercase text-muted-foreground/70 flex justify-between">
                                 Prazo <span className="lowercase font-normal">vazio = contínuo</span>
                               </Label>
                               <Input
                                  type="date"
                                  className="h-8 text-sm"
                                  value={cond.prazo}
                                  onChange={(e) => setForm((p) => {
                                    const arr = [...p.condicionantes];
                                    arr[idx].prazo = e.target.value;
                                    return { ...p, condicionantes: arr };
                                  })}
                               />
                             </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground/70">Descrição *</Label>
                            <Textarea
                              placeholder="Descrição da regra ou exigência estabelecida pelo órgão"
                              className="min-h-[60px] text-sm resize-none"
                              value={cond.descricao}
                              onChange={(e) => setForm((p) => {
                                const arr = [...p.condicionantes];
                                arr[idx].descricao = e.target.value;
                                return { ...p, condicionantes: arr };
                              })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              },
              {
                id: "step5",
                label: "Detalhes",
                content: (
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Empreendimento</Label>
                        <Input value={form.nomeEmpreendimento} onChange={(e) => setForm((s) => ({ ...s, nomeEmpreendimento: e.target.value }))} />
                      </div>

                      <div className="space-y-2">
                        <Label>Atividade Licenciada</Label>
                        <Input value={form.atividadeLicenciada} onChange={(e) => setForm((s) => ({ ...s, atividadeLicenciada: e.target.value }))} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea value={form.observacoes} onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))} className="min-h-[100px]" />
                    </div>
                  </div>
                )
              }
            ]}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
