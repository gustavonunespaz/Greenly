# ADR 001: Monolítico Modular com Clean Architecture

**Status:** Aceito
**Data:** 2024-01-01
**Decisores:** Equipe Greenly

## Contexto

Precisamos definir a arquitetura inicial do Greenly para o MVP.

## Decisão

Adotar Monolítico Modular com Clean Architecture.

## Justificativa

- Menor complexidade operacional para time pequeno no MVP
- Clean Architecture permite extrair módulos para microsserviços no futuro sem reescrever o domínio
- Kubernetes com HPA resolve escalabilidade horizontal do monolito

## Consequências

- Deploy simplificado (uma imagem Docker)
- Sem latência de rede entre módulos
- Regra da Dependência deve ser seguida rigorosamente
