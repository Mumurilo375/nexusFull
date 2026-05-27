# Comandos Docker (Nexus) beekeeper

Execute na pasta com docker-compose.yml.

Subir:
docker compose up -d db
docker compose up -d backend
docker compose up -d frontend

Parar:
docker compose stop
docker compose stop db

Status/Logs:
docker compose ps
docker compose logs -f backend
(troque "backend" por "db" ou "frontend")

Limpar tudo:
docker compose down
