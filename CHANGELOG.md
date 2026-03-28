# Changelog

Todas as mudanças relevantes do Greenly serão registradas aqui.

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
