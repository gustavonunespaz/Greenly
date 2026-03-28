# Changelog

Todas as mudanças relevantes do Greenly serão registradas aqui.

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
