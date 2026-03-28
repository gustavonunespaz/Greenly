import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Building2, MapPin, FileCheck, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useClientes } from "@/features/clientes/hooks/useClientes";

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-4 emerald-glow">
        <Building2 className="h-8 w-8 text-primary/70" strokeWidth={1.2} />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">Nenhum cliente cadastrado</h3>
      <p className="text-sm text-muted-foreground/50 max-w-sm">
        Adicione seu primeiro cliente para iniciar a gestão de licenças e MTRs
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
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <div className="skeleton h-3 w-28" />
            <div className="skeleton h-5 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ClientesPage() {
  const { clientes, isLoading } = useClientes();
  const [search, setSearch] = useState("");

  const filtered = (clientes || []).filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.setor?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Clientes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" strokeWidth={1.5} />
            <Input
              placeholder="Buscar cliente ou setor..."
              className="pl-10 h-10 bg-white/[0.03] border-white/[0.06] focus-visible:ring-primary/40 focus-visible:border-primary/30 rounded-xl transition-all duration-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-medium gap-2 hover:bg-primary/90 transition-all duration-200 hover:shadow-[0_4px_16px_-4px_hsla(161,94%,30%,0.4)]">
            <Plus className="h-4 w-4" strokeWidth={2} />
            Novo Cliente
          </Button>
        </div>

        {/* Content */}
        {isLoading ? <SkeletonGrid /> : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.length === 0 ? <EmptyState /> : filtered.map((cliente) => (
              <motion.div key={cliente.id} variants={item}>
                <div className="glass-card-interactive group p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors duration-300">
                        <Building2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors duration-300">{cliente.nome}</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">{cliente.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ring-1 ${
                      cliente.ativo 
                        ? "bg-primary/10 text-primary ring-primary/20" 
                        : "bg-muted/50 text-muted-foreground/60 ring-white/[0.06]"
                    }`}>
                      {cliente.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-muted-foreground flex-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" strokeWidth={1.5} />
                      <span className="truncate">{cliente.cidade || "—"} / {cliente.estado || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" strokeWidth={1.5} />
                      <span className="truncate">{cliente.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" strokeWidth={1.5} />
                      <span>{cliente.telefone || "—"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors duration-300">
                      <FileCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>Ver licenças</span>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-lg bg-white/[0.04] text-muted-foreground/70 ring-1 ring-white/[0.04]">
                      {cliente.setor || "Sem setor"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
