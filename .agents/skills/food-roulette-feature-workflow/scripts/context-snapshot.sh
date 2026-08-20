#!/usr/bin/env bash

set -Eeuo pipefail

REPO_INPUT="${1:-.}"

if ! REPO_ROOT="$(git -C "${REPO_INPUT}" rev-parse --show-toplevel 2>/dev/null)"; then
  echo "Not inside a Git repository: ${REPO_INPUT}" >&2
  exit 1
fi

BRANCH="$(git -C "${REPO_ROOT}" symbolic-ref --quiet --short HEAD 2>/dev/null || printf 'DETACHED')"
HEAD_SHA="$(git -C "${REPO_ROOT}" rev-parse --short=12 HEAD)"
UPSTREAM="$(git -C "${REPO_ROOT}" rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2>/dev/null || true)"

echo "# Repository context snapshot"
echo
echo "root: ${REPO_ROOT}"
echo "branch: ${BRANCH}"
echo "head: ${HEAD_SHA}"

if [[ -n "${UPSTREAM}" ]]; then
  echo "upstream: ${UPSTREAM}"
  if DIVERGENCE="$(git -C "${REPO_ROOT}" rev-list --left-right --count "${UPSTREAM}...HEAD" 2>/dev/null)"; then
    read -r BEHIND AHEAD <<< "${DIVERGENCE}"
    echo "ahead: ${AHEAD}"
    echo "behind: ${BEHIND}"
  else
    echo "ahead: unknown"
    echo "behind: unknown"
  fi
else
  echo "upstream: none"
  echo "ahead: unknown"
  echo "behind: unknown"
fi

echo
echo "## Working tree"
STATUS="$(git -C "${REPO_ROOT}" status --short --untracked-files=all)"
if [[ -n "${STATUS}" ]]; then
  printf '%s\n' "${STATUS}"
else
  echo "clean"
fi

echo
echo "## Recent commits"
git -C "${REPO_ROOT}" log -8 --oneline --decorate

echo
echo "## Runtime"
if command -v node >/dev/null 2>&1; then
  echo "node: $(node --version)"
else
  echo "node: unavailable"
fi

if command -v npm >/dev/null 2>&1; then
  echo "npm: $(npm --version)"
else
  echo "npm: unavailable"
fi
