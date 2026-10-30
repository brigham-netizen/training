#!/usr/bin/env bash
# copy-drive.sh - Copy everything from an external drive onto this Mac/Linux computer.
#
# Usage:
#   ./copy-drive.sh /Volumes/MyExternalDrive ~/OldDrive
#
# - Never deletes or changes anything on the source drive.
# - Safe to re-run: files already copied are skipped, so an interrupted copy resumes.
# - Writes a log file next to the destination folder.
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <source-drive-path> <destination-folder>" >&2
  exit 2
fi
src="${1%/}"
dst="${2%/}"

[ -d "$src" ] || { echo "Source '$src' not found. Is the external drive plugged in?" >&2; exit 1; }
mkdir -p "$dst"

# Make sure the destination has room (sizes in KB).
need_kb=$(df -Pk "$src" | awk 'NR==2 {print $3}')
free_kb=$(df -Pk "$dst" | awk 'NR==2 {print $4}')
echo "Source uses ~$((need_kb / 1024 / 1024)) GB; destination has $((free_kb / 1024 / 1024)) GB free."
if [ "$need_kb" -gt "$free_kb" ]; then
  echo "Not enough free space on the destination drive." >&2
  exit 1
fi

log="$(dirname "$dst")/drive-copy-$(date +%Y%m%d-%H%M%S).log"
echo "Copying... log: $log"

# -a keeps folders, timestamps and permissions; --partial lets big files resume.
# The excludes skip macOS/Windows housekeeping folders found on external drives.
set +e
rsync -a --partial --stats --human-readable \
  --exclude '.Spotlight-V100' --exclude '.Trashes' --exclude '.fseventsd' \
  --exclude 'System Volume Information' --exclude '$RECYCLE.BIN' \
  "$src/" "$dst/" 2>&1 | tee "$log"
status=${PIPESTATUS[0]}
set -e

if [ "$status" -ne 0 ]; then
  echo "Some files could not be copied (rsync code $status). Check the log, then re-run this script to retry." >&2
  exit 1
fi
echo "Done. Re-run the same command any time to verify - it should transfer 0 files."
