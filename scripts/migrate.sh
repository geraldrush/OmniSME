#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

MIGRATIONS_DIR="${MIGRATIONS_DIR:-database/migrations}"
DATABASE_URL="${DATABASE_URL:-}"

usage() {
  cat <<'EOF'
Usage: scripts/migrate.sh [--baseline] [--status]

Runs SQL migrations against DATABASE_URL and tracks applied files in schema_migrations.

Options:
  --baseline   Apply database/init.sql once as migration id "000_baseline_init.sql".
  --status     Show applied/pending migration status only.

Environment:
  DATABASE_URL      Required. Example: postgresql://.../postgres?sslmode=require
  MIGRATIONS_DIR    Optional. Defaults to database/migrations
EOF
}

BASELINE_MODE=false
STATUS_ONLY=false

for arg in "$@"; do
  case "$arg" in
    --baseline) BASELINE_MODE=true ;;
    --status) STATUS_ONLY=true ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $arg"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL is required"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required. Install PostgreSQL client tools and retry."
  exit 1
fi

mkdir -p "$MIGRATIONS_DIR"

psql "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  id BIGSERIAL PRIMARY KEY,
  migration_name TEXT UNIQUE NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT NOW()
);
SQL

apply_migration_file() {
  local file_path="$1"
  local file_name
  file_name="$(basename "$file_path")"

  local already_applied
  already_applied="$(psql "$DATABASE_URL" -tA -c "SELECT 1 FROM schema_migrations WHERE migration_name = '$file_name' LIMIT 1;")"

  if [[ "$already_applied" == "1" ]]; then
    echo "⏭  Skipping already applied migration: $file_name"
    return 0
  fi

  echo "▶ Applying migration: $file_name"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file_path"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "INSERT INTO schema_migrations (migration_name) VALUES ('$file_name');"
  echo "✅ Applied: $file_name"
}

if [[ "$BASELINE_MODE" == "true" ]]; then
  BASELINE_NAME="000_baseline_init.sql"
  BASELINE_APPLIED="$(psql "$DATABASE_URL" -tA -c "SELECT 1 FROM schema_migrations WHERE migration_name = '$BASELINE_NAME' LIMIT 1;")"
  if [[ "$BASELINE_APPLIED" == "1" ]]; then
    echo "⏭  Baseline already applied"
  else
    echo "▶ Applying baseline from database/init.sql"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/init.sql
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "INSERT INTO schema_migrations (migration_name) VALUES ('$BASELINE_NAME');"
    echo "✅ Baseline applied"
  fi
fi

if [[ "$STATUS_ONLY" == "true" ]]; then
  echo
  echo "Applied migrations:"
  psql "$DATABASE_URL" -c "SELECT migration_name, applied_at FROM schema_migrations ORDER BY migration_name;"
  echo
  echo "Pending migrations:"
  pending_count=0
  while IFS= read -r file; do
    name="$(basename "$file")"
    applied="$(psql "$DATABASE_URL" -tA -c "SELECT 1 FROM schema_migrations WHERE migration_name = '$name' LIMIT 1;")"
    if [[ "$applied" != "1" ]]; then
      echo "- $name"
      pending_count=$((pending_count + 1))
    fi
  done < <(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' | sort)

  if [[ "$pending_count" -eq 0 ]]; then
    echo "- none"
  fi
  exit 0
fi

found=false
while IFS= read -r migration_file; do
  found=true
  apply_migration_file "$migration_file"
done < <(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' | sort)

if [[ "$found" == "false" ]]; then
  echo "No migration files found in $MIGRATIONS_DIR"
fi

echo "🎉 Migration run complete"
