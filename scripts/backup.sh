#!/bin/bash
# Backup script for Honarestan Hadi website
# Usage: ./scripts/backup.sh

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_FILE="${DATABASE_URL:-file:./dev.db}"
DB_PATH="${DB_FILE#file:}"
UPLOADS_DIR="./public/uploads"
MAX_BACKUPS=30  # Keep last 30 backups

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Honarestan Hadi Backup System ===${NC}"
echo "Started at: $(date)"

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup database
echo -e "${YELLOW}Backing up database...${NC}"
if [ -f "$DB_PATH" ]; then
    cp "$DB_PATH" "$BACKUP_DIR/db_backup_${TIMESTAMP}.sqlite"
    echo -e "${GREEN}Database backed up to: $BACKUP_DIR/db_backup_${TIMESTAMP}.sqlite${NC}"
else
    echo -e "${RED}Warning: Database file not found at $DB_PATH${NC}"
fi

# Backup uploads
echo -e "${YELLOW}Backing up uploads...${NC}"
if [ -d "$UPLOADS_DIR" ]; then
    tar -czf "$BACKUP_DIR/uploads_backup_${TIMESTAMP}.tar.gz" -C "$(dirname $UPLOADS_DIR)" "$(basename $UPLOADS_DIR)"
    echo -e "${GREEN}Uploads backed up to: $BACKUP_DIR/uploads_backup_${TIMESTAMP}.tar.gz${NC}"
else
    echo -e "${YELLOW}No uploads directory found, skipping...${NC}"
fi

# Backup .env file
echo -e "${YELLOW}Backing up configuration...${NC}"
if [ -f ".env" ]; then
    cp ".env" "$BACKUP_DIR/env_backup_${TIMESTAMP}"
    echo -e "${GREEN}Config backed up to: $BACKUP_DIR/env_backup_${TIMESTAMP}${NC}"
fi

# Clean old backups
echo -e "${YELLOW}Cleaning old backups (keeping last $MAX_BACKUPS)...${NC}"
cd "$BACKUP_DIR"
ls -t db_backup_*.sqlite 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f
ls -t uploads_backup_*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f
ls -t env_backup_* 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm -f
cd ..

echo -e "${GREEN}=== Backup completed successfully ===${NC}"
echo "Finished at: $(date)"

# List backups
echo ""
echo "Available backups:"
ls -lh "$BACKUP_DIR"/ | grep -v "^total"
