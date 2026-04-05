# Playbook de Integracao com Orgaos Ambientais

Data de referencia: 04/04/2026.

## Objetivo

Definir, de forma executavel, como conectar clientes da Greenly aos sistemas de orgaos ambientais usando:

- API oficial quando existir;
- fluxo assistido (portal + comprovacao) quando nao existir API publica para privados.

## Matriz por modulo

| Modulo no produto | Canal oficial identificado | Status de API oficial para uso corporativo privado | Decisao recomendada |
| --- | --- | --- | --- |
| SIGOR MTR (SP/CETESB) | Web Service SIGOR-MTR | Disponivel e documentada (homologacao + producao + token + operacoes MTR/CDF) | Integracao API completa |
| SINIR MTR/DMR/CDF | Portal MTR SINIR + portal-api.sinir.gov.br | Evidencia oficial de integracao (perfil "Usuario API") para operacao em nome de terceiros | Integracao API guiada por habilitacao oficial do cliente |
| IBAMA CTF/TCFA/RAPP | Portal de Servicos IBAMA | Nao identificada documentacao publica de API transacional aberta para privados | Fluxo assistido via portal + governanca de evidencias |
| IAT (PR) declaracoes anuais | Portais e sistemas de declaracao | Nao identificada API publica claramente documentada para este fluxo | Fluxo assistido via portal + governanca de evidencias |
| Inventarios/GEE em portais de declaracao | Portais especificos | Varia por orgao/programa, sem padrao unico de API publica | Integracao por conectores especificos quando houver API; fallback assistido |

## Fontes oficiais usadas nesta avaliacao

- SIGOR Web Service: https://cetesb.sp.gov.br/sigor-mtr/web-service/
- Manual Web Service SIGOR-MTR: https://cetesb.sp.gov.br/sigor-mtr/wp-content/uploads/sites/38/2021/03/SIGOR-MTR-Manual-de-Integracao-Web-Service.pdf
- SINIR MTR (pagina oficial): https://sinir.gov.br/sistemas/mtr
- Manual MTR Logistica Reversa (com "Usuario API"): https://portal-api.sinir.gov.br/wp-content/uploads/2022/12/MTR-LR-Manual-do-Usua%CC%81rio_atualizado.pdf
- RAPP IBAMA (servico oficial): https://www.gov.br/ibama/pt-br/servicos/relatorios/atividades-poluidoras
- TCFA IBAMA (servico oficial): https://www.gov.br/ibama/pt-br/servicos/taxas/tcfa
- ACTs CTF/APP IBAMA (integracao federativa): https://www.gov.br/ibama/pt-br/servicos/cadastros/ctf/ctf-app/acts
- Catalogo Conecta gov.br (ambiental): https://www.gov.br/conecta/catalogo/apis
- Tema ambiental no Conecta: https://www.gov.br/conecta/catalogo/sistemas/ambiental

## O que ja existe no backend Greenly

1. Camada de integracao gov com MTR/CDF:
   - Rotas: `apps/api/src/modules/integracao-governo/routes.ts`
   - Envio/reconciliacao: `apps/api/src/modules/integracao-governo/service.ts`
   - Adaptadores SINIR/SIGOR: `apps/api/src/modules/integracao-governo/adapters/`
2. Configuracao por provider com fallback para mock:
   - `apps/api/src/shared/config/integracoes-governo.ts`
3. Modelo de parceiros com habilitacao por sistema:
   - `parceiros.sinirHabilitado`, `parceiros.sigorHabilitado`, `sinirCadastroId`, `sigorCadastroId`
   - arquivo: `apps/api/src/db/schema/operacional.ts`
4. Vinculo cliente-parceiro com escolha de sistema:
   - `cliente_parceiros.sistemaIntegracao`, `codigoCadastroExterno`
   - arquivo: `apps/api/src/db/schema/operacional.ts`

## Limite atual (principal gap)

Hoje o sistema habilita parceiro por flags/cadastro, mas nao guarda credencial segregada por cliente/empresa para autenticacao externa (token/senha/chave por tenant) em cofre dedicado.

Sem isso, a operacao em escala fica limitada para "cada cliente opera com sua propria identidade oficial".

## Como integrar "do jeito certo" para o cliente operar por aqui

## Fase 1 - Onboarding de credenciais e habilitacao oficial

Para cada cliente (tenant):

1. Definir sistema-alvo por fluxo:
   - MTR/CDF SP: SIGOR
   - MTR/CDF nacional/logistica reversa: SINIR
2. No orgao, concluir cadastro oficial:
   - CNPJ/empreendimento/unidade/usuario;
   - permissao para operacao via API (quando aplicavel);
   - validacao de licencas obrigatorias.
3. Coletar artefatos de integracao:
   - identificador de unidade/cadastro externo;
   - credencial de autenticacao (usuario/senha/token/chave conforme orgao);
   - ambiente (homolog/producao).
4. Salvar no Greenly:
   - parceiro habilitado (`sinirHabilitado`/`sigorHabilitado`);
   - cadastro externo (`sinirCadastroId`/`sigorCadastroId`);
   - vinculo cliente-parceiro com `sistemaIntegracao` correto.

## Fase 2 - Credenciais por tenant (obrigatorio para producao robusta)

Implementar armazenamento seguro de credenciais por consultoria/cliente:

1. Nova entidade (exemplo): `gov_credentials`
   - `consultoriaId`, `clienteId` (opcional), `system` (`SINIR`/`SIGOR`), `ambiente`;
   - `authMode`, `credentialCiphertext`, `rotatedAt`, `expiresAt`, `ativo`.
2. Criptografia em repouso:
   - envelope encryption (KMS/secret manager) ou cifra simetrica com chave gerenciada.
3. Leitura em runtime:
   - adaptador busca credencial pelo tenant da operacao.
4. Rotacao e auditoria:
   - trilha de quem atualizou, quando e para qual sistema.

## Fase 3 - Fluxo operacional no produto

1. Usuario cria MTR/CDF no Greenly (`/api/residuos/...`).
2. Greenly valida elegibilidade do par de parceiros (mesmo sistema e habilitados).
3. Greenly enfileira envio gov com idempotencia.
4. Worker envia ao orgao e grava protocolo/status externo.
5. Reconciliacao por polling/webhook.
6. Painel mostra:
   - `ENFILEIRADO`, `PROCESSANDO`, `AGUARDANDO_RECONCILIACAO`, `SINCRONIZADO`, `ERRO`.

## Fase 4 - Modulos sem API publica

Para IBAMA/IAT sem API aberta comprovada:

1. Fluxo assistido por tarefa:
   - abrir portal oficial;
   - preencher/emitir no portal;
   - anexar comprovante/protocolo no Greenly.
2. Checklist de conformidade por obrigacao:
   - prazo, responsavel, base legal, comprovante.
3. Automacao opcional:
   - apenas quando juridicamente aprovada e tecnicamente estavel.

## Regras de arquitetura recomendadas

1. Sempre operar com identidade oficial do cliente.
2. Segregar credencial por tenant e por sistema.
3. Nao compartilhar token entre clientes.
4. Usar idempotencia em todas as operacoes de emissao/cancelamento.
5. Registrar request/response mascarados para auditoria.
6. Ter fallback manual para indisponibilidade de orgao.

## Checklist de entrada de um novo cliente

1. Definiu escopo geográfico (UF/federal) e modulos.
2. Cliente possui cadastro ativo no orgao alvo.
3. Cliente liberou perfil de integracao (ex.: Usuario API no SINIR quando aplicavel).
4. Credenciais validadas em homologacao.
5. Parceiros vinculados com `sistemaIntegracao` correto.
6. Teste de ponta a ponta aprovado (emitir, consultar, reconciliar).
7. Go-live com monitoramento de fila e alertas.

## Backlog tecnico sugerido (prioridade)

P0:

1. Cofre de credenciais por tenant (`gov_credentials`).
2. UI de onboarding de credenciais por sistema.
3. Validacao automatica de credencial (health-check por orgao).

P1:

1. Modo assistido IBAMA/IAT com coleta estruturada de comprovantes.
2. SLA/alertas por pendencia de reconciliacao.

P2:

1. Conectores adicionais por estado/orgao com API oficial.
2. Relatorios de taxa de sucesso por orgao/sistema.

