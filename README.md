# HousePoint

A **verification-first real-estate marketplace** — every property is verified by a human Operations process **before** it becomes publicly visible.

> Launch city: **Imphal, Manipur, India** · See [`docs/`](docs/) for the full enterprise documentation suite (start at [docs/README.md](docs/README.md)).

## Monorepo layout
| Path | What | Stack |
|---|---|---|
| `backend/` | REST API + domain (modular monolith) | Yii2 · PHP 8.2 · MySQL · Redis |
| `web/` | Public SEO-first site + buyer/owner apps | Next.js · TypeScript · Tailwind · Shadcn |
| `admin/` | Ops/verification console | Yii2 (Phase 1) |
| `mobile/` | Buyer/owner app | React Native (Phase 2) |
| `openapi/` | API contract (source of truth) | OpenAPI 3.1 |
| `infra/` | Local + deploy infrastructure | Docker Compose · AWS (ap-south-1) |
| `docs/` | Enterprise documentation (24 docs) | Markdown |

## Phase 0 — Foundations (current)
Goal: auth/RBAC, domain skeleton, event outbox, health, CI-ready, one vertical slice. See [docs/19](docs/19-nfr-and-phased-roadmap.md).

## Quick start (local)
```bash
cp .env.example .env            # fill secrets (never commit .env)
make up                         # start mysql, redis, backend, nginx, adminer
make migrate                    # run DB migrations (creates core schema)
make health                     # -> {"status":"ok", ...}
# Web (separate terminal):
cd web && npm install && npm run dev   # http://localhost:3000
```
Services: API `http://localhost:8080` · Adminer (DB UI) `http://localhost:8081` · Web `http://localhost:3000`.

## Conventions
- Data region: **AWS ap-south-1 (Mumbai)** — India DPDP (docs/22, docs/24).
- Domain terms are binding (docs/04): **Property** = the asset, **Listing** = its publishable offer.
- API is source of truth via `openapi/openapi.yaml` (docs/09).
- Secrets: env/secrets-manager only, never in code (docs/10, docs/20).
