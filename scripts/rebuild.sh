#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "docker is not installed or not on PATH"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "docker is not running or not reachable"
  exit 1
fi

usage() {
  cat <<'EOF'
Usage: scripts/rebuild.sh [--all] [--stop-host]

Cleans the SME_ecommerce stack and rebuilds everything.

Options:
  --all        Also run docker system prune -af --volumes (removes ALL unused images/volumes on this machine).
  --stop-host  Stop host Postgres/Redis services before rebuild (helps avoid port conflicts).
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

for arg in "$@"; do
  case "$arg" in
    --all|--stop-host) ;;
    *)
      usage
      exit 1
      ;;
  esac
done

stop_host_services() {
  if ! command -v service >/dev/null 2>&1; then
    echo "service command not found; skipping host service stop."
    return 0
  fi

  echo "Stopping host Postgres and Redis services (if running)..."
  sudo service postgresql stop >/dev/null 2>&1 || true
  sudo service redis-server stop >/dev/null 2>&1 || true
}

if printf '%s\n' "$@" | grep -q -- '--stop-host'; then
  stop_host_services
fi

echo "Stopping and removing project containers, networks, images, and volumes..."
# --rmi local removes only images built by compose; --volumes removes named volumes declared in compose.
docker compose down --remove-orphans --volumes --rmi local

if [[ "${1:-}" == "--all" ]]; then
  echo "Running full docker system prune (this affects other projects too)..."
  docker system prune -af --volumes
fi

echo "Rebuilding and starting services..."
docker compose up -d --build

echo "Rebuild complete."
