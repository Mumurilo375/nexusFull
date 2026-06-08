# Docker - Nexus

## Setup

```bash
cp .env.example .env
cp .env.db.docker.example .env.db.docker
cp .env.backend.docker.example .env.backend.docker
cp .env.frontend.docker.example .env.frontend.docker
mkdir -p .docker/postgres .docker/backend-storage
mkdir -p .docker/nginx/certs
mkcert -cert-file .docker/nginx/certs/nexus.store.pem -key-file .docker/nginx/certs/nexus.store-key.pem nexus.store localhost 127.0.0.1
```

Edite `.env`, `.env.db.docker` e `.env.backend.docker`.

No `/etc/hosts`, confirme:

```text
127.0.0.1 nexus.store
```

No `.env.backend.docker`, inclua a origem HTTPS:

```env
CORS_ORIGINS=http://localhost:8081,https://localhost,https://nexus.store
```

## Rodar

```bash
docker compose up -d --build
```

- App HTTPS: `https://nexus.store`
- API via Nginx: `https://nexus.store/api/health`
- Redirect HTTP: `http://nexus.store` -> `https://nexus.store`
- App alternativo local: `https://localhost`
- App legado via porta 8081: `http://localhost:8081` -> `https://localhost`
- API direta do backend: `http://localhost:3001/health`
- Postgres: `localhost:5434`

## Úteis

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
docker compose down -v
```
