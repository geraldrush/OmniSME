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
Usage: scripts/cleanup.sh [--all]

Cleans the SME_ecommerce stack (containers, networks, images, volumes).

Options:
  --all   Also run docker system prune -af --volumes (removes ALL unused images/volumes on this machine).
EOF
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "${1:-}" == "--all" && "${2:-}" != "" ]]; then
  usage
  exit 1
fi

echo "Stopping and removing project containers, networks, images, and volumes..."
# --rmi local removes only images built by compose; --volumes removes named volumes declared in compose.
docker compose down --remove-orphans --volumes --rmi local

if [[ "${1:-}" == "--all" ]]; then
  echo "Running full docker system prune (this affects other projects too)..."
  docker system prune -af --volumes
fi

echo "Cleanup complete."