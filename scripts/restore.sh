#!/bin/bash
# Restore script for Honarestan Hadi website
# Usage: ./scripts/restore.sh [timestamp]

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
DB_FILE="${DATABASE_URL:-file:./dev.db}"
DB_PATH="${DB_FILE#file:}"
UPLOADS_DIR="./public/uploads"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Honarestan Hadi Restore System ===${NC}"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}Error: Backup directory not found at $BACKUP_DIR${NC}"
    exit 1
fi

# List available backups
echo "Available database backups:"
ls -1 "$BACKUP_DIR"/db_backup_*.sqlite 2>/dev/null | sort -r | head -10

echo ""
echo "Available upload backups:"
ls -1 "$BACKUP_DIR"/uploads_backup_*.tar.gz 2>/dev/null | sort -r | head -10

echo ""

# Get timestamp from argument or prompt
if [ -n "$1" ]; then
    TIMESTAMP="$1"
else
    read -p "Enter backup timestamp (YYYYMMDD_HHMMSS): " TIMESTAMP
fi

# Validate timestamp
if [ -z "$TIMESTAMP" ]; then
    echo -e "${RED}Error: No timestamp provided${NC}"
    exit 1
fi

# Confirm restoration
echo ""
echo -e "${YELLOW}WARNING: This will overwrite current data!${NC}"
echo "Database: $BACKUP_DIR/db_backup_${TIMESTAMP}.sqlite"
echo "Uploads: $BACKUP_DIR/uploads_backup_${TIMESTAMP}.tar.gz"
echo ""
read -p "Are you sure you want to restore? (y/N): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Stop the server (if running)
echo -e "${YELLOW}Stopping server if running...${NC}"
pkill -f "next start" 2>/dev/null || true
sleep 2

# Backup current state before restore
echo -e "${YELLOW}Backing up current state before restore...${NC}"
PRE_RESTORE_DIR="$BACKUP_DIR/pre_restore_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$PRE_RESTORE_DIR"
[ -f "$DB_PATH" ] && cp "$DB_PATH" "$PRE_RESTORE_DIR/"
[ -d "$UPLOADS_DIR" ] && cp -r "$UPLOADS_DIR" "$PRE_RESTORE_DIR/"

# Restore database
echo -e "${YELLOW}Restoring database...${NC}"
if [ -f "$BACKUP_DIR/db_backup_${TIMESTAMP}.sqlite" ]; then
    cp "$BACKUP_DIR/db_backup_${TIMESTAMP}.sqlite" "$DB_PATH"
    echo -e "${GREEN}Database restored successfully${NC}"
else
    echo -e "${RED}Warning: Database backup not found${NC}"
fi

# Restore uploads
echo -e "${YELLOW}Restoring uploads...${NC}"
if [ -f "$BACKUP_DIR/uploads_backup_${TIMESTAMP}.tar.gz" ]; then
    rm -rf "$UPLOADS_DIR"
    tar -xzf "$BACKUP_DIR/uploads_backup_${TIMESTAMP}.tar.gz" -C "$(dirname $UPLOADS_DIR)"
    echo -e "${GREEN}Uploads restored successfully${NC}"
else
    echo -e "${YELLOW}No uploads backup found, skipping...${NC}"
fi

echo ""
echo -e "${GREEN}=== Restore completed successfully ===${NC}"
echo "Previous state backed up to: $PRE_RESTORE_DIR"
echo ""
echo "You can now start the server with: npm start"
