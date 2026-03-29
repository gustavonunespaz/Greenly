# Changelog

Todas as mudanças relevantes do Greenly serão registradas aqui.

## [2026-03-28] - Consulta automática de CNPJ no cadastro de clientes

### API de consulta de CNPJ

- Novo endpoint autenticado para consulta por CNPJ:
  - `GET /api/clientes/cnpj/:cnpj`
- Integração no backend com a BrasilAPI para retorno normalizado de dados cadastrais.
- Tratamento explícito de cenários de erro:
  - CNPJ inválido (422),
  - CNPJ não encontrado (404),
  - indisponibilidade/limite do provedor externo (502/503).

### Autopreenchimento no frontend

- Formulário de clientes ganhou ação `Buscar CNPJ` ao lado do campo CNPJ.
- Após consulta bem-sucedida, o sistema preenche automaticamente:
  - razão social/nome,
  - e-mail e telefone,
  - CNAE e sugestão de setor,
  - CEP, logradouro, número, complemento, bairro, cidade e estado.
- Telemetria adicionada para rastrear uso do fluxo (`consultar_cnpj` e `cnpj_autopreenchido`).

## [2026-03-28] - Dashboard ambiental expandido + responsividade anti-overflow

### Dashboard e inteligência de risco

- Dashboard principal reformulado para modelo de "radar ambiental" com foco em ação imediata.
- Novo pipeline de consolidação no frontend via `useDashboardIntelligence` unificando:
  - conformidade legal (licenças/condicionantes),
  - operação de resíduos (MTR/CDF),
  - recorte setorial (agronegócio, energia, saúde).
- Novos painéis visuais:
  - `RiskConsolidationPanel` (score de risco + insights),
  - `UpcomingDeadlinesTimeline` (vencimentos próximos por urgência),
  - `KpiSectionsPanel` (KPIs por categoria),
  - `SustainabilityTrendPanel` (tendência histórica comparativa),
  - `TraceabilityPanel` (drill-down de rastreabilidade até MTR/CDF/custo).

### Resíduos e rastreabilidade

- Camada de resíduos no frontend estendida para listar CDF por cliente e consultoria.
- Hook dedicado de CDF (`useCDFs`) integrado à leitura analítica do dashboard.
- Drill-down do dashboard conectado com navegação para registros operacionais de origem.

### UX responsiva e contenção de layout

- Hardening de responsividade para evitar vazamento visual em notebook e telas menores.
- `DialogContent` atualizado para respeitar viewport com:
  - largura máxima dinâmica,
  - altura máxima com scroll interno,
  - contenção de overscroll.
- `AppLayout` e páginas de CRUD ajustados com `min-w-0`, wrappers `overflow-x-auto` e tabelas com largura mínima controlada.
- Formulários longos em modal ajustados para scroll interno vertical sem cortar ações.
- Base global de estilos atualizada para bloquear overflow horizontal de página (`body { overflow-x: hidden; }`).

## [2026-03-28] - Cadastro de clientes com localidade oficial

### CRUD de clientes

- Campo `setor` migrado para seleção em lista no formulário de clientes.
- Endereço do cliente expandido no frontend e backend com:
  - `cep`, `logradouro`, `numero`, `bairro`, `complemento`, `cidade`, `estado`.
- `ClienteResponseDTO` atualizado para devolver todos os campos de endereço e suportar edição completa sem perda de dados.

### Integrações oficiais de localidade

- Nova camada de serviço no web para consumo direto de bases públicas:
  - IBGE (`servicodados.ibge.gov.br`) para estados e municípios.
  - ViaCEP (`viacep.com.br`) para consulta de CEP e autopreenchimento de endereço.
- Formulário de clientes atualizado com:
  - seleção encadeada de `estado` -> `cidade`,
  - ação de busca por CEP com preenchimento automático de endereço.

## [2026-03-28] - Hardening relacional e remoção de legado ORM

### Banco de dados (Drizzle)

- Modelo relacional reforçado para MTR/CDF:
  - nova tabela `mtr_itens` (detalhamento 1:N de resíduos por MTR),
  - novas tabelas `cdfs` e `cdf_mtrs` (vínculo formal CDF ↔ múltiplos MTRs).
- Integridade referencial fechada para IDs pendentes:
  - `condicionantes.responsavelId` -> `usuarios`,
  - `historico_licencas.usuarioId` -> `usuarios`,
  - `historico_condicionantes.usuarioId` -> `usuarios`,
  - `historico_mtr.usuarioId` -> `usuarios`.
- Auditoria estruturada com FKs tipadas por entidade em `logs_auditoria`:
  - `clienteId`, `licencaId`, `condicionanteId`, `mtrId`, `parceiroId`, `cdfId`, `notificacaoId`.
- Índices/uniques críticos adicionados:
  - `licencas_parceiro(parceiroId, numero)` único,
  - índices de suporte em `mtrs.fonteGeradoraId`, `condicionantes.responsavelId` e históricos.

### Backend operacional

- Fluxo de resíduos evoluído:
  - emissão de MTR agora persiste itens em `mtr_itens`,
  - atualização de MTR suporta substituição dos itens de resíduos.
- Novo fluxo de CDF na API de resíduos:
  - emissão de CDF com vínculo explícito de múltiplos MTRs,
  - atualização automática dos MTRs vinculados para `CDF_EMITIDO`.
- Endpoints de apoio para operação e smoke de CDF:
  - `POST /residuos/parceiros` (cadastro operacional de parceiro),
  - `GET /residuos/tipos-residuo` (catálogo para criação de fonte geradora).

### Qualidade e validação

- Novo smoke test dedicado de CDF ponta a ponta:
  - `scripts/smoke-cdf-flow.mjs`,
  - script raiz `test:cdf:smoke`.
- Cobertura do smoke:
  - cliente dedicado de teste,
  - provisionamento de parceiros e fonte geradora,
  - emissão de MTR -> avanço para `RECEBIDO` -> emissão de CDF,
  - validação de status final `CDF_EMITIDO` e trilha de auditoria (`entidade=CDF`).
- Gate técnico automatizado da Sprint 3:
  - script local `scripts/gate-sprint3.sh`,
  - comando raiz `pnpm gate:sprint3`,
  - workflow CI `.github/workflows/sprint3-gate.yml` com Postgres/Redis.

### Motor de alertas

- `alertas_agendados` integrado ao fluxo real:
  - cron persiste alertas na tabela antes de enfileirar jobs,
  - worker atualiza tentativas, erro e `processadoEm`.

### Governança técnica

- Removidos artefatos legados de ORM:
  - pasta legada de schema/seed excluída.
- Documentação atualizada para Drizzle:
  - `apps/api/db_README.md`,
  - `README.md`,
  - `GUIA_ARQUITETURA.md`,
  - Dockerfiles sem comandos/cópias legados.

## [2026-03-28] - Modelo operacional MTR e UX em lista

### Domínio de cadastro e vínculo operacional

- Modelo de cliente evoluído com tipologia de cadastro:
  - `clientes.tipoCadastro` (`GERADOR_RESIDUO`, `PRESTADOR_SERVICO`, `TRANSPORTADOR`, `DESTINADOR`, `MULTI_PAPEL`, `OUTRO`).
- Modelo de parceiros evoluído para integrações governamentais:
  - `sistemaPrincipal`, `sinirHabilitado`, `sinirCadastroId`, `sigorHabilitado`, `sigorCadastroId`, `tipoServico`.
- Nova tabela relacional `cliente_parceiros` para vínculo por papel operacional:
  - papéis suportados (`TRANSPORTADORA`, `DESTINADOR_FINAL`, `PRESTADOR_SERVICO`, `OUTRO`),
  - vínculo por cliente e parceiro com unicidade por papel.
- Emissão de MTR agora exige vínculo ativo cliente ↔ parceiro para transportadora e destinador.

### API e fluxos de resíduos

- Novos endpoints para operação de vínculo:
  - `GET /residuos/clientes/:id/parceiros`
  - `POST /residuos/clientes/:id/parceiros`
- Fluxo de parceiro atualizado para incluir dados SINIR/SIGOR no cadastro.
- Smoke de CDF ajustado para:
  - criar parceiros com habilitação SINIR quando necessário,
  - garantir vínculos cliente ↔ transportadora/destinador antes da emissão de MTR.

### UX e dashboard

- Telas core convertidas para visualização em lista/tabela (menos cards fragmentados):
  - clientes,
  - MTRs,
  - condicionantes.
- Dashboard com drill-down por métrica:
  - clique nos cards de risco abre detalhamento dos itens que compõem cada indicador,
  - links diretos para o registro de origem (cliente, licença, condicionante ou MTR).

## [2026-03-28] - Sprint 3 encerrada (fechamento técnico)

### Governança de sprint

- Sprint 3 marcada como concluída tecnicamente no plano mestre:
  - `docs/plano_acao_benchmarking_ambisis.md`.
- Decisão de gate consolidada no relatório de usabilidade:
  - `docs/sprint3_usabilidade_resultados.md`.

### Operação de homologação externa

- Publicado runbook operacional para rodada externa com 5 usuários reais:
  - `docs/sprint3_homologacao_externa_runbook.md`.
- Validação externa passa a ser trilha contínua de produto (não bloqueante para encerramento técnico da sprint).

## [2026-03-28] - Onda 1 clean-up técnico

### Qualidade de monorepo

- `apps/web_backup` removido do workspace ativo para não contaminar os gates globais (`test`, `typecheck`):
  - atualização em `pnpm-workspace.yaml`.

### Lint e governança técnica

- Lint da API padronizado com ESLint flat config:
  - novo `apps/api/eslint.config.mjs`,
  - dependências de lint adicionadas em `apps/api/package.json`.
- Lint do web estabilizado sem warnings recorrentes de Fast Refresh:
  - ajuste em `apps/web/eslint.config.js` para remover ruído não acionável nos componentes UI compartilhados.

### Build frontend

- Build do web sem warnings de depreciação/chunk oversized no gate:
  - migração de `@vitejs/plugin-react-swc` para `@vitejs/plugin-react` em `apps/web/vite.config.ts`,
  - roteamento com lazy loading das páginas em `apps/web/src/App.tsx` para reduzir bundle inicial.

### Estabilidade de smoke

- Smoke de CDF ajustado para reduzir resíduos operacionais:
  - passa a reaproveitar cliente base (`SMOKE CDF CLIENTE BASE`) quando existir,
  - evita exclusão do cliente base no cleanup para favorecer reuso entre execuções.

### Documentação

- README alinhado com o fechamento da Onda 1:
  - nota explícita de Onda 1 concluída tecnicamente e diferenciação para metas ampliadas de MVP.

## [2026-03-28] - Sprint 2 encerrada e Sprint 3 iniciada

### Fechamento da Sprint 2

- Gate da Sprint 2 encerrado como concluido (execucao antecipada).
- Escopo fechado cumprido:
  - notificacoes acionaveis com "marcar todas como lidas",
  - deep links para telas de acao,
  - quick actions no dashboard.

### Abertura da Sprint 3

- Sprint 3 iniciada em 2026-03-28 (execucao antecipada) com foco em:
  - padrao unico de estados vazios com CTA principal,
  - padrao unico para erros acionaveis em formularios,
  - telemetria base (TTFV, taxa de conclusao por fluxo, erros por sessao).
- Plano mestre atualizado para refletir a troca de sprint em andamento.

### Sprint 3 - Incremento 1

- Padrao unico de empty state criado no web:
  - `apps/web/src/components/ui/empty-state.tsx`.
- Aplicacao do padrao nas telas prioritarias:
  - `dashboard` (licencas criticas),
  - `licencas`,
  - `condicionantes`,
  - `mtrs`,
  - `clientes`.
- CTA principal contextualizado por estado:
  - criar novo registro quando base vazia,
  - limpar filtros/busca quando nao ha resultados.

### Sprint 3 - Incremento 2

- Padrao unico de erro acionavel para formularios implementado no web.
- Novo util de classificacao de erro e fallback tecnico:
  - `apps/web/src/lib/form-actionable-error.ts`.
- Novo callout reutilizavel para formularios:
  - `apps/web/src/components/ui/form-error-callout.tsx`.
- Aplicacao nas telas prioritarias:
  - `licencas`,
  - `condicionantes`,
  - `mtrs`,
  - `clientes`.

### Sprint 3 - Incremento 3

- Telemetria base instrumentada no frontend para os eventos:
  - `view_loaded`,
  - `first_valid_action`,
  - `flow_completed`,
  - `form_error`.
- Nova camada de telemetria com persistencia local:
  - `apps/web/src/lib/telemetry.ts` (buffer em memoria + `localStorage`).
- Novo hook para rastrear carregamento de tela uma vez por view:
  - `apps/web/src/hooks/use-track-view-loaded.ts`.
- Instrumentacao aplicada nas telas prioritarias:
  - `dashboard`,
  - `licencas`,
  - `condicionantes`,
  - `mtrs`,
  - `clientes`.

### Sprint 3 - Incremento 4

- Baseline inicial de metricas da Sprint 3 publicada em painel interno no frontend:
  - integrado na tela `Configuracoes`.
- Nova camada de agregacao de metrica semanal (7 dias):
  - `apps/web/src/lib/telemetry-baseline.ts`.
- Novo hook para consumo de baseline com refresh/limpeza local:
  - `apps/web/src/hooks/use-telemetry-baseline.ts`.
- Metas semanais explicitas no painel:
  - TTFV medio <= 45s,
  - taxa de conclusao >= 70%,
  - erros por sessao <= 1.5.
- Cobertura de teste para calculo de baseline:
  - `apps/web/src/lib/telemetry-baseline.test.ts`.

### Sprint 3 - Incremento 5

- Smoke test dedicado da Sprint 3 implementado:
  - `scripts/smoke-sprint3-flow.mjs`
  - script raiz `test:sprint3:smoke`.
- O smoke valida contratos de:
  - padrao de UX (empty state + erro acionavel),
  - telemetria base e baseline semanal,
  - disponibilidade do painel interno de produto.
- Kit de usabilidade para fechamento de gate publicado:
  - `docs/sprint3_usabilidade_roteiro.md`,
  - `docs/sprint3_usabilidade_resultados.md`.

### Sprint 3 - Incremento 6

- Rodada proxy interna de usabilidade registrada com 5 sessões:
  - consolidado em `docs/sprint3_usabilidade_resultados.md`.
- Ajustes de UX priorizados aplicados nos fluxos core:
  - indicação explícita de campos obrigatórios (`*`) nos formulários,
  - desabilitação de `Salvar` quando campos mínimos obrigatórios estão inválidos,
  - máscara de CNPJ no formulário de clientes,
  - detalhe técnico de erro recolhido por padrão no callout de formulário.
- Painel interno ganhou ação de cópia da baseline em Markdown para evidência rápida da rodada.

## [2026-03-28] - Sprint 2 iniciada

### Planejamento operacional

- Sprint 2 iniciada no plano mestre com status `EM ANDAMENTO` (execucao antecipada).
- Definido escopo fechado da Sprint 2 para manter a regra "um por vez".

### Governanca de demandas adiadas

- Criado backlog oficial para registrar tarefas fora de escopo da sprint atual:
  - `docs/backlog_pos_plano_acao.md`

### Entregue no incremento 1

- Endpoint `PATCH /api/notificacoes/marcar-todas-lidas` implementado.
- Fluxo de notificacoes melhorado:
  - marcar todas como lidas pela UI;
  - clique no alerta abre tela de acao com deep link funcional.
- Dashboard com bloco de "Acoes Rapidas":
  - nova licenca,
  - novo MTR,
  - nova condicionante,
  - novo cliente.
- Fluxo de "acoes rapidas" abre dialogo de criacao diretamente nas paginas de destino.

### Entregue no incremento 2

- Deep links de notificacao com `/:id` passaram a abrir o item correto:
  - licencas: abre dialogo de edicao da licenca de destino;
  - MTRs: abre dialogo de edicao do MTR de destino;
  - condicionantes: destaca e centraliza o card da condicionante de destino.
- Abertura de notificacao nao fica bloqueada por falha ao marcar leitura:
  - o usuario segue para a tela de acao mesmo se o `PATCH /:id/lida` falhar.
- Validacao tecnica executada no estado atual:
  - `apps/web`: `typecheck`, `test`, `build`;
  - `apps/api`: `typecheck`.

### Entregue no incremento 3

- Smoke test dedicado da Sprint 2 implementado:
  - `scripts/smoke-sprint2-flow.mjs`
  - script raiz `test:sprint2:smoke`
  - validacoes: login, notificacoes (listar -> marcar todas -> listar), trilha de auditoria, contratos de deep links e quick actions.
- Divida de lint reduzida para gate tecnico mais limpo no frontend:
  - erros de `no-explicit-any` e `no-useless-escape` removidos;
  - permanencia apenas de warnings nao bloqueantes de `react-refresh/only-export-components`.
- Alinhamento de regra de negocio critica (renovacao de licenca):
  - janela legal de renovacao unificada em 120 dias no backend (configuravel por env);
  - aplicado em criacao/atualizacao de licenca, dashboard e cron de varredura de alertas.
- Baseline de conformidade documentado com fontes oficiais:
  - `docs/compliance_sprint2_mtr_licenciamento.md`

### Entregue no incremento 4

- Esqueleto do modulo de integracao governamental criado no backend:
  - `apps/api/src/modules/integracao-governo/`
  - contratos tipados para MTR/CDF (`GovMtrClient`/`GovCdfClient`);
  - schemas Zod de payload/response para SINIR e SIGOR;
  - builders de payload com normalizacao de CNPJ/CPF/placa/data;
  - adapters `SinirAdapter` e `SigorAdapter` em modo `stubMode` (seguro para evolucao incremental).
- Testes de contrato de payload implementados e aprovados:
  - `apps/api/src/modules/integracao-governo/payload.contract.test.ts` (5 testes).

## [2026-03-28] - Sprint 1 encerrada

### Entregue

- Condicionantes saíram de mock e passaram a operar com API real.
- Dashboard passou a expor métricas reais de risco:
  - `pendenciasCriticas`
  - `condicionantesAtrasadas`
  - `residuosNoMes`
- Fluxo ponta a ponta validado por smoke test automatizado:
  - login -> cliente -> licença -> condicionante -> dashboard.

### Segurança e governança

- Adicionada trilha de auditoria para ações críticas no backend (quem fez, o que mudou, onde, quando).
- Middleware de autenticação reforçado:
  - usuário removido/inexistente não acessa.
  - usuário `INATIVO`, `PENDENTE_CONFIRMACAO` ou `BLOQUEADO` não pode operar.
- Novo endpoint para consulta de auditoria por consultoria:
  - `GET /api/auditoria`
  - filtros: `evento`, `entidade`, `usuarioId`, `dataInicio`, `dataFim`, `limit`, `offset`.

### Observação operacional

- Exclusões seguem soft delete para preservar rastreabilidade e histórico legal.
