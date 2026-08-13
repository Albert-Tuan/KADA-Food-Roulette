#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MODE="${1:-api}"

usage() {
  cat <<'EOF'
Usage: ./scripts/setup-app.sh [mock|api]

Modes:
  mock  Install mobile dependencies only.
  api   Install backend/mobile dependencies, start MySQL, generate Prisma
        Client, and apply migrations. This is the default.
EOF
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

check_node_version() {
  local node_major
  node_major="$(node -p "process.versions.node.split('.')[0]")"

  if [[ "${node_major}" != "22" ]]; then
    echo "Node.js 22 is required. Current version: $(node --version)" >&2
    echo "Run: nvm use 22.23.2" >&2
    exit 1
  fi
}

install_mobile() {
  echo "Installing mobile dependencies..."
  (cd "${REPO_ROOT}/apps/mobile" && npm ci)
}

setup_api() {
  require_command docker

  if [[ ! -f "${REPO_ROOT}/backend/.env" ]]; then
    cat >&2 <<'EOF'
backend/.env is missing.

Create it manually from backend/.env.example and set at least:
  DATABASE_URL="mysql://food_user:foodpassword@localhost:3306/food_roulette"
  JWT_SECRET="a-local-secret-with-at-least-32-characters"
  PORT=3000
  NODE_ENV=development

The setup script does not create or overwrite environment files.
EOF
    exit 1
  fi

  echo "Installing backend dependencies..."
  (cd "${REPO_ROOT}/backend" && npm ci)

  echo "Starting MySQL..."
  docker compose -f "${REPO_ROOT}/docker/docker-compose.yml" up -d mysql

  echo "Waiting for MySQL to become healthy..."
  local attempt
  for attempt in {1..30}; do
    if [[ "$(docker inspect --format '{{.State.Health.Status}}' food-roulette-mysql 2>/dev/null || true)" == "healthy" ]]; then
      break
    fi

    if [[ "${attempt}" == "30" ]]; then
      echo "MySQL did not become healthy within 60 seconds." >&2
      exit 1
    fi

    sleep 2
  done

  echo "Generating Prisma Client and applying migrations..."
  (
    cd "${REPO_ROOT}/backend"
    npm run db:generate
    npm run db:migrate
  )
}

require_command node
require_command npm
check_node_version

case "${MODE}" in
  mock)
    install_mobile
    ;;
  api)
    setup_api
    install_mobile
    ;;
  help|-h|--help)
    usage
    exit 0
    ;;
  *)
    echo "Unknown mode: ${MODE}" >&2
    usage >&2
    exit 1
    ;;
esac

echo "Setup completed for mode: ${MODE}"
