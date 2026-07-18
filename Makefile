COMPOSE = docker compose -f infra/docker-compose.yml --env-file .env

.PHONY: help up down logs ps build migrate seed health composer shell-api web-install web-dev fresh

help:
	@echo "ValEstate dev commands:"
	@echo "  make up          - start all services (mysql, redis, backend, nginx, adminer)"
	@echo "  make down        - stop all services"
	@echo "  make build       - (re)build backend image"
	@echo "  make composer    - install backend PHP deps (in container)"
	@echo "  make migrate     - run DB migrations"
	@echo "  make seed        - seed launch-city config (Imphal localities, roles, config)"
	@echo "  make health      - curl the API health endpoint"
	@echo "  make logs        - tail service logs"
	@echo "  make web-dev     - run Next.js dev server (local Node)"
	@echo "  make fresh       - build + up + composer + migrate + seed"

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build backend

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f --tail=100

composer:
	$(COMPOSE) run --rm backend composer install --no-interaction --prefer-dist

migrate:
	$(COMPOSE) run --rm backend php yii migrate --interactive=0

seed:
	$(COMPOSE) run --rm backend php yii seed/launch-city --interactive=0

health:
	@curl -s http://localhost:8080/v1/health | (command -v jq >/dev/null && jq . || cat)

shell-api:
	$(COMPOSE) exec backend sh

web-install:
	cd web && npm install

web-dev:
	cd web && npm run dev

fresh: build up composer migrate seed
	@echo "Stack ready. API: http://localhost:8080  Adminer: http://localhost:8081"
