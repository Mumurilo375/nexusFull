# Docker - Nexus

## Setup

```bash
cp .env.example .env
mkdir -p .docker/postgres .docker/backend-storage
mkdir -p .docker/nginx/certs
mkcert -cert-file .docker/nginx/certs/nexus.store.pem -key-file .docker/nginx/certs/nexus.store-key.pem nexus.store localhost 127.0.0.1
```

Edite `.env`, principalmente `JWT_SECRET` e `DB_PASSWORD`.

No `/etc/hosts`, confirme:

```text
127.0.0.1 nexus.store
```

No `.env`, mantenha as origens HTTPS:

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
- Backend e PostgreSQL ficam disponíveis somente na rede Docker (`backend:3000` e `db:5432`).

## Úteis

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
docker compose down -v
```
a
