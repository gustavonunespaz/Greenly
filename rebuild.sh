#!/bin/bash
echo "Rebuilding Greenly Docker containers without cache..."

# Remove containers antigos forçadamente se existirem
docker compose rm -s -f web api

# Reconstroi totalmente sem cache e sobe a infra de pé
echo "Reconstruindo API e Web..."
docker compose build --no-cache api web
docker compose up -d web api

echo "Banco de dados atualizado e Aplicação Web renovada!"
echo "Acesse http://localhost:8080"
