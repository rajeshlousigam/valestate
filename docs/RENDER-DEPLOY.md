# Deploying to Render (Admin Console)

Hosts the **ValEstate admin / verification console** as a Docker web service.
The API can be hosted from the same image (see the end).

## PHP version
- Production image: **PHP 8.2** (`php:8.2-apache`, `infra/render/Dockerfile`).
- Code is compatible with **8.1 and 8.2** (`composer.json` → `"php": ">=8.1"`).
- To use 8.1 instead, change the first line of `infra/render/Dockerfile` to `FROM php:8.1-apache`.

## Prerequisite: a MySQL 8 database
Render does **not** offer managed MySQL. Provision MySQL 8 elsewhere and note
its host / db / user / password:
- **Aiven** (free trial), **Railway**, or **PlanetScale** (MySQL-compatible), or
- a **Render Private Service** running the `mysql:8` image with a persistent disk.

(Redis is **not required** by the admin console. It's only needed if you also
host the REST API — Render offers "Key Value" for that.)

## Deploy (Blueprint — easiest)
1. Push this repo to GitHub/GitLab.
2. Render → **New → Blueprint** → select the repo. It reads `render.yaml` and
   creates the `valestate-admin` Docker web service.
3. Fill the `sync:false` env vars (Render prompts for them):
   `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. `COOKIE_VALIDATION_KEY` and
   `JWT_SECRET` are auto-generated.
4. **First deploy only:** set `RUN_MIGRATIONS=1` and `RUN_SEED=1` (creates the
   schema + roles + seed staff), deploy, then set both back to `0` and redeploy.
5. Open the service URL → `/auth/login`.

### Manual alternative (no Blueprint)
Render → **New → Web Service → Build from a Dockerfile**:
- Dockerfile path: `infra/render/Dockerfile`, Docker context: `.` (repo root)
- Env vars: `APP_ROOT=admin`, `YII_ENV=prod`, `YII_DEBUG=0`, `DB_*`,
  `COOKIE_VALIDATION_KEY`, `JWT_SECRET`, (first run) `RUN_MIGRATIONS=1`,`RUN_SEED=1`.
- Health check path: `/auth/login`.

## First login & hardening
- Seeded staff (dev): `admin@valestate.test`, `ops@valestate.test`,
  `verifier@valestate.test` — password `secret123`.
- **Immediately:** create real staff (Users & RBAC) and remove/disable the seed
  accounts; set strong `COOKIE_VALIDATION_KEY`/`JWT_SECRET` (Blueprint generates them).
- Render serves HTTPS automatically.

## Also hosting the REST API (optional)
Uncomment the `valestate-api` service in `render.yaml` (same image,
`APP_ROOT=web`). It additionally needs Redis (`REDIS_HOST`/`REDIS_PORT`, e.g.
Render Key Value) and `WEB_ORIGIN=<your web app URL>` for CORS. For the API,
switch JWT to **RS256** with a real keypair before production (docs/10).

## Verified
The production image was built and run against MySQL locally: login page (200),
guest→/login redirect, staff login, and the dashboard (charts + map) all render
under Apache + mod_php.
