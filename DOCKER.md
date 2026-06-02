# Docker - Nexus

## Setup

```bash
cp .env.example .env
cp .env.db.docker.example .env.db.docker
cp .env.backend.docker.example .env.backend.docker
cp .env.frontend.docker.example .env.frontend.docker
mkdir -p .docker/postgres .docker/backend-storage
```

Edite `.env`, `.env.db.docker` e `.env.backend.docker`.

## Rodar

```bash
docker compose up -d --build
```

- App: `http://localhost:8081`
- API: `http://localhost:3001/health`
- Postgres: `localhost:5434`

## Úteis

```bash
docker compose ps
docker compose logs -f backend
docker compose down
docker compose down -v
```
