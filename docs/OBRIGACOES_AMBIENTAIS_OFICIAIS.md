# Obrigações Ambientais Oficiais (IBAMA, SINIR e IAT)

Atualizado em: 04/04/2026

## Objetivo

Consolidar, em um único documento técnico, o padrão oficial implementado no Greenly para:

- mapeamento de obrigações ambientais por módulo;
- regras de prazo e periodicidade;
- canais oficiais de emissão;
- contratos/API/backend/frontend envolvidos.

## Escopo implementado

### Módulos no produto

- `IBAMA`
- `RESIDUOS` (SINIR)
- `EMISSOES_ATMOSFERICAS`
- `IAT`

### Tipos de obrigação suportados

- `IBAMA_CTF`
- `IBAMA_TCFA`
- `IBAMA_RAPP`
- `SINIR_INVENTARIO_NACIONAL`
- `SINIR_DMR`
- `GEE_INVENTARIO`
- `IAT_INVENTARIO_RESIDUOS_INDUSTRIAIS`
- `IAT_DECLARACAO_CARGA_POLUIDORA`
- `IAT_DECLARACAO_EMISSOES_ATMOSFERICAS`
- `OUTRA`

## Regras oficiais adotadas

## 1) IBAMA

### CTF/APP e Certificado de Regularidade (`IBAMA_CTF`)

- Natureza: obrigação contínua/sob demanda.
- Implementação no Greenly: `periodicidade = SOB_DEMANDA`.
- Regra operacional adotada: manutenção cadastral contínua + emissão do certificado quando necessário.
- Observação registrada no catálogo: certificado com validade trimestral.

### RAPP (`IBAMA_RAPP`)

- Periodicidade: anual.
- Janela oficial de envio: de 1º de fevereiro a 31 de março, com dados do ano anterior.
- Implementação no Greenly: data de referência `31/03` do ano de competência.

### TCFA (`IBAMA_TCFA`)

- Periodicidade: trimestral.
- Regra oficial de vencimento: até o 5º dia útil do mês subsequente ao trimestre.
- Implementação no Greenly:
  - 1º trimestre: 5º dia útil de abril;
  - 2º trimestre: 5º dia útil de julho;
  - 3º trimestre: 5º dia útil de outubro;
  - 4º trimestre: 5º dia útil de janeiro do ano seguinte.

## 2) SINIR / Resíduos

### Inventário Nacional (`SINIR_INVENTARIO_NACIONAL`)

- Periodicidade: anual.
- Regra oficial: envio até 31 de março de cada ano (ano-base anterior).
- Implementação no Greenly: data de referência `31/03`.

### DMR (`SINIR_DMR`)

- Periodicidade: trimestral.
- Janelas oficiais do serviço:
  - referência 1º trimestre: 01 a 30 de abril;
  - referência 2º trimestre: 01 a 31 de julho;
  - referência 3º trimestre: 01 a 31 de outubro;
  - referência 4º trimestre: 01 a 31 de janeiro do ano seguinte.
- Implementação no Greenly: data-limite de referência no último dia de cada janela.

## 3) Emissões Atmosféricas (GEE)

### Inventário de GEE (`GEE_INVENTARIO`)

- Natureza: condicional (varia por setor, contrato, exigência regulatória e licenciamento).
- Implementação no Greenly:
  - `obrigatoriedade = CONDICIONAL`;
  - prazo configurável conforme exigência do cliente/estado/licença;
  - referência de portal: Registro Público de Emissões (GHG Protocol Brasil).

## 4) IAT (Paraná)

### Inventário de Resíduos Industriais (`IAT_INVENTARIO_RESIDUOS_INDUSTRIAIS`)

- Regra operacional oficial adotada no catálogo: envio a cada 12 meses contados da emissão da licença para operar.
- Implementação no Greenly: anual com observação de prazo por licença.

### Declaração de Carga Poluidora (`IAT_DECLARACAO_CARGA_POLUIDORA`)

- Periodicidade: anual.
- Regra oficial adotada: envio anual até 31 de março.
- Implementação no Greenly: data de referência `31/03`.

### Declaração de Emissões Atmosféricas - DEA (`IAT_DECLARACAO_EMISSOES_ATMOSFERICAS`)

- Periodicidade: anual.
- Regra oficial adotada: declaração anual no sistema DEA/SGA.
- Implementação no Greenly: anual, sem data fixa única (janela conforme sistema/licença).

## Arquitetura técnica aplicada

## Contratos compartilhados

Arquivo: `packages/shared/src/contracts.ts`

Principais itens adicionados:

- enums de módulo, tipo, status e periodicidade de obrigação;
- enum de obrigatoriedade (`OBRIGATORIA`, `CONDICIONAL`, `VOLUNTARIA`);
- schemas/DTOs de CRUD e filtros;
- schema/DTO para listagem de padrões oficiais:
  - `ListarPadroesObrigacoesAmbientaisQuerySchema`
  - `ObrigacaoAmbientalPadraoOficialDTO`

## Banco de dados

Tabela: `legal.obrigacoes_ambientais`

Arquivo de schema:

- `apps/api/src/db/schema/obrigacoes.ts`

Migração:

- `apps/api/drizzle/0001_environmental_obligations.sql`

## Backend/API

Módulo:

- `apps/api/src/modules/obrigacao-ambiental/`

Endpoint novo de referência oficial:

- `GET /api/obrigacoes-ambientais/padroes-oficiais?modulo=<...>&ano=<...>`

Endpoints já existentes:

- `GET /api/obrigacoes-ambientais`
- `GET /api/obrigacoes-ambientais/resumo-modulos`
- `POST /api/obrigacoes-ambientais`
- `PATCH /api/obrigacoes-ambientais/:id`
- `POST /api/obrigacoes-ambientais/clientes/:clienteId/inicializar-padrao`

## Frontend

Arquivos principais:

- `apps/web/src/features/obrigacoes-ambientais/components/ObrigacoesAmbientaisModulePage.tsx`
- `apps/web/src/features/obrigacoes-ambientais/services/obrigacaoAmbientalService.ts`

Comportamento:

- cada módulo exibe uma grade de `Padrão oficial` com:
  - periodicidade;
  - competência;
  - regra de prazo;
  - data de referência;
  - portal oficial;
  - fonte normativa.
- botão de inicialização usa o catálogo padronizado do backend.

## Ajuste adicional solicitado (MTR)

Mudança aplicada no domínio de resíduos:

- `fonteGeradoraId` (ponto de geração) passou a ser opcional na emissão/edição de MTR.

Arquivos principais:

- `packages/shared/src/contracts.ts`
- `packages/shared/src/types/mtr.types.ts`
- `apps/api/src/modules/residuo/residuo.service.ts`
- `apps/web/src/pages/MTRsPage.tsx`

## Fontes oficiais utilizadas

- IBAMA - CTF/APP: https://www.gov.br/ibama/pt-br/servicos/cadastros/ctf/ctf-app/ctf-app
- IBAMA - Certificado de Regularidade: https://www.gov.br/ibama/pt-br/servicos/cadastros/ctf/certificado-de-regularidade
- IBAMA - RAPP: https://www.gov.br/ibama/pt-br/servicos/relatorios/atividades-poluidoras
- IBAMA - TCFA: https://www.gov.br/ibama/pt-br/servicos/taxas/tcfa/sobre-a-tcfa
- SINIR - DMR (serviço gov.br): https://www.gov.br/pt-br/servicos/obter-a-declaracao-de-movimentacao-de-residuos-dmr?id=13359&origem=servico
- SINIR - Inventário Nacional (serviço gov.br): https://www.gov.br/pt-br/servicos/declarar-informacoes-sobre-o-inventario-nacional-de-residuos-solidos?id=13353&origem=servico
- Portaria MMA nº 280/2020 (DOU): https://www.in.gov.br/en/web/dou/-/portaria-n-280-de-29-de-junho-de-2020-264244199
- IAT - Efluentes líquidos: https://www.iat.pr.gov.br/Pagina/Efluentes-Liquidos
- IAT - Resíduos sólidos: https://www.iat.pr.gov.br/Pagina/Residuos-Solidos
- IAT - Automonitoramento / DEA: https://www.iat.pr.gov.br/Pagina/Automonitoramento-de-atividades-potencialmente-poluidoras

## Nota importante

Este documento registra a implementação técnica e as referências oficiais usadas no produto. Para casos específicos de enquadramento jurídico-regulatório, validar sempre com responsável técnico/legal da operação.
