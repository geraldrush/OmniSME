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

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  cat <<'EOF'
Usage: scripts/create-super-admin.sh

Creates or updates a super-admin user in the users table.
- Prompts for email, full name, and password
- Hashes password using bcrypt in the user-service container
- Upserts admin user in Postgres with user_type='admin' and role='admin'
EOF
  exit 0
fi

echo "=== Create/Update Super Admin ==="

read -r -p "Admin email: " ADMIN_EMAIL
if [[ -z "$ADMIN_EMAIL" ]]; then
  echo "Email is required"
  exit 1
fi

read -r -p "Admin full name [Platform Admin]: " ADMIN_FULL_NAME
ADMIN_FULL_NAME="${ADMIN_FULL_NAME:-Platform Admin}"

read -r -s -p "Admin password: " ADMIN_PASSWORD
echo
read -r -s -p "Confirm password: " ADMIN_PASSWORD_CONFIRM
echo

if [[ -z "$ADMIN_PASSWORD" ]]; then
  echo "Password is required"
  exit 1
fi

if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]]; then
  echo "Passwords do not match"
  exit 1
fi

if [[ ${#ADMIN_PASSWORD} -lt 10 ]]; then
  echo "Password must be at least 10 characters"
  exit 1
fi

echo "Ensuring containers are running..."
docker compose up -d postgres user-service >/dev/null

echo "Generating bcrypt hash..."
PASSWORD_HASH="$({
  docker compose exec -T \
    -e ADMIN_PASSWORD="$ADMIN_PASSWORD" \
    user-service \
    node -e 'const bcrypt=require("bcrypt"); process.stdout.write(bcrypt.hashSync(process.env.ADMIN_PASSWORD,10));'
} | tr -d '\r\n')"

if [[ -z "$PASSWORD_HASH" ]]; then
  echo "Failed to generate password hash"
  exit 1
fi

echo "Creating/updating super-admin record..."
docker compose exec -T postgres psql -U sme_user -d sme_ecommerce \
  -v admin_email="$ADMIN_EMAIL" \
  -v admin_full_name="$ADMIN_FULL_NAME" \
  -v admin_password_hash="$PASSWORD_HASH" \
  -c "INSERT INTO users (email, password_hash, full_name, user_type, role, is_active, created_at, updated_at)
      VALUES (:'admin_email', :'admin_password_hash', :'admin_full_name', 'admin', 'admin', true, NOW(), NOW())
      ON CONFLICT (email)
      DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        user_type = 'admin',
        role = 'admin',
        is_active = true,
        updated_at = NOW();"

echo
echo "✅ Super-admin is ready: $ADMIN_EMAIL"
echo "You can now log in on the admin panel."
