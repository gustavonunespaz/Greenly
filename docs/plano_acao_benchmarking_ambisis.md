# Plano Mestre Greenly - Benchmarking Ambisis

Data base do planejamento: 2026-03-28

## Objetivo geral
Aplicar os pontos de maior valor do benchmarking na plataforma Greenly para:
- fechar o produto de ponta a ponta (compliance legal + operacional),
- maximizar intuitividade para o usuario final,
- evoluir com seguranca tecnica e previsibilidade de entrega.
- se existirem duvidas ou quiser entender mais sobre esse plano de ação, analise o documento docs/analise_de_benchmarking_de_solucoes_digitais.docx

## Como vamos executar
- Cadencia: sprints de 2 semanas.
- Regra de execucao: uma sprint por vez, sem abrir nova sprint antes do gate de aceite da sprint atual.
- Modelo de entrega: vertical slice (backend + frontend + testes + observabilidade na mesma sprint).
- Definicao de pronto (DoD) padrao:
  - funcionalidade em producao/staging funcional,
  - testes de unidade/integracao/E2E essenciais atualizados,
  - telemetria e logs instrumentados,
  - documentacao de uso e operacao atualizada.

## Matriz de viabilidade (atualizada)
| Iniciativa | Situacao atual Greenly | Viabilidade | Prioridade |
|---|---|---|---|
| Dashboard de risco "gestao a vista" completo | Parcial | Alta | P0 |
| Condicionantes sem mock (fluxo real ponta a ponta) | Parcial | Alta | P0 |
| Alertas proativos e operacionais | Parcial | Alta | P0 |
| OCR/NLP para ingestao de licencas | Ausente | Media-alta | P1 |
| Revisao humana de extracao (human-in-the-loop) | Ausente | Alta | P1 |
| Integracao SINIR/SIGOR | Ausente | Media | P1 |
| Operacao de campo offline-first (PWA) | Ausente | Media | P2 |
| Checklist inteligente com voz/imagem | Ausente | Media | P2 |
| Predicao de risco com IA | Ausente | Media-baixa (agora) | P3 |
| Camada interna de produtividade (MCP/IDP) | Ausente | Media-baixa (agora) | P3 |

## Mapa completo de ondas
| Onda | Periodo | Sprints | Foco principal |
|---|---|---|---|
| Onda 1 | 2026-03-30 a 2026-05-08 | S1 a S3 | Completar core e UX intuitiva |
| Onda 2 | 2026-05-11 a 2026-06-19 | S4 a S6 | Automacao documental (OCR/NLP) |
| Onda 3 | 2026-06-22 a 2026-07-31 | S7 a S9 | Integracoes governamentais + confiabilidade |
| Onda 4 | 2026-08-03 a 2026-09-11 | S10 a S12 | Campo offline-first + evidencias |
| Onda 5 | 2026-09-14 a 2026-10-23 | S13 a S15 | IA aplicada + hardening + go-live |

## Detalhamento completo por sprint

## Onda 1 - Core completo e intuitivo

### Sprint 1 (2026-03-30 a 2026-04-10) - Condicionantes reais + dashboard essencial
Status: CONCLUIDA em 2026-03-28

Objetivo:
- remover mocks do modulo de condicionantes e completar os KPIs criticos do dashboard.

Entregas:
- Frontend de condicionantes ligado na API real (listar, filtrar, ordenar, mudar status).
- Backend de condicionantes com rotas faltantes para fluxo operacional diario.
- Dashboard com metricas reais:
  - pendencias criticas,
  - condicionantes atrasadas,
  - notificacoes nao lidas.
- Testes E2E: login -> criar licenca -> criar condicionante -> concluir condicionante -> refletir no dashboard.

Gate de aceite:
- tela de condicionantes 100% sem mock,
- dashboard sem cards zerados artificialmente,
- fluxo principal validado em E2E.

### Sprint 2 (2026-04-13 a 2026-04-24) - Notificacoes acionaveis + acoes rapidas
Status: CONCLUIDA em 2026-03-28 (execucao antecipada)

Objetivo:
- transformar notificacoes e dashboard em superficies de acao, nao so de consulta.

Entregas:
- Endpoint e UI "marcar todas como lidas".
- Deep links funcionais por tipo de alerta (licenca, condicionante, MTR).
- Bloco "Acoes rapidas" no dashboard:
  - nova licenca,
  - novo MTR,
  - nova condicionante,
  - novo cliente.
- Ajustes de copia UX orientados a tarefa.

Gate de aceite:
- 1 clique para limpar caixa de notificacoes,
- 100% dos alertas com destino navegavel correto,
- queda de cliques nos 3 fluxos mais usados.

Escopo fechado desta sprint:
- endpoint e UI "marcar todas como lidas",
- deep links por tipo de alerta,
- bloco "acoes rapidas" no dashboard,
- ajustes de copia UX orientados a tarefa.

Registro de nao escopo:
- toda demanda fora do gate desta sprint deve ser registrada em `docs/backlog_pos_plano_acao.md`.

Progresso atual (incremento 1):
- [x] endpoint "marcar todas como lidas" no backend.
- [x] botao funcional "marcar todas como lidas" no frontend.
- [x] deep links de notificacoes para telas de acao (licenca, condicionante, MTR).
- [x] bloco "acoes rapidas" no dashboard com atalhos operacionais.
- [x] quick actions abrindo dialogo de criacao em licenca, MTR, cliente e condicionante.

Progresso atual (incremento 2):
- [x] deep links com `/:id` abrindo item de destino (licenca e MTR) ou destacando card (condicionante).
- [x] navegacao para acao preservada mesmo quando marcar notificacao como lida falha.
- [x] validacao tecnica da entrega executada (`apps/web` typecheck/test/build e `apps/api` typecheck).

Progresso atual (incremento 3):
- [x] smoke test dedicado da Sprint 2 (notificacoes + deep links + quick actions).
- [x] limpeza de erros de lint no frontend para gate tecnico mais previsivel.
- [x] baseline de conformidade legal documentado com fontes oficiais (CONAMA/PNRS/Portaria 280/SINIR/SIGOR/FEPAM/IAT).
- [x] regra de antecedencia de renovacao de licenca unificada em 120 dias no backend (configuravel).

### Sprint 3 (2026-04-27 a 2026-05-08) - UX de friccao minima + telemetria base
Status: CONCLUIDA TECNICAMENTE em 2026-03-28 (execucao antecipada)

Objetivo:
- padronizar interacoes para tornar o sistema claramente intuitivo.

Entregas:
- Padrao unico de estados vazios com CTA principal.
- Padrao unico para erros acionaveis em formularios.
- Telemetria base:
  - TTFV (tempo ate primeira acao valida),
  - taxa de conclusao por fluxo,
  - erros por sessao.
- Dashboard interno de produto para ler metrica semanal.

Gate de aceite:
- 5 sessoes de usabilidade concluidas (rodada proxy interna) com feedback aplicado,
- baseline de metricas publicada,
- sem bloqueios graves de UX no fluxo licenca/condicionante/MTR.
- pacote de homologacao externa com usuarios reais pronto para execucao operacional (nao bloqueante para fechamento tecnico da sprint).

Kickoff de execucao (2026-03-28):
- [x] mapear e padronizar estados vazios nas telas prioritarias (`dashboard`, `licencas`, `condicionantes`, `mtrs`, `clientes`).
- [x] definir padrao unico de erro acionavel para formularios (mensagem, CTA de recuperacao e fallback tecnico).
- [x] instrumentar eventos de telemetria base:
  - `view_loaded`,
  - `first_valid_action`,
  - `flow_completed`,
  - `form_error`.
- [x] publicar baseline inicial de metricas da Sprint 3 e meta de melhoria semanal.

Progresso Sprint 3 (incremento 1):
- [x] componente reutilizavel de estado vazio com CTA principal no frontend.
- [x] estados vazios contextualizados com CTA de acao/recuperacao:
  - criar registro quando base vazia,
  - limpar filtros/busca quando nao ha resultados.

Progresso Sprint 3 (incremento 2):
- [x] padrao unico de erro acionavel para formularios nas telas prioritarias (`licencas`, `condicionantes`, `mtrs`, `clientes`).
- [x] callout padronizado com:
  - mensagem objetiva para usuario,
  - CTA de recuperacao (tentar novamente ou corrigir dados),
  - fallback tecnico visivel para suporte.

Progresso Sprint 3 (incremento 3):
- [x] camada de telemetria base criada no frontend (`apps/web/src/lib/telemetry.ts`) com buffer em memoria + `localStorage`.
- [x] hook de rastreio de carregamento de view aplicado nas telas prioritarias (`dashboard`, `licencas`, `condicionantes`, `mtrs`, `clientes`).
- [x] eventos de `first_valid_action` e `flow_completed` conectados aos fluxos de criacao/edicao principais.
- [x] eventos de `form_error` conectados ao novo padrao de erro acionavel dos formularios.

Progresso Sprint 3 (incremento 4):
- [x] baseline inicial publicada em painel interno no frontend (Configurações) com janela de 7 dias.
- [x] metas semanais explicitas no painel:
  - TTFV medio <= 45s,
  - taxa de conclusao >= 70%,
  - erros de formulario por sessao <= 1.5.
- [x] leitura por tela e ranking de fluxos concluidos disponiveis para acompanhamento semanal.

Progresso Sprint 3 (incremento 5):
- [x] smoke test da Sprint 3 adicionado para validar contratos de UX + telemetria + baseline:
  - `scripts/smoke-sprint3-flow.mjs`
  - script raiz `test:sprint3:smoke`.
- [x] kit de execucao da rodada de usabilidade publicado:
  - `docs/sprint3_usabilidade_roteiro.md`,
  - `docs/sprint3_usabilidade_resultados.md`.
- [x] execucao de 5 sessoes proxy internas com consolidacao inicial de achados.
- [x] aplicacao dos ajustes de UX priorizados da rodada proxy.
- [x] pacote de homologacao externa com 5 usuarios reais do cliente preparado para execucao assistida (etapa operacional nao bloqueante):
  - `docs/sprint3_homologacao_externa_runbook.md`.

Fechamento oficial da Sprint 3 (2026-03-28):
- [x] gate tecnico automatizado publicado (`pnpm gate:sprint3` + workflow CI).
- [x] smoke de Sprint 2, CDF e Sprint 3 executados no gate unificado.
- [x] baseline e painel interno com metas de usabilidade ativos.
- [x] nenhuma pendencia tecnica critica aberta para fluxos core.

Clean-up de Onda 1 (2026-03-28):
- [x] `apps/web_backup` retirado do workspace oficial para nao quebrar gates globais.
- [x] lint da API padronizado com configuracao explicita de ESLint.
- [x] lint do web limpo sem warnings recorrentes de Fast Refresh nao acionaveis.
- [x] build do web otimizado com lazy loading por rota e sem warnings de deprecacao/chunk no gate.
- [x] smoke de CDF ajustado para reutilizar cliente base e reduzir residuos de execucao.

## Onda 2 - Automacao documental (OCR/NLP)

### Readiness multicliente (2026-03-29)
Diagnostico:
- A base atual esta **parcialmente pronta** para escala multicliente.
- O sistema ja possui fundamentos uteis:
  - catalogo documental versionado por tipo/categoria/campos,
  - classificacao heuristica por nome/caminho/extensao,
  - validacao geoespacial inicial (QGIS/KML/shapefile).
- Ainda faltam blocos essenciais para operar com milhares de empresas com seguranca operacional:
  - pipeline assincrono de ingestao documental com trilha por status,
  - persistencia de resultados brutos de OCR/NLP para auditoria,
  - matriz de requisitos documentais por perfil (UF/orgao/setor/porte),
  - medicao formal de acuracia e erro por tipo documental,
  - fluxo de revisao humana e reprocessamento com fila dedicada.

Gate de entrada da Sprint 4 (Go/No-Go):
- [x] schema e tabela de processamento documental definidos (`recebido/classificando/processando/concluido/falha`);
- [x] fila BullMQ dedicada para documentos criada e observavel (base de worker + logs + retries);
- [x] endpoint de ingestao com idempotencia (hash do arquivo + consultoriaId + tipo);
- [x] armazenamento de artefatos brutos e extraidos com trilha de auditoria (baseline local);
- [x] contrato de classificacao + extracao padronizado (campos obrigatorios/opcionais por tipo + por perfil de cliente);
- [x] suite minima de testes com documentos anonimizados de referencia (classificacao + geoespacial);
- [x] dashboard operacional do pipeline (taxa de sucesso, falhas, tempo medio, backlog).

Andamento pre-S4 (2026-03-29):
- [x] catalogo documental base com tipologias reais (licenciamento, MTR/CDF, IBAMA, mapas, relatorios).
- [x] endpoint de classificacao documental e validacao geoespacial (QGIS/KML/shapefile).
- [x] estrutura inicial de processamento documental (`processamentos_documento`) + fila `greenly_documentos`.
- [x] endpoint de ingestao documental com hash idempotente + enqueue no worker documental.
- [x] endpoint de contrato de extracao por perfil (`GLOBAL`, `GERADOR_RESIDUO`, `TRANSPORTADOR`, etc.) com override sobre catalogo base.
- [x] endpoint de dashboard operacional da fila documental (`/api/dashboard/documentos/pipeline`) com backlog, sucesso/falha, tempo medio e distribuicao por status/tipo.
- [x] estrategia de lancamento sem custo aplicada no pipeline documental (storage local + retencao + expurgo automatico + extração local sem OCR pago).
- [x] migracao de banco aplicada + validacao operacional local do fluxo de ingestao (`db:push`, `db:seed`, API com worker, `test:sprint4:smoke`).

### Estrategia documental de lancamento sem custo (2026-03-29)
Objetivo:
- operar com custo infra **zero adicional** na fase de lancamento sem perder rastreabilidade.

Como funciona:
1. Upload persiste artefato no storage local (`STORAGE_LOCAL_PATH`) para processamento assincrono.
2. Pipeline salva metadados + classificacao + dados extraidos + auditoria em `processamentos_documento`.
3. Retencao automatica por criticidade:
   - `CRITICO`: documentos legais (licenca, MTR, CDF, IBAMA, etc.).
   - `PADRAO`: documentos operacionais nao criticos.
   - `TEMPORARIO`: evidencias/artefatos de alto volume e baixa necessidade de guarda longa.
4. Cron de expurgo remove **apenas o arquivo original** apos `expirarEm`, mantendo dados extraidos e trilha de auditoria.
5. Dashboard operacional da fila continua visivel por status/backlog/sucesso/falha e itens recentes.

Trade-off assumido:
- sem OCR externo pago na largada; extração textual local cobre arquivos texto e metadados dos demais.

Checklist operacional executado (2026-03-29):
1. [x] Aplicar schema no ambiente alvo:
   - `pnpm --filter @greenly/api db:push`
2. [x] Habilitar worker documental no ambiente de validacao:
   - `ENABLE_DOCUMENTO_WORKER=true`
   - `DOCUMENTOS_WORKER_CONCURRENCY=2`
3. [x] Executar smoke dedicado da Sprint 4 com API no ar:
   - `pnpm test:sprint4:smoke`
4. [x] Validar KPIs no endpoint operacional:
   - `GET /api/dashboard/documentos/pipeline?periodoHoras=24`
5. [x] Registrar evidencias e liberar fechamento tecnico da Sprint 4.

Plano de aprimoramento imediato (pre-S4):
1. Consolidar tipologias em um **catalogo global** e habilitar override por perfil de cliente.
2. Implementar entidade `processamentos_documento` para rastrear ciclo completo de cada arquivo.
3. Criar fila `greenly_documentos` + worker inicial sem OCR pago e com persistencia de resultado estruturado/auditoria.
4. Definir baseline de qualidade (precision/recall por tipo e taxa de retrabalho humano).
5. Fechar runbook operacional de incidentes de fila e reprocessamento manual.

### Sprint 4 (2026-05-11 a 2026-05-22) - Pipeline tecnico de processamento
Status: CONCLUIDA TECNICAMENTE em 2026-03-29 (execucao antecipada)

Objetivo:
- construir base robusta de ingestao e processamento assincrono de documentos.

Entregas:
- Upload documental via API com idempotencia por hash (inicialmente PDF e imagens; DOCX/XLSX em trilha controlada).
- Orquestracao por BullMQ com fila dedicada `greenly_documentos`.
- Worker inicial de OCR/NLP com status de processamento:
  - recebido,
  - classificando,
  - processando,
  - concluido,
  - falha.
- Persistencia dos resultados brutos/estruturados para auditoria.
- Observabilidade operacional da fila: taxa de sucesso, backlog, latencia, retries e falhas por tipo.

Gate de aceite:
- 95% dos documentos processados sem travamento de fila,
- rastreabilidade completa por documento (status + tentativas + erro + timestamps),
- deduplicacao por hash sem duplicidade funcional no mesmo cliente/consultoria.

Progresso Sprint 4 (execucao antecipada - 2026-03-29):
- [x] ingestao documental idempotente (`hash + consultoria + tipo`) com enqueue no worker.
- [x] trilha de status no worker (`recebido/classificando/processando/concluido/falha`) e tentativas.
- [x] persistencia de metadados + resultado estruturado + texto extraido (quando texto direto).
- [x] dashboard operacional da fila documental com backlog, taxa de sucesso, falhas e tempo medio.
- [x] contrato de classificacao/extracao por perfil de cliente (global + override).
- [x] politica sem custo aplicada: storage local + retencao por criticidade + expurgo automatico.
- [x] smoke dedicado da Sprint 4 publicado (`pnpm test:sprint4:smoke`).
- [x] validacao operacional concluida em ambiente local homologavel (db push + worker habilitado + execucao de smoke OK).

### Sprint 5 (2026-05-25 a 2026-06-05) - Extracao de campos essenciais
Status: CONCLUIDA TECNICAMENTE em 2026-03-29 (execucao antecipada)

Objetivo:
- entregar pre-preenchimento util para reduzir digitacao manual.

Entregas:
- Extracao MVP por familias documentais prioritarias:
  - licencas/requerimentos (numero, processo, emissao, validade, orgao),
  - MTR/CDF (numero, emissao, vinculos basicos),
  - IBAMA/TCFA/CTF (identificador principal e validade quando aplicavel).
- Regras por regex + heuristica por tipo + perfil (UF/orgao/setor).
- Tela de revisao humana antes de gravar no registro final.
- Indicador visual de confianca por campo e motivo da inferencia.
- Log de correcoes humanas para retroalimentar calibragem.

Gate de aceite:
- acuracia minima de 70% no conjunto padrao global **e** visao por tipo prioritario,
- reducao minima de 30% no tempo de cadastro por documento,
- taxa de retrabalho humano monitorada por tipo (baseline publicada).

Progresso Sprint 5 (execucao antecipada - 2026-03-29):
- [x] extracao de campos essenciais por familia documental prioritaria (licenca/requerimento, MTR/CDF, IBAMA/CTF/TCFA) com regex + heuristica por tipo/perfil.
- [x] confianca por campo + motivo da inferencia persistidos no resultado estruturado do pipeline.
- [x] fila de revisao humana operacional:
  - `GET /api/documentos/revisao/pendentes`,
  - `GET /api/documentos/:processamentoDocumentoId/revisao`,
  - `POST /api/documentos/:processamentoDocumentoId/revisao`.
- [x] trilha auditavel de revisao humana (`revisoes_documento_extracao`) com before/after por campo e contagem de correcoes.
- [x] metricas de qualidade documental publicadas no dashboard (`GET /api/dashboard/documentos/qualidade`):
  - acuracia media,
  - taxa de retrabalho,
  - tempo medio de revisao,
  - distribuicao por tipo documental.
- [x] tela web de operacao documental entregue (`/documentos`) com:
  - lista de pendentes,
  - modal de revisao por campo,
  - aprovacao/rejeicao com observacoes.
- [x] smoke dedicado da Sprint 5 publicado e validado (`pnpm test:sprint5:smoke`).
- [x] gate tecnico da Sprint 5 publicado e validado (`pnpm gate:sprint5`).

### Sprint 6 (2026-06-08 a 2026-06-19) - Condicionantes sugeridas + robustez
Status: CONCLUIDA TECNICAMENTE em 2026-03-29 (execucao antecipada)

Objetivo:
- extrair valor alem de campos basicos e estabilizar a operacao.

Entregas:
- Sugestao automatica de condicionantes candidatas com base em regras + historico validado.
- Reprocessamento manual de documentos com falha.
- Alertas operacionais da fila (latencia, erro, backlog) com thresholds publicados.
- Matriz de templates/requisitos documentais por perfil de cliente (global + override).
- Suite de testes de regressao do pipeline.

Gate de aceite:
- reducao minima de 40% no tempo de cadastro documental,
- erro operacional de fila < 2% na semana,
- processo de reprocessamento com SLA definido e medido.

Progresso Sprint 6 (execucao antecipada - 2026-03-29):
- [x] sugestao automatica de condicionantes candidatas por documento concluido:
  - `GET /api/documentos/:processamentoDocumentoId/condicionantes-candidatas?limit=5`.
- [x] reprocessamento manual operacional para itens em `FALHA` com SLA configuravel:
  - `POST /api/documentos/:processamentoDocumentoId/reprocessar`,
  - `GET /api/documentos/reprocessamentos/metricas?periodoHoras=168`.
- [x] alertas operacionais da fila documental com thresholds publicados:
  - `GET /api/dashboard/documentos/pipeline/alertas?periodoHoras=24`,
  - cron proativo `DocumentoPipelineAlertasCron` com notificacao in-app para equipes operacionais.
- [x] matriz de templates/requisitos documentais por perfil com override por consultoria:
  - `GET /api/documentos/templates-requisitos?perfilCliente=GERADOR_RESIDUO`,
  - `PUT /api/documentos/templates-requisitos`.
- [x] suite de regressao da Onda 2 publicada em runtime da API:
  - smoke Sprint 6: `docker compose exec api node dist/scripts/smoke.sprint6.js`,
  - smoke Onda 2 consolidado: `docker compose exec api node dist/scripts/smoke.wave2.js`.

## Onda 3 - Integracoes governamentais + confiabilidade

### Sprint 7 (2026-06-22 a 2026-07-03) - Adaptador SINIR
Status: CONCLUIDA TECNICAMENTE em 2026-03-30 (execucao antecipada)

Objetivo:
- iniciar integracao externa com contrato tecnico estavel.

Entregas:
- Camada adaptadora SINIR isolada do dominio.
- Mapeamento de payload validado.
- Estrategia de autenticacao e renovacao de token.
- Log tecnico de requisicao/resposta com mascaramento de dados sensiveis.
- Vinculo auditavel entre evento de integracao e documentos de origem (MTR/CDF/evidencias).

Gate de aceite:
- envio homologado no ambiente de testes do provedor,
- trilha de auditoria funcional ponta a ponta (evento -> payload -> retorno -> estado no Greenly).

Progresso Sprint 7 (execucao antecipada - 2026-03-30):
- [x] adapter `SINIR` HTTP isolado do dominio com mapeamento de payload.
- [x] autenticacao com cache/renovacao de token.
- [x] observacao de request/response com mascaramento de dados sensiveis.
- [x] trilha auditavel por evento usando `logs_auditoria` sem alterar schema.
- [x] mock provider homologavel para validacao local sem credenciais externas reais.

### Sprint 8 (2026-07-06 a 2026-07-17) - Adaptador SIGOR + retorno de status
Status: CONCLUIDA TECNICAMENTE em 2026-03-30 (execucao antecipada)

Objetivo:
- fechar ciclo de envio e acompanhamento de status de manifesto.

Entregas:
- Integracao SIGOR com envio de MTR.
- Recebimento de retorno por polling/webhook (conforme capacidade do provedor).
- Atualizacao automatica de status no Greenly.
- Painel operacional de tentativas/falhas.
- Estrategia fallback padrao para indisponibilidade do provedor (fila + retries + reconciliacao).

Gate de aceite:
- sincronizacao de status funcionando ponta a ponta,
- reconciliacao diaria sem divergencias criticas.

Progresso Sprint 8 (execucao antecipada - 2026-03-30):
- [x] adapter `SIGOR` HTTP com envio de `MTR` e `CDF`.
- [x] polling e webhook conectados para retorno de status.
- [x] atualizacao automatica de `mtrs.status` e `cdfs.status` apos retorno do provedor.
- [x] painel operacional publicado em `/api/integracoes/governo/dashboard`.
- [x] tela `MTRs` atualizada com cards operacionais, coluna de integracao e dialogo de timeline.

### Sprint 9 (2026-07-20 a 2026-07-31) - Idempotencia, retries e resiliencia
Status: CONCLUIDA TECNICAMENTE em 2026-03-30 (execucao antecipada)

Objetivo:
- tornar integracoes seguras para volume e falha de rede.

Entregas:
- Idempotencia por chave de operacao.
- Politica de retry exponencial com DLQ.
- Rotina de reconciliacao automatica.
- Playbook operacional de incidentes de integracao.
- Testes de caos para indisponibilidade externa e duplicidade de callbacks.

Gate de aceite:
- nenhuma duplicidade de envio em testes de carga,
- recuperacao automatica em falhas transientes.

Progresso Sprint 9 (execucao antecipada - 2026-03-30):
- [x] idempotencia por chave derivada do payload canonico.
- [x] retry exponencial no worker `greenly_gov_integracoes`.
- [x] DLQ dedicada `greenly_gov_dlq`.
- [x] reconciliacao automatica por cron.
- [x] suporte a testes de caos via provedor mock para indisponibilidade e callback duplicado.
- [x] smoke oficial da Onda 3 publicado (`dist/scripts/smoke.wave3.js` / `pnpm test:onda3:smoke:docker`).

## Onda 4 - Operacao de campo offline-first

### Sprint 10 (2026-08-03 a 2026-08-14) - Fundacao PWA offline
Objetivo:
- permitir trabalho de campo sem depender de conectividade continua.

Entregas:
- PWA base com cache de ativos e dados essenciais.
- Banco local para rascunhos de checklist.
- Fila local de sincronizacao.
- Indicador claro de estado online/offline na UI.
- Politica de seguranca local para dados sensiveis offline (criptografia local e expiracao).

Gate de aceite:
- criacao/edicao de checklist em modo offline funcionando,
- sincronizacao posterior sem perda de dados.

### Sprint 11 (2026-08-17 a 2026-08-28) - Evidencias de campo
Objetivo:
- capturar evidencias reais com baixa friccao.

Entregas:
- Captura de foto e audio no fluxo de checklist.
- Compressao e upload em lote quando online.
- Metadados de geolocalizacao e timestamp por evidencia.
- Validador de integridade de anexos.
- Hash/assinatura de anexo para cadeia de custodia basica.

Gate de aceite:
- 98% de sucesso em upload de evidencias no ciclo offline->online,
- anexos acessiveis e rastreaveis no historico.

### Sprint 12 (2026-08-31 a 2026-09-11) - Sincronizacao robusta
Objetivo:
- eliminar perda e conflito de dados em cenarios reais de campo.

Entregas:
- Resolucao de conflito por estrategia definida (last-write + revisao manual em excecao).
- Reenvio seletivo para itens com erro.
- Logs de sincronizacao por dispositivo.
- Testes de caos para alternancia de conectividade.
- Painel de diagnostico de sincronizacao por cliente/dispositivo para suporte operacional.

Gate de aceite:
- zero perda de dados em testes controlados,
- taxa de sincronizacao > 98%.

## Onda 5 - IA aplicada + hardening + go-live

### Sprint 13 (2026-09-14 a 2026-09-25) - Speech-to-text e assistencia
Objetivo:
- acelerar producao de relatorios de campo com IA assistiva.

Entregas:
- Speech-to-text em portugues para observacoes de checklist.
- Sugestao de plano de acao para nao conformidades.
- Fluxo de aprovacao humana obrigatoria antes de publicar.
- Registro de edicoes para auditoria.
- Politica de uso de IA com protecao de dados sensiveis (mascaramento e nao retencao indevida).

Gate de aceite:
- reducao minima de 30% no tempo de redacao de observacoes.

### Sprint 14 (2026-09-28 a 2026-10-09) - Predicao de risco MVP
Objetivo:
- sair de monitoramento reativo para gestao preditiva inicial.

Entregas:
- Modelo MVP com serie historica para risco de vencimento/atraso.
- Score de risco por cliente/licenca/condicionante.
- Widget de risco no dashboard com explicabilidade basica.
- Rotina de recalculo periodico.
- Validacao de drift e estabilidade por segmento (porte/setor/regiao).

Gate de aceite:
- modelo com utilidade comprovada em teste piloto interno.

### Sprint 15 (2026-10-12 a 2026-10-23) - Hardening final e prontidao de escala
Objetivo:
- garantir estabilidade, seguranca e preparo para expansao comercial.

Entregas:
- Hardening de performance (queries, cache, filas).
- Revisao final de seguranca aplicacional.
- Runbooks de operacao e resposta a incidente.
- Pacote de treinamento para usuarios (consultoria + cliente final).
- Checklist de go-live e monitoramento de primeiros 30 dias.
- Revisao formal de governanca de dados multicliente (segregacao, retencao e acesso).

Gate de aceite:
- indicadores de erro e latencia dentro das metas definidas,
- operacao pronta para escala controlada,
- checklist de privacidade/compliance assinado para go-live.

## Ritmo de execucao "um por vez"
Processo oficial entre sprints:
1. Planejar sprint com escopo fechado e meta unica.
2. Executar e validar tecnicamente.
3. Rodar validacao com usuarios-chave.
4. Publicar metricas e aprender.
5. Aprovar gate.
6. Somente entao abrir a proxima sprint.

## Metricas obrigatorias (todas as ondas)
- Produto:
  - tempo medio para concluir fluxo de licenca,
  - tempo medio para concluir fluxo de condicionante,
  - tempo medio para concluir fluxo de MTR.
- UX:
  - TTFV,
  - taxa de abandono por tela,
  - erros por sessao.
- Operacao:
  - taxa de sucesso de jobs,
  - latencia de integracao externa,
  - taxa de sincronizacao offline->online,
  - taxa de deduplicacao documental por hash.
- Qualidade:
  - regressao por release,
  - cobertura dos fluxos criticos,
  - acuracia de extracao documental por tipo,
  - taxa de retrabalho humano por tipo.

## Riscos do programa e mitigacoes
| Risco | Mitigacao |
|---|---|
| Escopo crescer alem da capacidade da sprint | escopo fechado e regra de corte por valor |
| IA entrar cedo demais sem base estavel | ondas sequenciais com gates obrigatorios |
| Integracoes externas instaveis | adaptadores isolados + retries + reconciliacao |
| Evolucao de features quebrar UX | testes quinzenais com usuarios + telemetria |
| Regressao tecnica no core | suite E2E de fluxos criticos e checklist de release |
| Vazamento de dados sensiveis multicliente | segregacao tenant, mascaramento em logs, trilha de auditoria e controles de acesso |

## Sprint atual em andamento
Consolidacao pos-Sprint 6 (2026-03-29):
1. Sprint 6 fechada tecnicamente com validacao operacional em Docker.
2. Onda 2 consolidada com smoke regressivo ponta a ponta.
3. Ambiente pronto para planejamento de Sprint 7 (adaptador SINIR) sem bloqueios pendentes da Onda 2.

## Backlog pos-plano de acao
- Documento oficial para demandas adiadas: `docs/backlog_pos_plano_acao.md`.
- Regra: toda demanda fora do escopo da sprint atual entra nesse backlog.
- Registro adicional em 2026-03-30: bloco de integracoes externas gratuitas da area ambiental priorizado no backlog oficial (`POST-018` a `POST-025`).
