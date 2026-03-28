import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Building2, MapPin, FileCheck, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const clientes = [
  { id: "1", nome: "Mineradora Vale Norte", cnpj: "12.345.678/0001-90", setor: "Mineração", cidade: "Rio Branco do Sul", estado: "PR", email: "contato@valenorte.com.br", telefone: "(41) 3333-1001", licencasAtivas: 2, responsavel: "João Ferreira", ativo: true },
  { id: "2", nome: "Indústria Química Paraná", cnpj: "23.456.789/0001-01", setor: "Indústria Química", cidade: "Araucária", estado: "PR", email: "ambiental@iqpr.com.br", telefone: "(41) 3333-2002", licencasAtivas: 1, responsavel: "Maria Souza", ativo: true },
  { id: "3", nome: "Sanepar - ETE Norte", cnpj: "76.484.013/0001-45", setor: "Saneamento", cidade: "Curitiba", estado: "PR", email: "ambiental@sanepar.com.br", telefone: "(41) 3330-3000", licencasAtivas: 1, responsavel: "Ricardo Lima", ativo: true },
  { id: "4", nome: "Cimentos Apucarana", cnpj: "34.567.890/0001-12", setor: "Cimentos", cidade: "Apucarana", estado: "PR", email: "meio.ambiente@cimapuc.com.br", telefone: "(43) 3422-1000", licencasAtivas: 1, responsavel: "Ana Clara", ativo: true },
  { id: "5", nome: "Frigorífico Oeste", cnpj: "45.678.901/0001-23", setor: "Alimentício", cidade: "Cascavel", estado: "PR", email: "ambiental@frigoeste.com.br", telefone: "(45) 3218-5000", licencasAtivas: 1, responsavel: "Pedro Alves", ativo: false },
  { id: "6", nome: "Papel & Celulose Sul", cnpj: "56.789.012/0001-34", setor: "Papel e Celulose", cidade: "Telêmaco Borba", estado: "PR", email: "sustentabilidade@pcsul.com.br", telefone: "(42) 3271-8000", licencasAtivas: 1, responsavel: "Carla Mendes", ativo: true },
  { id: "7", nome: "Energia Solar PR", cnpj: "67.890.123/0001-45", setor: "Energia Renovável", cidade: "Londrina", estado: "PR", email: "projetos@energiasolarpr.com.br", telefone: "(43) 3344-9000", licencasAtivas: 1, responsavel: "Lucas Ribeiro", ativo: true },
];

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.setor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout title="Clientes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
            <Input
              placeholder="Buscar cliente ou setor..."
              className="pl-10 bg-card/60 border-white/[0.08]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Client Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cliente, i) => (
            <motion.div
              key={cliente.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card-hover cursor-pointer group">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{cliente.nome}</p>
                        <p className="text-xs text-muted-foreground">{cliente.cnpj}</p>
                      </div>
                    </div>
                    <Badge variant={cliente.ativo ? "default" : "secondary"} className={cliente.ativo ? "bg-primary/15 text-primary border-primary/20 text-[10px]" : "text-[10px]"}>
                      {cliente.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                      <span>{cliente.cidade}/{cliente.estado}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                      <span className="truncate">{cliente.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                      <span>{cliente.telefone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FileCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                      <span>{cliente.licencasAtivas} licença(s) ativa(s)</span>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-secondary/60 text-muted-foreground">
                      {cliente.setor}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
