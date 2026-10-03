#!/usr/bin/env bash
# ==============================================================================
# Lush View Bar — Fedora Linux Reset & Run Script
# ==============================================================================
# Usage:
#   ./reset-and-run-fedora.sh              # Unpack build, reset SQLite DB, serve on :8080
#   ./reset-and-run-fedora.sh --git-reset  # Also hard-reset git checkout to origin/main
#   ./reset-and-run-fedora.sh --keep-db    # Keep existing SQLite database
#   ./reset-and-run-fedora.sh --clean      # Force a fresh unpack of the zip
#   PORT=9000 ./reset-and-run-fedora.sh    # Custom port
#
# The application is unpacked from lushview-bar-fixed.zip into a runtime
# directory OUTSIDE the repository, so the checkout stays at three files.
# Override the location with LUSHVIEW_RUNTIME_DIR
# (default: $XDG_DATA_HOME/lushview-bar, else ~/.local/share/lushview-bar).
# ==============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ZIP_FILE="${ROOT_DIR}/lushview-bar-fixed.zip"
RUNTIME_DIR="${LUSHVIEW_RUNTIME_DIR:-${XDG_DATA_HOME:-${HOME}/.local/share}/lushview-bar}"
APP_ROOT="${RUNTIME_DIR}/lushview-bar"
APP_DIR="${APP_ROOT}/public_html"
DATA_DIR="${APP_ROOT}/lushview-data"
PORT="${PORT:-8080}"

GIT_RESET=0
KEEP_DB=0
FRESH_UNPACK=0

for arg in "$@"; do
  case "${arg}" in
    --git-reset|--reset) GIT_RESET=1 ;;
    --keep-db)           KEEP_DB=1 ;;
    --clean)             FRESH_UNPACK=1 ;;
    --wasm)
      echo "ERROR: the bundled php-wasm preview server (extracted/preview) was removed" >&2
      echo "       when the scratch folders were pruned. Install native PHP instead:" >&2
      echo "         Fedora:  sudo dnf install -y php-cli php-pdo sqlite" >&2
      echo "         Debian:  sudo apt install -y php-cli php-sqlite3" >&2
      exit 1
      ;;
    -h|--help)
      sed -n '2,16p' "${BASH_SOURCE[0]}"
      exit 0
      ;;
    *)
      echo "ERROR: unknown option '${arg}' (try --help)" >&2
      exit 2
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

if [[ ! -f "${ZIP_FILE}" ]]; then
  echo "ERROR: ${ZIP_FILE} not found next to this script." >&2
  exit 1
fi

ZIP_SHA="$(sha256sum "${ZIP_FILE}" | awk '{print $1}')"
STAMP_FILE="${APP_ROOT}/.source-zip.sha256"

if [[ "${FRESH_UNPACK}" -eq 1 ]] && [[ -d "${APP_ROOT}" ]]; then
  echo "==> --clean: discarding previous unpack at ${APP_ROOT}..."
  rm -rf "${APP_ROOT}"
fi

NEED_UNPACK=0
if [[ ! -d "${APP_DIR}" ]]; then
  NEED_UNPACK=1
elif [[ ! -f "${STAMP_FILE}" ]] || [[ "$(cat "${STAMP_FILE}")" != "${ZIP_SHA}" ]]; then
  echo "==> lushview-bar-fixed.zip changed since the last unpack; re-unpacking..."
  rm -rf "${APP_DIR}" "${APP_ROOT}/README.txt"
  NEED_UNPACK=1
fi

if [[ "${NEED_UNPACK}" -eq 1 ]]; then
  if ! command -v unzip >/dev/null 2>&1; then
    echo "ERROR: 'unzip' is required to unpack the build." >&2
    echo "       Fedora:  sudo dnf install -y unzip" >&2
    echo "       Debian:  sudo apt install -y unzip" >&2
    exit 1
  fi
  echo "==> Unpacking lushview-bar-fixed.zip into ${APP_ROOT}..."
  mkdir -p "${APP_ROOT}"
  unzip -q -o "${ZIP_FILE}" -d "${APP_ROOT}"
  printf '%s\n' "${ZIP_SHA}" > "${STAMP_FILE}"
fi

if [[ "${KEEP_DB}" -eq 0 ]]; then
  echo "==> Resetting SQLite database directory (${DATA_DIR})..."
  rm -rf "${DATA_DIR}"
fi

check_php_sqlite() {
  command -v php >/dev/null 2>&1 && php -m 2>/dev/null | grep -qi '^pdo_sqlite$'
}

if ! check_php_sqlite && command -v dnf >/dev/null 2>&1; then
  echo "==> Installing PHP CLI + SQLite extensions via dnf (Fedora)..."
  sudo dnf install -y php-cli php-pdo sqlite \
    || sudo dnf install -y php-cli php-pdo php-json sqlite \
    || true
fi

# api/db.php declares `function json_out(...): never` and `fail(...): never`.
# The `never` return type is PHP 8.1+, so on PHP 8.0 or older every /api/*.php
# request dies with a fatal parse error. Fail here with a clear message instead
# of starting a server that 500s on every call.
if command -v php >/dev/null 2>&1; then
  PHP_VERSION_ID="$(php -r 'echo PHP_VERSION_ID;' 2>/dev/null || echo 0)"
  if [[ "${PHP_VERSION_ID}" =~ ^[0-9]+$ ]] && (( PHP_VERSION_ID < 80100 )); then
    echo "ERROR: PHP 8.1 or newer is required (found $(php -r 'echo PHP_VERSION;' 2>/dev/null || echo 'unknown'))." >&2
    echo "       api/db.php uses the 'never' return type, which PHP 8.0 cannot parse," >&2
    echo "       so every /api/*.php request would fail." >&2
    echo "       Fedora:  sudo dnf install -y php-cli php-pdo sqlite" >&2
    echo "       Debian:  sudo apt install -y php8.1-cli php8.1-sqlite3" >&2
    exit 1
  fi
fi

if ! check_php_sqlite; then
  echo "ERROR: PHP with the pdo_sqlite extension is required but not active." >&2
  echo "       Fedora:  sudo dnf install -y php-cli php-pdo sqlite" >&2
  echo "       Debian:  sudo apt install -y php-cli php-sqlite3" >&2
  exit 1
fi

echo ""
echo "======================================================================"
echo "  Lush View Bar is starting on http://localhost:${PORT}"
echo "  Docroot:  ${APP_DIR}"
echo "  Database: ${DATA_DIR}/lushview.sqlite"
echo ""
echo "  1. First-time setup: http://localhost:${PORT}/api/install.php"
echo "  2. Sign in:          http://localhost:${PORT}/pages/login.html"
echo "  3. Dashboard:        http://localhost:${PORT}/dashboard.html"
echo "======================================================================"
echo ""

exec php -S "0.0.0.0:${PORT}" -t "${APP_DIR}"
