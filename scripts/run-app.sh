#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MODE="${1:-help}"
API_PORT="${API_PORT:-3000}"
BACKEND_PID=""
BACKEND_STARTED_BY_SCRIPT=false

usage() {
  cat <<'EOF'
Usage:
  ./scripts/run-app.sh mock
  ./scripts/run-app.sh simulator
  ./scripts/run-app.sh device [MAC_LAN_IPV4]

Modes:
  mock       Run Expo with mock Locket/Profile repositories. No API or MySQL.
  simulator  Run MySQL, backend, and Expo for iOS Simulator using localhost.
  device     Run the full stack for a physical device on the same Wi-Fi.
             Pass the Mac computer's LAN IPv4 address, not the device MAC
             address, or let the script detect the active network interface.

Examples:
  ./scripts/run-app.sh mock
  ./scripts/run-app.sh simulator
  API_PORT=3001 ./scripts/run-app.sh simulator
  ./scripts/run-app.sh device 192.168.1.20
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

check_api_port() {
  if [[ ! "${API_PORT}" =~ ^[0-9]+$ ]] || ((10#${API_PORT} < 1 || 10#${API_PORT} > 65535)); then
    echo "API_PORT must be an integer between 1 and 65535. Current value: ${API_PORT}" >&2
    exit 1
  fi
}

cleanup() {
  if [[ "${BACKEND_STARTED_BY_SCRIPT}" == "true" ]] && [[ -n "${BACKEND_PID}" ]]; then
    echo
    echo "Stopping backend process ${BACKEND_PID}..."
    kill "${BACKEND_PID}" 2>/dev/null || true
    wait "${BACKEND_PID}" 2>/dev/null || true
  fi
}

wait_for_backend() {
  local attempt
  for attempt in {1..30}; do
    if is_food_roulette_backend; then
      return 0
    fi

    if [[ "${attempt}" == "30" ]]; then
      echo "Backend did not respond at http://localhost:${API_PORT}/health within 30 seconds." >&2
      return 1
    fi

    sleep 1
  done
}

is_food_roulette_backend() {
  curl --fail --silent --max-time 2 "http://localhost:${API_PORT}/health" \
    | node -e '
      let body = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => { body += chunk; });
      process.stdin.on("end", () => {
        try {
          const payload = JSON.parse(body);
          process.exit(payload.success === true && payload.message === "Food Roulette API is running" ? 0 : 1);
        } catch {
          process.exit(1);
        }
      });
    '
}

start_api_stack() {
  require_command docker
  require_command curl

  if [[ ! -f "${REPO_ROOT}/backend/.env" ]]; then
    echo "backend/.env is missing. See docs/RUN_APP.md before using API modes." >&2
    exit 1
  fi

  if [[ ! -d "${REPO_ROOT}/backend/node_modules" ]] || [[ ! -d "${REPO_ROOT}/apps/mobile/node_modules" ]]; then
    echo "Dependencies are missing. Run: ./scripts/setup-app.sh api" >&2
    exit 1
  fi

  docker compose -f "${REPO_ROOT}/docker/docker-compose.yml" up -d mysql

  if is_food_roulette_backend; then
    echo "Using the backend already running on port ${API_PORT}."
    return 0
  fi

  if curl --fail --silent --max-time 2 "http://localhost:${API_PORT}/health" >/dev/null 2>&1 \
    || lsof -nP -iTCP:"${API_PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port ${API_PORT} is occupied by a service that is not the Food Roulette API." >&2
    echo "Stop that service or run it on another port, then retry." >&2
    lsof -nP -iTCP:"${API_PORT}" -sTCP:LISTEN 2>/dev/null || true
    return 1
  fi

  echo "Starting backend on port ${API_PORT}..."
  (cd "${REPO_ROOT}/backend" && PORT="${API_PORT}" npm run dev) &
  BACKEND_PID=$!
  BACKEND_STARTED_BY_SCRIPT=true
  wait_for_backend
}

detect_lan_ip() {
  local interface=""
  local address=""

  if command -v route >/dev/null 2>&1; then
    interface="$(route -n get default 2>/dev/null | awk '/interface:/{print $2; exit}')"
  fi

  if command -v ipconfig >/dev/null 2>&1; then
    for interface in "${interface}" en0 en1; do
      if [[ -n "${interface}" ]]; then
        address="$(ipconfig getifaddr "${interface}" 2>/dev/null || true)"
        if [[ -n "${address}" ]]; then
          printf '%s\n' "${address}"
          return
        fi
      fi
    done
  fi

  if command -v hostname >/dev/null 2>&1; then
    hostname -I 2>/dev/null | awk '{print $1}'
  fi
}

is_mac_address() {
  [[ "$1" =~ ^([[:xdigit:]]{2}[:-]){5}[[:xdigit:]]{2}$ ]]
}

is_ipv4_address() {
  local address="$1"
  local octet
  local -a octets

  IFS='.' read -r -a octets <<< "${address}"
  if [[ "${#octets[@]}" -ne 4 ]]; then
    return 1
  fi

  for octet in "${octets[@]}"; do
    if [[ ! "${octet}" =~ ^[0-9]{1,3}$ ]] || ((10#${octet} > 255)); then
      return 1
    fi
  done
}

resolve_device_host() {
  local supplied_host="${1:-}"
  local resolved_host="${supplied_host}"

  if [[ -n "${supplied_host}" ]] && is_mac_address "${supplied_host}"; then
    echo "Ignoring device MAC address '${supplied_host}'; the API needs the Mac computer's LAN IPv4 address." >&2
    resolved_host=""
  fi

  if [[ -z "${resolved_host}" ]]; then
    resolved_host="$(detect_lan_ip)"
  fi

  if [[ -z "${resolved_host}" ]]; then
    echo "Could not detect the Mac LAN IPv4 address. Pass it explicitly:" >&2
    echo "  ./scripts/run-app.sh device 192.168.1.20" >&2
    return 1
  fi

  if ! is_ipv4_address "${resolved_host}"; then
    echo "Invalid Mac LAN IPv4 address: ${resolved_host}" >&2
    echo "Expected a value such as 192.168.1.20, not a device MAC address." >&2
    return 1
  fi

  printf '%s\n' "${resolved_host}"
}

run_mobile() {
  local api_url="$1"
  local use_mock="$2"

  echo "Expo API URL: ${api_url}"
  echo "Mock repositories: ${use_mock}"
  echo "Press i for iOS Simulator, a for Android, or scan the QR code on a device."

  (
    cd "${REPO_ROOT}/apps/mobile"
    EXPO_PUBLIC_API_URL="${api_url}" \
      EXPO_PUBLIC_USE_MOCK_REPOSITORIES="${use_mock}" \
      npm start -- --clear
  )
}

trap cleanup EXIT INT TERM

require_command node
require_command npm
check_node_version
check_api_port

case "${MODE}" in
  mock)
    if [[ ! -d "${REPO_ROOT}/apps/mobile/node_modules" ]]; then
      echo "Mobile dependencies are missing. Run: ./scripts/setup-app.sh mock" >&2
      exit 1
    fi
    run_mobile "http://localhost:${API_PORT}/api/v1" "true"
    ;;
  simulator)
    start_api_stack
    run_mobile "http://localhost:${API_PORT}/api/v1" "false"
    ;;
  device)
    DEVICE_HOST="$(resolve_device_host "${2:-}")"
    echo "Mac LAN IPv4: ${DEVICE_HOST}"
    start_api_stack
    run_mobile "http://${DEVICE_HOST}:${API_PORT}/api/v1" "false"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown mode: ${MODE}" >&2
    usage >&2
    exit 1
    ;;
esac
