#!/usr/bin/env bash
# ==============================================================================
# Lush View Bar — Fedora Linux Reset & Run Script
# ==============================================================================
# Usage:
#   ./reset-and-run-fedora.sh              # Reset SQLite DB, verify, and serve on :8080
#   ./reset-and-run-fedora.sh --git-reset  # Also hard-reset git checkout to origin/main
#   ./reset-and-run-fedora.sh --keep-db    # Keep existing SQLite database
#   ./reset-and-run-fedora.sh --wasm       # Force Node php-wasm server instead of native PHP
#   PORT=9000 ./reset-and-run-fedora.sh    # Custom port
# ==============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${ROOT_DIR}/extracted/lushview-bar/public_html"
DATA_DIR="${ROOT_DIR}/extracted/lushview-bar/lushview-data"
PORT="${PORT:-8080}"

GIT_RESET=0
KEEP_DB=0
FORCE_WASM=0

for arg in "$@"; do
  case "$arg" in
    --git-reset|--reset) GIT_RESET=1 ;;
    --keep-db)           KEEP_DB=1 ;;
    --wasm)              FORCE_WASM=1 ;;
    -h|--help)
      sed -n '2,12p' "${BASH_SOURCE[0]}"
      exit 0
      ;;
  esac
done

cd "${ROOT_DIR}"

if [[ "${GIT_RESET}" -eq 1 ]]; then
  echo "==> Fetching latest origin/main and resetting working tree..."
  if [[ -f .git/shallow ]]; then
    git fetch --unshallow origin || git fetch origin
  else
    git fetch origin
  fi
  git checkout main
  git reset --hard origin/main
fi

if [[ "${KEEP_DB}" -eq 0 ]]; then
  echo "==> Resetting SQLite database directory (${DATA_DIR})..."
  rm -rf "${DATA_DIR}"
fi

if command -v node >/dev/null 2>&1 && [[ -f "${ROOT_DIR}/extracted/tests/sidebar-check.mjs" ]]; then
  echo "==> Running sidebar & asset verification check..."
  node "${ROOT_DIR}/extracted/tests/sidebar-check.mjs"
fi

check_php_sqlite() {
  command -v php >/dev/null 2>&1 && php -m 2>/dev/null | grep -qi '^pdo_sqlite$'
}

if [[ "${FORCE_WASM}" -eq 0 ]]; then
  if ! check_php_sqlite; then
    if command -v dnf >/dev/null 2>&1; then
      echo "==> Installing PHP CLI + SQLite extensions via dnf (Fedora)..."
      sudo dnf install -y php-cli php-pdo php-json sqlite
    fi
  fi
fi

echo ""
echo "======================================================================"
echo "  Lush View Bar is starting on http://localhost:${PORT}"
echo "  1. First-time setup: http://localhost:${PORT}/api/install.php"
echo "  2. Sign in:          http://localhost:${PORT}/pages/login.html"
echo "  3. Dashboard:        http://localhost:${PORT}/dashboard.html"
echo "======================================================================"
echo ""

if [[ "${FORCE_WASM}" -eq 0 ]] && check_php_sqlite; then
  exec php -S "0.0.0.0:${PORT}" -t "${APP_DIR}"
else
  echo "==> Native php+pdo_sqlite not active; starting Node php-wasm preview server..."
  cd "${ROOT_DIR}/extracted/preview"
  if [[ ! -d node_modules ]]; then
    npm install --no-audit --no-fund
  fi
  PORT="${PORT}" exec node server.mjs
fi
