import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Building2,
  MapPin,
  Phone,
  Mail,
  Pencil,
  Trash2,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useClientes } from "@/features/clientes/hooks/useClientes";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import type { ClienteResponseDTO } from "@greenly/shared";
import { useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "@/lib/http-error";

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

type ClienteFormState = {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  setor: string;
  cnae: string;
  cidade: string;
  estado: string;
  ativo: boolean;
};

const defaultForm: ClienteFormState = {
  nome: "",
  cnpj: "",
  email: "",
  telefone: "",
  setor: "",
  cnae: "",
  cidade: "",
  estado: "",
  ativo: true,
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function formatCnpj(value?: string | null) {
  const digits = digitsOnly(value || "");
  if (digits.length !== 14) return value || "—";
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 emerald-glow">
        <Building2 className="h-8 w-8 text-primary/70" strokeWidth={1.2} />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">Nenhum cliente cadastrado</h3>
      <p className="text-sm text-muted-foreground/60 max-w-sm">
        Cadastre o primeiro cliente para iniciar a gestão de licenças e MTRs.
      </p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass-card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-32" />
                <div className="skeleton h-3 w-24" />
              </div>
            </div>
            <div className="skeleton h-5 w-12 rounded-full" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="skeleton h-3 w-40" />
            <div className="skeleton h-3 w-48" />
            <div className="skeleton h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ClientesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    clientes,
    isLoading,
    criarCliente,
    atualizarCliente,
    removerCliente,
    isCriando,
    isAtualizando,
    isRemovendo,
  } = useClientes();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClienteResponseDTO | null>(null);
  const [form, setForm] = useState<ClienteFormState>(defaultForm);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return (clientes || []).filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        (c.setor || "").toLowerCase().includes(term) ||
        (c.cnpj || "").includes(digitsOnly(term))
    );
  }, [clientes, search]);

  const isSaving = isCriando || isAtualizando;

  function openNew() {
    setEditing(null);
    setForm(defaultForm);
    setOpen(true);
  }

  useEffect(() => {
    const quickAction = searchParams.get("quickAction");
    if (quickAction !== "novo-cliente") return;

    openNew();
    const params = new URLSearchParams(searchParams);
    params.delete("quickAction");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  function openEdit(cliente: ClienteResponseDTO) {
    setEditing(cliente);
    setForm({
      nome: cliente.nome || "",
      cnpj: formatCnpj(cliente.cnpj),
      email: cliente.email || "",
      telefone: cliente.telefone || "",
      setor: cliente.setor || "",
      cnae: cliente.cnae || "",
      cidade: cliente.cidade || "",
      estado: cliente.estado || "",
      ativo: cliente.ativo,
    });
    setOpen(true);
  }

  async function handleSave() {
    try {
      const consultoriaId = user?.consultoriaId;
      const cnpj = digitsOnly(form.cnpj);

      if (!form.nome.trim()) {
        toast.error("Informe o nome do cliente.");
        return;
      }

      if (cnpj.length !== 14) {
        toast.error("CNPJ inválido. Informe 14 dígitos.");
        return;
      }

      if (!editing && !consultoriaId) {
        toast.error("Consultoria não identificada no seu usuário.");
        return;
      }

      const payload = {
        nome: form.nome.trim(),
        cnpj,
        email: form.email || undefined,
        telefone: form.telefone || undefined,
        setor: form.setor || undefined,
        cnae: form.cnae || undefined,
        cidade: form.cidade || undefined,
        estado: form.estado || undefined,
        ativo: form.ativo,
      };

      if (editing) {
        await atualizarCliente({ id: editing.id, dto: payload });
        toast.success("Cliente atualizado com sucesso.");
      } else {
        await criarCliente({
          consultoriaId: consultoriaId!,
          nome: payload.nome,
          cnpj: payload.cnpj,
          email: payload.email,
          telefone: payload.telefone,
          setor: payload.setor,
          cnae: payload.cnae,
          cidade: payload.cidade,
          estado: payload.estado,
        });

        if (payload.cidade || payload.estado) {
          toast.success("Cliente criado. Você pode editar para completar mais dados.");
        } else {
          toast.success("Cliente criado com sucesso.");
        }
      }

      setOpen(false);
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Não foi possível salvar o cliente.");
      toast.error(message);
    }
  }

  async function handleDelete(cliente: ClienteResponseDTO) {
    const confirmed = window.confirm(`Excluir o cliente "${cliente.nome}"?`);
    if (!confirmed) return;

    try {
      await removerCliente(cliente.id);
      toast.success("Cliente excluído com sucesso.");
    } catch (error: unknown) {
      const message = getApiErrorMessage(error, "Não foi possível excluir o cliente.");
      toast.error(message);
    }
  }

  return (
    <AppLayout title="Clientes">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />
            <Input
              placeholder="Buscar cliente, setor ou CNPJ..."
              className="pl-10 h-10 bg-white/[0.03] border-white/[0.08] focus-visible:ring-primary/40 focus-visible:border-primary/30 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button onClick={openNew} className="h-10 px-4 rounded-xl gap-2">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Novo Cliente
          </Button>
        </div>

        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((cliente) => (
                <motion.div key={cliente.id} variants={item}>
                  <div className="glass-card-interactive group p-5 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {cliente.nome}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">{formatCnpj(cliente.cnpj)}</p>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ring-1 ${
                          cliente.ativo
                            ? "bg-primary/10 text-primary ring-primary/20"
                            : "bg-muted/50 text-muted-foreground/70 ring-border"
                        }`}
                      >
                        {cliente.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-muted-foreground flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" strokeWidth={1.5} />
                        <span className="truncate">
                          {cliente.cidade || "—"} / {cliente.estado || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" strokeWidth={1.5} />
                        <span className="truncate">{cliente.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" strokeWidth={1.5} />
                        <span>{cliente.telefone || "—"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.08] gap-2">
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.05] text-muted-foreground/80 ring-1 ring-white/[0.08]">
                        {cliente.setor || "Sem setor"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openEdit(cliente)}
                          title="Editar cliente"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(cliente)}
                          disabled={isRemovendo}
                          title="Excluir cliente"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Atualize as informações do cliente selecionado."
                : "Cadastre um cliente para vinculá-lo a licenças e MTRs."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))} placeholder="Razão social / nome do cliente" />
            </div>

            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input
                value={form.cnpj}
                onChange={(e) => setForm((s) => ({ ...s, cnpj: e.target.value }))}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label>Setor</Label>
              <Input value={form.setor} onChange={(e) => setForm((s) => ({ ...s, setor: e.target.value }))} placeholder="Industrial, saúde, logística..." />
            </div>

            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} placeholder="contato@empresa.com" />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={(e) => setForm((s) => ({ ...s, telefone: e.target.value }))} placeholder="(00) 00000-0000" />
            </div>

            <div className="space-y-2">
              <Label>CNAE</Label>
              <Input value={form.cnae} onChange={(e) => setForm((s) => ({ ...s, cnae: e.target.value }))} placeholder="0000-0/00" />
            </div>

            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e) => setForm((s) => ({ ...s, cidade: e.target.value }))} placeholder="Cidade" />
            </div>

            <div className="space-y-2">
              <Label>Estado (UF)</Label>
              <Input
                value={form.estado}
                onChange={(e) => setForm((s) => ({ ...s, estado: e.target.value.toUpperCase().slice(0, 2) }))}
                placeholder="UF"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 md:col-span-2">
              <div>
                <p className="text-sm font-medium text-foreground">Cliente ativo</p>
                <p className="text-xs text-muted-foreground">Use inativo para ocultar sem perder histórico.</p>
              </div>
              <Switch checked={form.ativo} onCheckedChange={(checked) => setForm((s) => ({ ...s, ativo: checked }))} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
