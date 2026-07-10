# MySQL backup helper (run on the host or a sidecar with DB credentials)
# Usage: ./scripts/backup-mysql.sh
set -euo pipefail

STAMP=$(date +%Y%m%d_%H%M%S)
OUT_DIR=${BACKUP_DIR:-./backups}
mkdir -p "$OUT_DIR"

HOST=${DB_HOST:-127.0.0.1}
PORT=${DB_PORT:-3306}
USER=${DB_USER:-flexiuser}
PASS=${DB_PASSWORD:?DB_PASSWORD required}
NAME=${DB_NAME:-flexibudget}

FILE="$OUT_DIR/${NAME}_${STAMP}.sql.gz"
mysqldump -h "$HOST" -P "$PORT" -u "$USER" -p"$PASS" --single-transaction --routines "$NAME" | gzip > "$FILE"
echo "Wrote $FILE"

# Keep last 14 backups
ls -1t "$OUT_DIR"/${NAME}_*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm --
