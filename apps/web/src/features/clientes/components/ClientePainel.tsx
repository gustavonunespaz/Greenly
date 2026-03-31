import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ClientePainelResponseDTO } from '@greenly/shared'
import {
  Activity,
  AlertTriangle,
  Building2,
  FileCheck,
  FileSearch,
  FileText,
  MapPin,
  Pencil,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

const tipoCadastroLabels: Record<string, string> = {
  GERADOR_RESIDUO: 'Gerador de Resíduo',
  PRESTADOR_SERVICO: 'Prestador de Serviço',
  TRANSPORTADOR: 'Transportador',
  DESTINADOR: 'Destinador',
  MULTI_PAPEL: 'Multi Papel',
  OUTRO: 'Outro',
}

function formatDate(value?: string | Date | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-BR')
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('pt-BR')
}

function formatCnpj(value?: string | null) {
  const digits = (value ?? '').replace(/\D/g, '')
  if (digits.length !== 14) return value || '—'
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function riskBadgeClass(risk: ClientePainelResponseDTO['indicadores']['nivelRisco']) {
  switch (risk) {
    case 'CRITICO':
      return 'bg-rose-500/15 text-rose-200 border-rose-400/30'
    case 'ALTO':
      return 'bg-amber-500/15 text-amber-100 border-amber-400/30'
    case 'MODERADO':
      return 'bg-sky-500/15 text-sky-100 border-sky-400/30'
    default:
      return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
  }
}

function statusBadgeClass(status?: string | null) {
  const normalized = (status ?? '').toUpperCase()
  if (['VENCIDA', 'ATRASADA', 'COM_DIVERGENCIA', 'FALHA', 'REJEITADO'].includes(normalized)) {
    return 'bg-rose-500/15 text-rose-200 border-rose-400/30'
  }
  if (
    ['EM_RENOVACAO', 'AGUARDANDO_EMISSAO', 'A_CUMPRIR', 'EM_ANDAMENTO', 'PENDENTE_REVISAO', 'EM_TRANSITO', 'RECEBIDO'].includes(
      normalized,
    )
  ) {
    return 'bg-amber-500/15 text-amber-100 border-amber-400/30'
  }
  return 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30'
}

function MiniStat(props: {
  label: string
  value: string | number
  helper: string
  icon: typeof ShieldCheck
}) {
  const Icon = props.icon

  return (
    <div className="glass-card p-4 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">
          {props.label}
        </p>
        <Icon className="h-4 w-4 text-muted-foreground/60" />
      </div>
      <p className="text-2xl font-semibold text-foreground">{props.value}</p>
      <p className="text-xs text-muted-foreground/70">{props.helper}</p>
    </div>
  )
}

function SectionCard(props: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  children: ReactNode
}) {
  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{props.title}</p>
          <p className="text-xs text-muted-foreground/70">{props.description}</p>
        </div>
        {props.actionLabel && props.onAction ? (
          <Button variant="outline" size="sm" onClick={props.onAction} className="rounded-xl">
            {props.actionLabel}
          </Button>
        ) : null}
      </div>
      {props.children}
    </div>
  )
}

function EmptyBlock(props: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-6 text-sm text-muted-foreground/70">
      {props.message}
    </div>
  )
}

export function ClientePainel(props: {
  painel: ClientePainelResponseDTO
  onEditarCliente: () => void
}) {
  const { painel, onEditarCliente } = props
  const navigate = useNavigate()
  const clienteLabel =
    tipoCadastroLabels[painel.cliente.tipoCadastro] ?? painel.cliente.tipoCadastro ?? 'Cliente'

  return (
    <div className="space-y-5">
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold text-foreground">{painel.cliente.nome}</h2>
              <Badge variant="outline" className="border-white/10 text-[11px]">
                {clienteLabel}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[11px] ${riskBadgeClass(painel.indicadores.nivelRisco)}`}
              >
                Risco {painel.indicadores.nivelRisco.toLowerCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground/80">
              {formatCnpj(painel.cliente.cnpj)} · {painel.cliente.cidade || 'Cidade não informada'}
              {painel.cliente.estado ? ` / ${painel.cliente.estado}` : ''}
            </p>
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground/70">
              <span>{painel.cliente.email || 'Sem e-mail cadastrado'}</span>
              <span>·</span>
              <span>{painel.cliente.telefone || 'Sem telefone cadastrado'}</span>
              <span>·</span>
              <span>{painel.cliente.ativo ? 'Cliente ativo' : 'Cliente inativo'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={onEditarCliente} className="rounded-xl gap-2">
              <Pencil className="h-4 w-4" />
              Editar cliente
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                navigate(`/licencas?quickAction=nova-licenca&clienteId=${painel.cliente.id}`)
              }
              className="rounded-xl gap-2"
            >
              <FileCheck className="h-4 w-4" />
              Nova licença
            </Button>
            <Button
              onClick={() => navigate(`/mtrs?quickAction=novo-mtr&clienteId=${painel.cliente.id}`)}
              className="rounded-xl gap-2"
            >
              <Truck className="h-4 w-4" />
              Novo MTR
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MiniStat
            label="Pendências críticas"
            value={painel.indicadores.pendenciasCriticas}
            helper={`${painel.indicadores.licencasVencidas} licença(s) vencida(s), ${painel.indicadores.condicionantesAtrasadas} condicionante(s) atrasada(s)`}
            icon={AlertTriangle}
          />
          <MiniStat
            label="Licenças"
            value={painel.indicadores.totalLicencas}
            helper={`${painel.indicadores.licencasAtivas} ativas · ${painel.indicadores.licencasVencidas} vencidas`}
            icon={ShieldCheck}
          />
          <MiniStat
            label="Operação de resíduos"
            value={painel.indicadores.mtrsAtivos}
            helper={`${painel.indicadores.mtrsComDivergencia} MTR(s) com divergência · ${painel.indicadores.cdfsEmitidos} CDF(s)`}
            icon={Truck}
          />
          <MiniStat
            label="Documentos"
            value={painel.documentos.length}
            helper={`${painel.indicadores.documentosPendentesRevisao} pendente(s) de revisão · ${painel.indicadores.documentosComFalha} falha(s)`}
            icon={FileSearch}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground/70" />
              Endereço e responsável
            </div>
            <p className="text-sm text-muted-foreground/80">
              {painel.cliente.logradouro || 'Logradouro não informado'}
              {painel.cliente.numero ? `, ${painel.cliente.numero}` : ''}
              {painel.cliente.bairro ? ` · ${painel.cliente.bairro}` : ''}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Responsável: {painel.cliente.nomeResponsavel || 'Não informado'}
            </p>
            <p className="text-xs text-muted-foreground/70">
              Contato responsável: {painel.cliente.emailResponsavel || '—'} ·{' '}
              {painel.cliente.telefoneResponsavel || '—'}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2 md:col-span-1 xl:col-span-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Building2 className="h-4 w-4 text-muted-foreground/70" />
              Instalações vinculadas
            </div>
            {painel.instalacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground/70">
                Nenhuma instalação vinculada a este cliente até o momento.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {painel.instalacoes.map((instalacao) => (
                  <Badge
                    key={instalacao.id}
                    variant="outline"
                    className="border-white/10 bg-white/[0.03] px-3 py-1 text-xs"
                  >
                    {instalacao.nome}
                    {instalacao.cidade ? ` · ${instalacao.cidade}` : ''}
                    {instalacao.estado ? `/${instalacao.estado}` : ''}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Licenças do cliente"
          description="Situação regulatória com atalhos de edição e criação de condicionantes."
          actionLabel="Abrir licenças"
          onAction={() => navigate(`/licencas?clienteId=${painel.cliente.id}`)}
        >
          {painel.licencas.length === 0 ? (
            <EmptyBlock message="Este cliente ainda não possui licenças cadastradas." />
          ) : (
            <div className="space-y-3">
              {painel.licencas.slice(0, 6).map((licenca) => (
                <div
                  key={licenca.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {licenca.numeroLicenca || `${licenca.tipo} sem número`}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {licenca.tipo} · processo {licenca.numeroProcesso || 'não informado'} ·
                        validade {formatDate(licenca.dataValidade)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${statusBadgeClass(licenca.status)}`}
                      >
                        {licenca.status}
                      </Badge>
                      <Badge variant="outline" className="border-white/10 text-[11px]">
                        {licenca.condicionantesAtrasadas}/{licenca.totalCondicionantes} condicionantes críticas
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-muted-foreground/70">
                      {licenca.diasAteVencimento === null
                        ? 'Sem data de validade definida'
                        : licenca.diasAteVencimento >= 0
                          ? `Vence em ${licenca.diasAteVencimento} dia(s)`
                          : `Vencida há ${Math.abs(licenca.diasAteVencimento)} dia(s)`}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/condicionantes?quickAction=nova-condicionante&clienteId=${painel.cliente.id}&licencaId=${licenca.id}`)}
                        className="rounded-xl"
                      >
                        Nova condicionante
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(`/licencas/${licenca.id}?clienteId=${painel.cliente.id}`)
                        }
                        className="rounded-xl"
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Condicionantes"
          description="Pendências e compromissos operacionais associados às licenças do cliente."
          actionLabel="Abrir condicionantes"
          onAction={() => navigate(`/condicionantes?clienteId=${painel.cliente.id}`)}
        >
          {painel.condicionantes.length === 0 ? (
            <EmptyBlock message="Nenhuma condicionante vinculada a este cliente." />
          ) : (
            <div className="space-y-3">
              {painel.condicionantes.slice(0, 6).map((condicionante) => (
                <div
                  key={condicionante.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {condicionante.codigo || 'Sem código'} · {condicionante.descricao}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {condicionante.licencaTipo}
                        {condicionante.licencaNumero ? ` · ${condicionante.licencaNumero}` : ''}
                        {condicionante.responsavelCliente
                          ? ` · responsável ${condicionante.responsavelCliente}`
                          : ''}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${statusBadgeClass(condicionante.status)}`}
                    >
                      {condicionante.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-muted-foreground/70">
                      Prazo {formatDate(condicionante.proximoPrazo || condicionante.prazo)}
                      {condicionante.diasRestantes !== null
                        ? condicionante.diasRestantes >= 0
                          ? ` · ${condicionante.diasRestantes} dia(s) restantes`
                          : ` · atraso de ${Math.abs(condicionante.diasRestantes)} dia(s)`
                        : ''}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(`/condicionantes/${condicionante.id}?clienteId=${painel.cliente.id}`)
                      }
                      className="rounded-xl"
                    >
                      Abrir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="MTRs e CDFs"
          description="Operação micro do cliente com manifesto, destinador e certificados."
          actionLabel="Abrir MTRs"
          onAction={() => navigate(`/mtrs?clienteId=${painel.cliente.id}`)}
        >
          <div className="space-y-4">
            {painel.mtrs.length === 0 ? (
              <EmptyBlock message="Nenhum MTR deste cliente foi emitido ainda." />
            ) : (
              <div className="space-y-3">
                {painel.mtrs.slice(0, 5).map((mtr) => (
                  <div
                    key={mtr.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {mtr.numeroMTR || `MTR-${mtr.id.substring(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {mtr.volume} {mtr.unidadeMedida} · {mtr.tipoDestinacao} · emitido em{' '}
                          {formatDate(mtr.dataEmissao)}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {mtr.transportadoraNome || 'Transportadora não identificada'} →{' '}
                          {mtr.destinadorNome || 'Destinador não identificado'}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[11px] ${statusBadgeClass(mtr.status)}`}
                      >
                        {mtr.status}
                      </Badge>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/mtrs/${mtr.id}?clienteId=${painel.cliente.id}`)}
                        className="rounded-xl"
                      >
                        Abrir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">CDFs recentes</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/mtrs?clienteId=${painel.cliente.id}`)}
                  className="rounded-xl"
                >
                  Ver operação
                </Button>
              </div>
              {painel.cdfs.length === 0 ? (
                <EmptyBlock message="Nenhum CDF emitido para este cliente." />
              ) : (
                <div className="space-y-3">
                  {painel.cdfs.slice(0, 4).map((cdf) => (
                    <div
                      key={cdf.id}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{cdf.numeroCdf}</p>
                          <p className="text-xs text-muted-foreground/70">
                            {cdf.sistema} · {cdf.totalMtrs} MTR(s) · emitido em{' '}
                            {formatDate(cdf.dataEmissao)}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            Destinador {cdf.destinadorNome || 'não identificado'}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[11px] ${statusBadgeClass(cdf.status)}`}
                        >
                          {cdf.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Documentos e atividade"
          description="Leitura documental e eventos recentes concentrados no contexto do cliente."
          actionLabel="Abrir documentos"
          onAction={() => navigate('/documentos')}
        >
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground/70" />
                Documentos mais recentes
              </div>
              {painel.documentos.length === 0 ? (
                <EmptyBlock message="Nenhum documento deste cliente entrou na fila documental ainda." />
              ) : (
                <div className="space-y-3">
                  {painel.documentos.slice(0, 5).map((documento) => (
                    <div
                      key={documento.processamentoDocumentoId}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {documento.documentoNome}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            {documento.tipo} · {documento.categoria}
                            {documento.licencaNumero ? ` · licença ${documento.licencaNumero}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <Badge
                            variant="outline"
                            className={`text-[11px] ${statusBadgeClass(documento.statusProcessamento)}`}
                          >
                            {documento.statusProcessamento}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-[11px] ${statusBadgeClass(documento.revisaoStatus)}`}
                          >
                            {documento.revisaoStatus}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground/70">
                        Recebido em {formatDateTime(documento.recebidoEm)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Activity className="h-4 w-4 text-muted-foreground/70" />
                Atividade recente
              </div>
              {painel.atividadeRecente.length === 0 ? (
                <EmptyBlock message="Nenhum evento recente associado a este cliente." />
              ) : (
                <div className="space-y-3">
                  {painel.atividadeRecente.slice(0, 6).map((atividade) => (
                    <div
                      key={atividade.id}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{atividade.resumo}</p>
                          <p className="text-xs text-muted-foreground/70">
                            {atividade.entidade} · {atividade.evento}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground/60">
                          {formatDateTime(atividade.criadoEm)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
