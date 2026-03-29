# Sprint 5 - Extracao de Campos e Revisao Humana

Data de fechamento tecnico: 2026-03-29

## Objetivo
Entregar extracao de campos essenciais com revisao humana assistida, para reduzir digitacao manual sem perder controle de qualidade e auditoria multicliente.

## Escopo entregue
- Extracao estruturada por tipo documental e perfil de cliente (`GLOBAL`, `GERADOR_RESIDUO`, `TRANSPORTADOR`, `DESTINADOR`, `PRESTADOR_SERVICO`).
- Campos extraidos com metadados de confianca por campo (`valor`, `confianca`, `motivo`, `origem`, `obrigatorio`).
- Fila de revisao humana com status e trilha auditavel.
- Registro de correcoes humanas para calibragem de regras.
- Dashboard de qualidade documental por periodo e por tipo.
- Tela web `/documentos` para operacao da revisao fim a fim.

## Fluxo operacional fim a fim
1. Documento entra por `POST /api/documentos/ingestao`.
2. Worker processa classificacao + extracao e persiste resultado em `processamentos_documento`.
3. Documento concluido entra como `PENDENTE_REVISAO`.
4. Operador lista pendentes em `GET /api/documentos/revisao/pendentes`.
5. Operador abre detalhe por documento em `GET /api/documentos/:processamentoDocumentoId/revisao`.
6. Operador ajusta campos e envia decisao em `POST /api/documentos/:processamentoDocumentoId/revisao`.
7. Sistema grava before/after, acuracia e retrabalho em `revisoes_documento_extracao`.
8. Dashboard le metricas em `GET /api/dashboard/documentos/qualidade`.

## Contratos e endpoints
- `GET /api/documentos/revisao/pendentes`
  - filtros: `statusRevisao`, `busca`, `tipoDocumento`, `clienteId`, `limit`.
- `GET /api/documentos/:processamentoDocumentoId/revisao`
  - retorno: status do processamento, status da revisao, campos extraidos e sinais de confianca.
- `POST /api/documentos/:processamentoDocumentoId/revisao`
  - payload: `statusRevisao`, `campos[]`, `observacoes`, `tempoRevisaoSegundos`.
- `GET /api/dashboard/documentos/qualidade?periodoDias=30`
  - retorno: revisados total, aprovados (com/sem ajuste), rejeitados, acuracia media, taxa de retrabalho, tempo medio, distribuicao por tipo.

## Persistencia e auditoria
- `processamentos_documento`
  - novos campos: `perfilCliente`, `confiancaExtracaoPct`, `revisaoStatus`, `revisadoEm`, `revisadoPorId`.
- `revisoes_documento_extracao`
  - guarda status final, contagem de correcoes, acuracia, duracao da revisao, snapshot antes/depois e observacoes.

## Regras de qualidade
- `APROVADO_SEM_AJUSTES` nao pode ser aceito quando houver campos corrigidos.
- `APROVADO_COM_AJUSTES` e normalizado para `APROVADO_SEM_AJUSTES` quando nao houver correcao.
- Baseline de qualidade fica visivel por tipo e periodo para orientar calibragem de regras.

## Seguranca e privacidade
- Nenhum dado sensivel de cliente deve aparecer em docs, logs de erro ou scripts versionados.
- Testes e smokes usam amostras sinteticas/anonimizadas.
- O modelo sem custo continua: manter auditoria e expurgar arquivo original conforme retencao.

## Evidencias de validacao
1. Gate tecnico da Sprint 5 executado:
- `pnpm gate:sprint5`

2. Smoke tecnico da Sprint 5 executado:
- `pnpm test:sprint5:smoke`

3. Validacao operacional com stack local:
- `docker compose up -d postgres redis mailhog`
- `pnpm --filter @greenly/api db:push`
- `pnpm --filter @greenly/api db:seed`
- `ENABLE_DOCUMENTO_WORKER=true pnpm --filter @greenly/api dev`
- `pnpm test:sprint4:smoke`
- `pnpm test:sprint5:smoke`

## Resultado da sprint
Sprint 5 fechada tecnicamente com extracao assistida por revisao humana, medicao de qualidade por tipo e trilha auditavel pronta para escala multicliente.
