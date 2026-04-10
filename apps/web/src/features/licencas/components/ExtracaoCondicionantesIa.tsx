import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, CheckCircle2, ChevronRight, XCircle, FileSearch, Trash2 } from 'lucide-react'
import { useCondicionantes } from '../hooks/useCondicionantes'
import { toast } from '@/components/ui/sonner'

interface ExtracaoCondicionantesIaProps {
  licencaId: string
  statusExtracao?: string | null
  dadosLicenca?: any | null
  onAutoFill?: (payload: any) => void
}

export function ExtracaoCondicionantesIa({ licencaId, statusExtracao, dadosLicenca, onAutoFill }: ExtracaoCondicionantesIaProps) {
  const {
    condicionantesExtraidas,
    isCarregandoExtraidas,
    extrairCondicionantesIa,
    validarCondicionantesIa,
    isExtraindoIa,
    isValidandoIa
  } = useCondicionantes(licencaId)

  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())

  // Initialization: select all by default when loaded
  const todasSelecao = condicionantesExtraidas.length > 0 && selecionadas.size === condicionantesExtraidas.length

  const handleToggleTodas = () => {
    if (todasSelecao) {
      setSelecionadas(new Set())
    } else {
      setSelecionadas(new Set(condicionantesExtraidas.map(c => c.id)))
    }
  }

  const handleToggle = (id: string) => {
    const next = new Set(selecionadas)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelecionadas(next)
  }

  const handleDispararExtracao = async () => {
    try {
      await extrairCondicionantesIa(licencaId)
      toast.success('Extração iniciada! Acompanhe o status nesta aba.')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Erro ao iniciar extração da IA')
    }
  }

  const handleValidar = async () => {
    if (condicionantesExtraidas.length === 0) return

    const validacoes = condicionantesExtraidas.map(c => ({
      condicionanteId: c.id,
      aceita: selecionadas.has(c.id)
    }))

    try {
      await validarCondicionantesIa({ licencaId, validacoes })
      toast.success('Condicionantes validadas com sucesso!')
      setSelecionadas(new Set())
    } catch (e: any) {
      toast.error('Erro ao validar condicionantes')
    }
  }

  if (statusExtracao === 'FALHA') {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center space-y-3">
        <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-sm font-medium text-foreground">Falha na extração por IA</p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          Não foi possível extrair as condicionantes. Verifique se o documento principal anexado à licença é um PDF válido e com texto (não apenas imagens escaneadas sem OCR).
        </p>
        <Button variant="outline" size="sm" onClick={handleDispararExtracao} disabled={isExtraindoIa} className="mt-2 text-xs">
          {isExtraindoIa ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (statusExtracao === 'PROCESSANDO' || isExtraindoIa) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center space-y-4">
        <div className="relative mx-auto w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">IA analisando documento</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            O Gemini está lendo o PDF da licença para encontrar e estruturar suas obrigações...
          </p>
        </div>
      </div>
    )
  }

  if (statusExtracao === 'CONCLUIDO' && condicionantesExtraidas.length > 0) {
    return (
      <div className="glass-card p-4 space-y-4 border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Revisão de IA Pendente</h4>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              A IA detectou {condicionantesExtraidas.length} condicionante(s). Revise e e aprove para incluí-las no sistema.
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            {selecionadas.size} selecionadas
          </Badge>
        </div>

        {dadosLicenca && onAutoFill && (
          <div className="bg-primary/10 rounded-xl p-3 flex flex-col gap-2 border border-primary/20">
            <div className="flex items-center gap-1.5 text-primary mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Dados Cadastrais Identificados</span>
            </div>
            <div className="text-xs text-foreground grid grid-cols-2 gap-x-2 gap-y-1">
              <span className="text-muted-foreground font-medium text-[10px] uppercase">Nº Licença: {dadosLicenca.numeroLicenca || '-'}</span>
              <span className="text-muted-foreground font-medium text-[10px] uppercase">Nº Processo: {dadosLicenca.numeroProcesso || '-'}</span>
              <span className="text-muted-foreground font-medium text-[10px] uppercase">Emissão: {dadosLicenca.dataEmissao || '-'}</span>
              <span className="text-muted-foreground font-medium text-[10px] uppercase">Validade: {dadosLicenca.dataValidade || '-'}</span>
            </div>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onAutoFill(dadosLicenca);
                toast.success('Formulário auto-preenchido com dados da licença!');
              }}
              className="mt-1 h-7 text-xs border-primary/30 text-primary hover:bg-primary/20"
            >
              Preencher formulário com estes dados
            </Button>
          </div>
        )}

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          <div className="flex items-center px-2 py-1 gap-2 border-b border-primary/10 pb-2 mb-2">
            <Checkbox checked={todasSelecao} onCheckedChange={handleToggleTodas} />
            <span className="text-xs font-medium text-muted-foreground flex-1">Selecionar todas</span>
          </div>

          {condicionantesExtraidas.map(c => (
            <label
              key={c.id}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                selecionadas.has(c.id) ? 'bg-primary/10 border-primary/30' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
              }`}
            >
              <Checkbox 
                checked={selecionadas.has(c.id)} 
                onCheckedChange={() => handleToggle(c.id)} 
                className="mt-0.5"
              />
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    {c.codigo && (
                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {c.codigo}
                      </span>
                    )}
                    <Badge variant="outline" className="text-[9px] h-4">
                      {c.tipo}
                    </Badge>
                  </div>
                  {c.confiancaExtracaoIa !== null && (
                    <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded tracking-wide text-muted-foreground flex items-center gap-1">
                      <FileSearch className="w-3 h-3" />
                      {c.confiancaExtracaoIa}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground font-medium leading-relaxed">{c.descricao}</p>
                {(c.prazo || c.periodicidade) && (
                  <p className="text-[10px] text-muted-foreground flex gap-3">
                    {c.prazo && <span>Prazo cal.: {new Date(c.prazo).toLocaleDateString('pt-BR')}</span>}
                    {c.periodicidade && <span>Periodicidade: {c.periodicidade}</span>}
                  </p>
                )}
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleValidar} 
            disabled={isValidandoIa}
            className="flex gap-2 text-xs h-8"
          >
            {isValidandoIa ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            Confirmar Revisão ({condicionantesExtraidas.length - selecionadas.size} serão excluídas)
          </Button>
        </div>
      </div>
    )
  }

  // Se não extraiu ou se não tem condicionantes extraídas pendentes
  return (
    <div className="rounded-xl border border-dashed border-primary/30 p-5 flex flex-col items-center justify-center text-center bg-primary/[0.02]">
      <Sparkles className="h-6 w-6 text-primary/50 mb-2" />
      <h4 className="text-sm font-medium text-foreground">Extração Automática com IA</h4>
      <p className="text-xs text-muted-foreground max-w-md mt-1 mb-4">
        Acelere o cadastro. Peça para nossa IA ler o documento salvo e identificar todas as obrigações e prazos para você revisar.
      </p>
      <Button 
        onClick={handleDispararExtracao} 
        disabled={isExtraindoIa} 
        variant="secondary"
        size="sm"
        className="text-xs shadow-none border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary"
      >
        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
        Extrair Documento
      </Button>
    </div>
  )
}
