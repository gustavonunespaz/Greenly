# Operacao do Pipeline Documental Sem Custo

Data de referencia: 2026-03-29

## Objetivo
Padronizar como o Greenly processa documentos de clientes no lancamento, com **custo extra zero** e com trilha de auditoria completa para ambiente multicliente.

Este documento explica o funcionamento tecnico que estamos aplicando agora (Sprint 4 e Sprint 5), os limites assumidos e como operar com seguranca.

## Principios
- Multiempresa por padrao: Aludrol e apenas uma referencia de padrao documental, nao uma dependencia do sistema.
- Seguranca primeiro: documentos reais de clientes sao dados sensiveis e nao devem ser expostos em logs, codigo ou documentacao publica.
- Escala progressiva: no lancamento, guardar estrutura e auditoria; otimizar custo e armazenamento de originais com retencao + expurgo.
- QGIS e opcional: validacao geoespacial existe, mas so entra quando o caso exigir mapa/camada/area.

## Como o pipeline funciona (fim a fim)
1. **Ingestao** (`POST /api/documentos/ingestao`)
- Upload em `multipart/form-data` no campo `arquivo`.
- Classificacao inicial por heuristica (nome, extensao, contexto).
- Hash SHA-256 do arquivo para idempotencia por `consultoriaId + tipo + hash`.

2. **Persistencia inicial** (`processamentos_documento`)
- Guarda metadados do arquivo, classificacao, tipo/categoria declarados e status inicial.
- Define politica de retencao por criticidade (critico/padrao/temporario).
- Salva arquivo original em storage local (`STORAGE_LOCAL_PATH`) para processamento assincrono.

3. **Fila assincrona** (`greenly_documentos`)
- Job e enfileirado com retries e trilha por tentativa.
- Status de processamento:
  - `RECEBIDO`
  - `CLASSIFICANDO`
  - `PROCESSANDO`
  - `CONCLUIDO`
  - `FALHA`

4. **Worker documental**
- Recupera arquivo do storage local.
- Executa extracao local sem OCR pago:
  - texto direto para tipos textuais,
  - fallback binario sem OCR para PDF/imagem nao textual.
- Atualiza `resultadoEstruturadoJson`, `textoExtraidoBruto`, tentativas, erro e timestamps.

5. **Revisao humana (Sprint 5)**
- `GET /api/documentos/revisao/pendentes`
- `GET /api/documentos/:processamentoDocumentoId/revisao`
- `POST /api/documentos/:processamentoDocumentoId/revisao`
- Operador valida/corrige campos extraidos antes do uso final.
- Correcao humana e persistida com trilha before/after para auditoria.

6. **Dashboard operacional**
- `GET /api/dashboard/documentos/pipeline`
- `GET /api/dashboard/documentos/pipeline/itens`
- Exibe backlog, taxa de sucesso/falha, tempo medio e distribuicao por status/tipo.

7. **Dashboard de qualidade documental (Sprint 5)**
- `GET /api/dashboard/documentos/qualidade?periodoDias=30`
- Exibe revisados, acuracia media, retrabalho, tempo medio de revisao e distribuicao por tipo.

8. **Retencao e expurgo automatico**
- `DocumentoRetentionCron` remove **somente arquivo original** quando `expirarEm` chega.
- Mantemos dados extraidos, metadados e historico para auditoria.

## Politica de armazenamento (lancamento sem custo)
### O que fica no banco
- metadados do processamento;
- classificacao e campos extraidos;
- status e historico de tentativas;
- trilha temporal (`recebidoEm`, `iniciadoEm`, `concluidoEm`, `atualizadoEm`);
- erro da ultima tentativa, quando houver.

### O que pode ser removido
- arquivo original no storage local apos expiracao de retencao.

### Retencao padrao
- `CRITICO`: 1825 dias
- `PADRAO`: 90 dias
- `TEMPORARIO`: 30 dias

## Configuracao principal (`apps/api/.env`)
- `DOCUMENTOS_MODO_SEM_CUSTO=true`
- `ENABLE_DOCUMENTO_WORKER=true`
- `DOCUMENTOS_WORKER_CONCURRENCY=2`
- `DOCUMENTOS_RETENCAO_CRITICO_DIAS=1825`
- `DOCUMENTOS_RETENCAO_PADRAO_DIAS=90`
- `DOCUMENTOS_RETENCAO_TEMPORARIO_DIAS=30`
- `DOCUMENTOS_EXPURGO_HABILITADO=true`
- `DOCUMENTOS_EXPURGO_CRON="15 1 * * *"`
- `DOCUMENTOS_EXPURGO_BATCH_SIZE=200`
- `STORAGE_LOCAL_PATH=./uploads`

## Regras de seguranca e privacidade
- Nunca versionar documentos reais de clientes no repositiorio.
- Nunca copiar conteudo sensivel de documentos para tickets, commits ou docs publicas.
- Logs devem priorizar IDs tecnicos (processamento, consultoria, cliente) e nao conteudo bruto.
- Uso de amostras anonimizadas para testes e homologacao tecnica.
- Em expurgo, remover apenas original; manter auditoria e dados estruturados necessarios.

## Limites assumidos no modo sem custo
- Sem OCR externo pago no lancamento: PDF/imagem escaneada pode exigir revisao humana.
- Extração local cobre melhor arquivos com texto selecionavel.
- Quando volume ou qualidade exigirem, evoluimos para OCR/NLP especializado (Sprint 6+).

## Evidencias de validacao (2026-03-29)
1. Gate tecnico pre-Sprint 4 executado com sucesso:
- `pnpm gate:pre-sprint4`

2. Validacao operacional fim a fim da Sprint 4 executada com sucesso:
- Infra local: `docker compose up -d postgres redis mailhog`
- DB/seed: `pnpm --filter @greenly/api db:push` e `pnpm --filter @greenly/api db:seed`
- API com worker: `ENABLE_DOCUMENTO_WORKER=true pnpm --filter @greenly/api dev`
- Smoke: `pnpm test:sprint4:smoke`
- Resultado: `SMOKE SPRINT 4 DOCUMENTOS: OK`

3. Validacao operacional fim a fim da Sprint 5 executada com sucesso:
- API com worker: `ENABLE_DOCUMENTO_WORKER=true pnpm --filter @greenly/api dev`
- Smoke revisao humana e qualidade: `pnpm test:sprint5:smoke`
- Resultado: `SMOKE SPRINT 5 REVISAO DOCUMENTAL: OK`

## Decisao para o lancamento
Para entrar rapido no mercado sem custo adicional de infraestrutura documental:
- **sim** para extrair + estruturar + padronizar + permitir download de documento gerado;
- **sim** para armazenar original por janela curta (retencao) e expurgar automaticamente;
- **nao** para guardar indefinidamente todos os originais de todos os clientes.

Este modelo equilibra custo, rastreabilidade e escala multicliente.
