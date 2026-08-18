#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
SUITE="${1:-help}"
PLATFORM="${2:-ios}"
EXPECTED_MAESTRO_VERSION="2.7.0"
MAESTRO_BIN="${MAESTRO_BIN:-}"

usage() {
  printf '%s\n' \
    'Usage:' \
    '  EXPO_URL=exp://127.0.0.1:8081 ./scripts/run-maestro.sh mock [ios|android]' \
    '  EXPO_URL=exp://127.0.0.1:8081 TEST_EMAIL=... TEST_PASSWORD=... ./scripts/run-maestro.sh api [ios|android]' \
    '  ./scripts/run-maestro.sh standalone' \
    '' \
    'Start Expo in the matching mock/API mode before running an Expo Go suite.'
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_value() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: ${name}" >&2
    exit 1
  fi
}

configure_java() {
  local java_home="${JAVA_HOME:-}"

  if [[ -z "${java_home}" ]] && [[ -x /usr/libexec/java_home ]]; then
    java_home="$(/usr/libexec/java_home -v 17 2>/dev/null || true)"
  fi
  if [[ -z "${java_home}" ]] && [[ -x /opt/homebrew/opt/openjdk@17/bin/java ]]; then
    java_home="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
  fi
  if [[ -z "${java_home}" ]]; then
    # Homebrew may install only to Cellar without a symlink in opt/
    local cellar_home
    cellar_home="$(ls -d /opt/homebrew/Cellar/openjdk@17/*/libexec/openjdk.jdk/Contents/Home 2>/dev/null | sort -V | tail -1)"
    if [[ -n "${cellar_home}" ]] && [[ -x "${cellar_home}/bin/java" ]]; then
      java_home="${cellar_home}"
    fi
  fi
  if [[ -z "${java_home}" ]] || [[ ! -x "${java_home}/bin/java" ]]; then
    echo "Java 17 is required. Set JAVA_HOME to a Java 17 installation." >&2
    exit 1
  fi

  local java_version
  java_version="$("${java_home}/bin/java" -version 2>&1 | awk -F'"' 'NR == 1 { print $2 }')"
  if [[ "${java_version}" != 17.* ]]; then
    echo "Java 17 is required. Current version: ${java_version:-unknown}" >&2
    exit 1
  fi

  export JAVA_HOME="${java_home}"
  export PATH="${JAVA_HOME}/bin:${PATH}"
}

configure_maestro() {
  if [[ -z "${MAESTRO_BIN}" ]]; then
    if command -v maestro >/dev/null 2>&1; then
      MAESTRO_BIN="$(command -v maestro)"
    elif [[ -x "${HOME}/.maestro/bin/maestro" ]]; then
      MAESTRO_BIN="${HOME}/.maestro/bin/maestro"
    else
      echo "Maestro CLI ${EXPECTED_MAESTRO_VERSION} is required. Set MAESTRO_BIN or install it in ~/.maestro/bin." >&2
      exit 1
    fi
  fi
  if [[ ! -x "${MAESTRO_BIN}" ]]; then
    echo "Maestro executable is not available: ${MAESTRO_BIN}" >&2
    exit 1
  fi

  export MAESTRO_CLI_NO_ANALYTICS=1
  export MAESTRO_CLI_ANALYSIS_NOTIFICATION_DISABLED=true

  local maestro_version
  maestro_version="$("${MAESTRO_BIN}" --version | tail -1 | tr -d '[:space:]')"
  if [[ "${maestro_version}" != "${EXPECTED_MAESTRO_VERSION}" ]]; then
    echo "Maestro CLI ${EXPECTED_MAESTRO_VERSION} is required. Current version: ${maestro_version:-unknown}" >&2
    exit 1
  fi
}

run_maestro() {
  local -a device_args=()
  if [[ -n "${MAESTRO_UDID:-}" ]]; then
    device_args=(--udid "${MAESTRO_UDID}")
  fi
  "${MAESTRO_BIN}" test "${device_args[@]+"${device_args[@]}"}" "$@"
}

# Expo Go shows a dev-menu onboarding sheet on first launch that intercepts
# in-app taps. Dismiss it once via NSUserDefaults so Maestro flows are not blocked.
disable_expo_dev_menu_onboarding() {
  if [[ "${PLATFORM}" != "ios" ]]; then
    return
  fi
  if ! command -v xcrun >/dev/null 2>&1; then
    echo "xcrun not found; skipping Expo Go dev-menu onboarding dismissal" >&2
    return
  fi
  local device_arg
  if [[ -n "${MAESTRO_UDID:-}" ]]; then
    device_arg=("${MAESTRO_UDID}")
  else
    device_arg=("$(xcrun simctl list devices booted -j | python3 -c 'import json,sys; d=json.load(sys.stdin); devs=[v["udid"] for k,v in d["devices"].items() for v in v if v["state"]=="Booted"]; print(devs[0] if devs else "")')")
  fi
  if [[ -n "${device_arg:-}" ]]; then
    xcrun simctl spawn "${device_arg}" defaults write host.exp.Exponent EXDevMenuIsOnboardingFinished -bool true 2>/dev/null || true
  fi
}

expo_app_id() {
  case "${PLATFORM}" in
    ios) printf '%s\n' 'host.exp.Exponent' ;;
    android) printf '%s\n' 'host.exp.exponent' ;;
    *)
      echo "Unknown platform: ${PLATFORM}" >&2
      exit 1
      ;;
  esac
}

case "${SUITE}" in
  mock)
    configure_java
    configure_maestro
    require_value EXPO_URL
    disable_expo_dev_menu_onboarding
    run_maestro \
      -e EXPO_APP_ID="$(expo_app_id)" \
      -e EXPO_URL="${EXPO_URL}" \
      "${MOBILE_ROOT}/.maestro/mock"
    ;;
  api)
    configure_java
    configure_maestro
    require_value EXPO_URL
    require_value TEST_EMAIL
    require_value TEST_PASSWORD
    disable_expo_dev_menu_onboarding
    run_maestro \
      -e EXPO_APP_ID="$(expo_app_id)" \
      -e EXPO_URL="${EXPO_URL}" \
      -e TEST_EMAIL="${TEST_EMAIL}" \
      -e TEST_PASSWORD="${TEST_PASSWORD}" \
      "${MOBILE_ROOT}/.maestro/api"
    ;;
  standalone)
    configure_java
    configure_maestro
    run_maestro "${MOBILE_ROOT}/.maestro/standalone"
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    echo "Unknown suite: ${SUITE}" >&2
    usage >&2
    exit 1
    ;;
esac
