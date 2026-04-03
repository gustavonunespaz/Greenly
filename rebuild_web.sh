#!/bin/bash
echo "Rebuilding Greenly Docker containers without cache..."

# Remove o container do web se ele estiver rodando, force remoção
docker compose rm -s -f web

# Reconstroi o web totalmente sem cache e sobe ele
docker compose build --no-cache web
docker compose up -d web

echo "Processo concluído com sucesso! Pode acessar http://localhost:8080"
