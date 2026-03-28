# ADR 002: Isolamento Multi-Tenant por Column-Level (não RLS)

**Status:** Aceito
**Data:** 2024-01-01

## Decisão

Usar `consultoriaId` em todas as tabelas + validação no middleware, sem PostgreSQL Row Level Security.

## Justificativa

- RLS adiciona complexidade operacional e de debug para o MVP
- O middleware `tenant.middleware.ts` garante isolamento suficiente para o MVP
- Migração para RLS é possível no futuro sem alterar o schema

## Trade-offs

- Risco: bug no middleware pode vazar dados entre tenants
- Mitigação: testes de integração específicos para isolamento
